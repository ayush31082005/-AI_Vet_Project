const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const MedicalRecord = require("../models/MedicalRecord");
const Pet = require("../models/Pet");
const Prescription = require("../models/Prescription");

const recordPopulate = [
  { path: "pet", select: "petName species breed age gender petImage" },
  { path: "createdBy", select: "fullName role" },
  {
    path: "doctor",
    select: "specialization clinicName user",
    populate: { path: "user", select: "fullName avatar" }
  },
  { path: "appointment", select: "scheduledAt status reason" }
];

const sendError = (res, error) => {
  console.error(error.message);
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ success: false, message: error.message });
  }
  return res.status(500).json({ success: false, message: "Server Error" });
};

const getVetProfile = (userId) => Doctor.findOne({ user: userId }).select("_id");

const getPetAccess = async (petId, user) => {
  const pet = await Pet.findById(petId).select("owner petName species breed age gender petImage");
  if (!pet) return { pet: null, allowed: false, doctor: null };
  if (user.role === "admin" || pet.owner.toString() === user.id) {
    return { pet, allowed: true, doctor: null };
  }
  if (user.role !== "vet") return { pet, allowed: false, doctor: null };

  const doctor = await getVetProfile(user.id);
  if (!doctor) return { pet, allowed: false, doctor: null };
  const relationship = await Appointment.exists({
    pet: pet._id,
    doctor: doctor._id,
    status: { $in: ["confirmed", "completed"] }
  });
  return { pet, allowed: Boolean(relationship), doctor };
};

const parseRecordDate = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? null : date;
};

const createMedicalRecord = async (req, res) => {
  try {
    const { petId, appointmentId, recordType, title, details, recordDate, vitals } = req.body;
    if (!mongoose.isValidObjectId(petId)) {
      return res.status(400).json({ success: false, message: "Valid Pet ID is required" });
    }
    if (
      typeof recordType !== "string" ||
      typeof title !== "string" || !title.trim() ||
      typeof details !== "string" || !details.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Record type, title and details are required"
      });
    }

    const parsedDate = parseRecordDate(recordDate);
    if (!parsedDate || parsedDate > new Date()) {
      return res.status(400).json({ success: false, message: "Record date must be valid and not in the future" });
    }

    let pet;
    let doctor = null;
    let appointment = null;
    let source;

    if (req.user.role === "petOwner") {
      pet = await Pet.findOne({ _id: petId, owner: req.user.id });
      if (!pet) {
        return res.status(404).json({ success: false, message: "Pet not found or does not belong to you" });
      }
      const ownerTypes = ["vaccination", "surgery", "allergy", "condition", "note"];
      if (!ownerTypes.includes(recordType)) {
        return res.status(403).json({
          success: false,
          message: "Owners cannot create clinical consultation or lab records"
        });
      }
      source = "owner";
    } else {
      if (!mongoose.isValidObjectId(appointmentId)) {
        return res.status(400).json({
          success: false,
          message: "Valid Appointment ID is required for veterinarian records"
        });
      }
      doctor = await getVetProfile(req.user.id);
      if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor profile not found" });
      }
      appointment = await Appointment.findOne({
        _id: appointmentId,
        pet: petId,
        doctor: doctor._id,
        status: { $in: ["confirmed", "completed"] }
      });
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Eligible appointment assigned to you was not found for this pet"
        });
      }
      if (appointment.scheduledAt > new Date()) {
        return res.status(409).json({
          success: false,
          message: "Clinical record cannot be created before the appointment time"
        });
      }
      pet = await Pet.findById(petId);
      source = "veterinarian";
    }

    const medicalRecord = await MedicalRecord.create({
      owner: pet.owner,
      pet: pet._id,
      doctor: doctor?._id || null,
      appointment: appointment?._id || null,
      createdBy: req.user.id,
      source,
      recordType,
      title,
      details,
      recordDate: parsedDate,
      vitals
    });
    await medicalRecord.populate(recordPopulate);

    return res.status(201).json({
      success: true,
      message: "Medical record created successfully",
      medicalRecord
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const listRecords = async (req, res, filter) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50);
  const allowedTypes = MedicalRecord.schema.path("recordType").enumValues;
  if (allowedTypes.includes(req.query.recordType)) filter.recordType = req.query.recordType;
  if (req.query.isRevoked === "true" || req.query.isRevoked === "false") {
    filter.isRevoked = req.query.isRevoked === "true";
  }

  const [medicalRecords, totalRecords] = await Promise.all([
    MedicalRecord.find(filter)
      .populate(recordPopulate)
      .sort({ recordDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    MedicalRecord.countDocuments(filter)
  ]);
  return res.status(200).json({
    success: true,
    totalRecords,
    page,
    totalPages: Math.ceil(totalRecords / limit),
    medicalRecords
  });
};

const getMyMedicalRecords = async (req, res) => {
  try {
    return await listRecords(req, res, { owner: req.user.id });
  } catch (error) {
    return sendError(res, error);
  }
};

const getDoctorMedicalRecords = async (req, res) => {
  try {
    const doctor = await getVetProfile(req.user.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    return await listRecords(req, res, { doctor: doctor._id });
  } catch (error) {
    return sendError(res, error);
  }
};

const getAdminMedicalRecords = async (req, res) => {
  try {
    const filter = {};
    if (req.query.petId !== undefined) {
      if (!mongoose.isValidObjectId(req.query.petId)) {
        return res.status(400).json({ success: false, message: "Invalid Pet ID" });
      }
      filter.pet = req.query.petId;
    }
    return await listRecords(req, res, filter);
  } catch (error) {
    return sendError(res, error);
  }
};

const getPetMedicalTimeline = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.petId)) {
      return res.status(400).json({ success: false, message: "Invalid Pet ID" });
    }
    const access = await getPetAccess(req.params.petId, req.user);
    if (!access.pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }
    if (!access.allowed) {
      return res.status(403).json({ success: false, message: "You cannot access this pet's medical history" });
    }

    const [records, appointments, prescriptions] = await Promise.all([
      MedicalRecord.find({ pet: access.pet._id })
        .populate(recordPopulate)
        .sort({ recordDate: -1 })
        .lean(),
      Appointment.find({
        pet: access.pet._id,
        status: { $in: ["confirmed", "completed"] },
        scheduledAt: { $lte: new Date() }
      })
        .populate({
          path: "doctor",
          select: "specialization clinicName user",
          populate: { path: "user", select: "fullName avatar" }
        })
        .sort({ scheduledAt: -1 })
        .lean(),
      Prescription.find({ pet: access.pet._id })
        .populate({
          path: "doctor",
          select: "specialization clinicName user",
          populate: { path: "user", select: "fullName avatar" }
        })
        .sort({ createdAt: -1 })
        .lean()
    ]);

    const timeline = [
      ...records.map((record) => ({
        eventType: "medical_record",
        eventDate: record.recordDate,
        data: record
      })),
      ...appointments.map((appointment) => ({
        eventType: "appointment",
        eventDate: appointment.scheduledAt,
        data: appointment
      })),
      ...prescriptions.map((prescription) => ({
        eventType: "prescription",
        eventDate: prescription.createdAt,
        data: prescription
      }))
    ].sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

    return res.status(200).json({
      success: true,
      pet: access.pet,
      totalEvents: timeline.length,
      timeline
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getMedicalRecordById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Medical Record ID" });
    }
    const medicalRecord = await MedicalRecord.findById(req.params.id);
    if (!medicalRecord) {
      return res.status(404).json({ success: false, message: "Medical record not found" });
    }
    const access = await getPetAccess(medicalRecord.pet, req.user);
    if (!access.allowed) {
      return res.status(403).json({ success: false, message: "You cannot access this medical record" });
    }
    await medicalRecord.populate(recordPopulate);
    return res.status(200).json({ success: true, medicalRecord });
  } catch (error) {
    return sendError(res, error);
  }
};

const updateMedicalRecord = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Medical Record ID" });
    }
    const medicalRecord = await MedicalRecord.findById(req.params.id);
    if (!medicalRecord) {
      return res.status(404).json({ success: false, message: "Medical record not found" });
    }
    if (medicalRecord.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only update records created by you" });
    }
    if (medicalRecord.isRevoked) {
      return res.status(409).json({ success: false, message: "Revoked medical record cannot be updated" });
    }

    let hasChanges = false;
    for (const field of ["recordType", "title", "details", "vitals"]) {
      if (req.body[field] !== undefined) {
        if (
          field === "recordType" &&
          medicalRecord.source === "owner" &&
          !["vaccination", "surgery", "allergy", "condition", "note"].includes(req.body[field])
        ) {
          return res.status(403).json({
            success: false,
            message: "Owner records cannot use clinical consultation or lab types"
          });
        }
        medicalRecord[field] = req.body[field];
        hasChanges = true;
      }
    }
    if (req.body.recordDate !== undefined) {
      const recordDate = parseRecordDate(req.body.recordDate);
      if (!recordDate || recordDate > new Date()) {
        return res.status(400).json({ success: false, message: "Record date must be valid and not in the future" });
      }
      medicalRecord.recordDate = recordDate;
      hasChanges = true;
    }
    if (!hasChanges) {
      return res.status(400).json({ success: false, message: "Provide at least one medical record field to update" });
    }

    medicalRecord.revision += 1;
    await medicalRecord.save();
    await medicalRecord.populate(recordPopulate);
    return res.status(200).json({
      success: true,
      message: "Medical record updated successfully",
      medicalRecord
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const revokeMedicalRecord = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Medical Record ID" });
    }
    if (typeof req.body.reason !== "string" || !req.body.reason.trim()) {
      return res.status(400).json({ success: false, message: "Revocation reason is required" });
    }
    const medicalRecord = await MedicalRecord.findById(req.params.id);
    if (!medicalRecord) {
      return res.status(404).json({ success: false, message: "Medical record not found" });
    }
    if (req.user.role !== "admin" && medicalRecord.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only revoke records created by you" });
    }
    if (medicalRecord.isRevoked) {
      return res.status(409).json({ success: false, message: "Medical record is already revoked" });
    }

    medicalRecord.isRevoked = true;
    medicalRecord.revokedBy = req.user.id;
    medicalRecord.revokedAt = new Date();
    medicalRecord.revocationReason = req.body.reason;
    await medicalRecord.save();
    await medicalRecord.populate(recordPopulate);
    return res.status(200).json({
      success: true,
      message: "Medical record revoked successfully",
      medicalRecord
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  createMedicalRecord,
  getMyMedicalRecords,
  getDoctorMedicalRecords,
  getAdminMedicalRecords,
  getPetMedicalTimeline,
  getMedicalRecordById,
  updateMedicalRecord,
  revokeMedicalRecord
};
