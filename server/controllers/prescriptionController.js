const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Prescription = require("../models/Prescription");

const prescriptionPopulate = [
  { path: "owner", select: "fullName email mobile" },
  { path: "pet", select: "petName species breed age gender petImage" },
  {
    path: "doctor",
    select: "specialization clinicName clinicAddress licenseNumber user",
    populate: { path: "user", select: "fullName avatar" }
  },
  { path: "appointment", select: "scheduledAt status reason" }
];

const sendError = (res, error) => {
  console.error(error.message);
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A prescription already exists for this appointment"
    });
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ success: false, message: error.message });
  }
  return res.status(500).json({ success: false, message: "Server Error" });
};

const getVetProfile = (userId) => Doctor.findOne({ user: userId }).select("_id");

const validMedicines = (medicines) => (
  Array.isArray(medicines) &&
  medicines.length > 0 &&
  medicines.length <= 25 &&
  medicines.every((medicine) => (
    medicine &&
    typeof medicine.name === "string" && medicine.name.trim() &&
    typeof medicine.dosage === "string" && medicine.dosage.trim() &&
    typeof medicine.frequency === "string" && medicine.frequency.trim() &&
    typeof medicine.duration === "string" && medicine.duration.trim()
  ))
);

const parseFollowUpDate = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const createPrescription = async (req, res) => {
  try {
    const { appointmentId, diagnosis, medicines, advice, followUpDate } = req.body;
    if (!mongoose.isValidObjectId(appointmentId)) {
      return res.status(400).json({ success: false, message: "Valid Appointment ID is required" });
    }
    if (typeof diagnosis !== "string" || !diagnosis.trim()) {
      return res.status(400).json({ success: false, message: "Diagnosis is required" });
    }
    if (!validMedicines(medicines)) {
      return res.status(400).json({
        success: false,
        message: "Each medicine requires name, dosage, frequency and duration"
      });
    }

    const parsedFollowUpDate = parseFollowUpDate(followUpDate);
    if (parsedFollowUpDate === undefined || (parsedFollowUpDate && parsedFollowUpDate <= new Date())) {
      return res.status(400).json({ success: false, message: "Follow-up date must be a valid future date" });
    }

    const doctor = await getVetProfile(req.user.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: doctor._id,
      status: { $in: ["confirmed", "completed"] }
    });
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Confirmed or completed appointment assigned to you was not found"
      });
    }
    if (appointment.scheduledAt > new Date()) {
      return res.status(409).json({
        success: false,
        message: "Prescription cannot be issued before the appointment time"
      });
    }

    const prescription = await Prescription.create({
      appointment: appointment._id,
      owner: appointment.owner,
      pet: appointment.pet,
      doctor: appointment.doctor,
      diagnosis,
      medicines,
      advice,
      followUpDate: parsedFollowUpDate
    });
    await prescription.populate(prescriptionPopulate);

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const listPrescriptions = async (req, res, filter) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50);
  if (req.query.isRevoked === "true" || req.query.isRevoked === "false") {
    filter.isRevoked = req.query.isRevoked === "true";
  }

  const [prescriptions, totalPrescriptions] = await Promise.all([
    Prescription.find(filter)
      .populate(prescriptionPopulate)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Prescription.countDocuments(filter)
  ]);

  return res.status(200).json({
    success: true,
    totalPrescriptions,
    page,
    totalPages: Math.ceil(totalPrescriptions / limit),
    prescriptions
  });
};

const getMyPrescriptions = async (req, res) => {
  try {
    return await listPrescriptions(req, res, { owner: req.user.id });
  } catch (error) {
    return sendError(res, error);
  }
};

const getDoctorPrescriptions = async (req, res) => {
  try {
    const doctor = await getVetProfile(req.user.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    return await listPrescriptions(req, res, { doctor: doctor._id });
  } catch (error) {
    return sendError(res, error);
  }
};

const getAdminPrescriptions = async (req, res) => {
  try {
    return await listPrescriptions(req, res, {});
  } catch (error) {
    return sendError(res, error);
  }
};

const canAccessPrescription = async (prescription, user) => {
  if (user.role === "admin" || prescription.owner.toString() === user.id) return true;
  if (user.role !== "vet") return false;
  const doctor = await getVetProfile(user.id);
  return Boolean(doctor && prescription.doctor.toString() === doctor._id.toString());
};

const getPrescriptionById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Prescription ID" });
    }
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }
    if (!await canAccessPrescription(prescription, req.user)) {
      return res.status(403).json({ success: false, message: "You cannot access this prescription" });
    }
    await prescription.populate(prescriptionPopulate);
    return res.status(200).json({ success: true, prescription });
  } catch (error) {
    return sendError(res, error);
  }
};

const getPrescriptionByAppointment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.appointmentId)) {
      return res.status(400).json({ success: false, message: "Invalid Appointment ID" });
    }
    const prescription = await Prescription.findOne({ appointment: req.params.appointmentId });
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }
    if (!await canAccessPrescription(prescription, req.user)) {
      return res.status(403).json({ success: false, message: "You cannot access this prescription" });
    }
    await prescription.populate(prescriptionPopulate);
    return res.status(200).json({ success: true, prescription });
  } catch (error) {
    return sendError(res, error);
  }
};

const updatePrescription = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Prescription ID" });
    }
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }
    const doctor = await getVetProfile(req.user.id);
    if (!doctor || prescription.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only update your own prescription" });
    }
    if (prescription.isRevoked) {
      return res.status(409).json({ success: false, message: "Revoked prescription cannot be updated" });
    }

    let hasChanges = false;
    if (req.body.diagnosis !== undefined) {
      if (typeof req.body.diagnosis !== "string" || !req.body.diagnosis.trim()) {
        return res.status(400).json({ success: false, message: "Diagnosis cannot be empty" });
      }
      prescription.diagnosis = req.body.diagnosis;
      hasChanges = true;
    }
    if (req.body.medicines !== undefined) {
      if (!validMedicines(req.body.medicines)) {
        return res.status(400).json({ success: false, message: "Invalid medicines list" });
      }
      prescription.medicines = req.body.medicines;
      hasChanges = true;
    }
    if (req.body.advice !== undefined) {
      prescription.advice = req.body.advice;
      hasChanges = true;
    }
    if (req.body.followUpDate !== undefined) {
      const followUpDate = parseFollowUpDate(req.body.followUpDate);
      if (followUpDate === undefined || (followUpDate && followUpDate <= new Date())) {
        return res.status(400).json({ success: false, message: "Follow-up date must be a valid future date" });
      }
      prescription.followUpDate = followUpDate;
      hasChanges = true;
    }
    if (!hasChanges) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one prescription field to update"
      });
    }

    prescription.revision += 1;
    await prescription.save();
    await prescription.populate(prescriptionPopulate);
    return res.status(200).json({
      success: true,
      message: "Prescription updated successfully",
      prescription
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const revokePrescription = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Prescription ID" });
    }
    if (typeof req.body.reason !== "string" || !req.body.reason.trim()) {
      return res.status(400).json({ success: false, message: "Revocation reason is required" });
    }
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }
    if (req.user.role === "vet") {
      const doctor = await getVetProfile(req.user.id);
      if (!doctor || prescription.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({ success: false, message: "You can only revoke your own prescription" });
      }
    }
    if (prescription.isRevoked) {
      return res.status(409).json({ success: false, message: "Prescription is already revoked" });
    }

    prescription.isRevoked = true;
    prescription.revokedBy = req.user.id;
    prescription.revokedAt = new Date();
    prescription.revocationReason = req.body.reason;
    await prescription.save();
    await prescription.populate(prescriptionPopulate);
    return res.status(200).json({
      success: true,
      message: "Prescription revoked successfully",
      prescription
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  createPrescription,
  getMyPrescriptions,
  getDoctorPrescriptions,
  getAdminPrescriptions,
  getPrescriptionById,
  getPrescriptionByAppointment,
  updatePrescription,
  revokePrescription
};
