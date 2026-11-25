const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Pet = require("../models/Pet");

const appointmentPopulate = [
  { path: "owner", select: "fullName email mobile" },
  { path: "pet", select: "petName species breed age gender petImage" },
  {
    path: "doctor",
    select: "specialization clinicName clinicAddress consultationFee user",
    populate: { path: "user", select: "fullName avatar" }
  }
];

const sendError = (res, error) => {
  console.error(error.message);
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ success: false, message: error.message });
  }
  return res.status(500).json({ success: false, message: "Server Error" });
};

const parseSchedule = (scheduledAt, durationMinutes = 30) => {
  const start = new Date(scheduledAt);
  const duration = Number(durationMinutes);

  if (
    Number.isNaN(start.getTime()) ||
    !Number.isInteger(duration) ||
    duration < 15 ||
    duration > 180 ||
    duration % 15 !== 0
  ) {
    return null;
  }

  return {
    start,
    end: new Date(start.getTime() + duration * 60 * 1000),
    duration
  };
};

const hasConflict = async ({ doctorId, petId, start, end, excludeId }) => {
  const filter = {
    status: { $in: ["pending", "confirmed"] },
    scheduledAt: { $lt: end },
    endsAt: { $gt: start },
    $or: [{ doctor: doctorId }, ...(petId ? [{ pet: petId }] : [])]
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return Appointment.exists(filter);
};

const getDoctorForVet = (userId) => Doctor.findOne({ user: userId }).select("_id");

const createAppointment = async (req, res) => {
  try {
    const { petId, petName, species, doctorId, scheduledAt, durationMinutes, reason, ownerNotes } = req.body;
    if ((petId && !mongoose.isValidObjectId(petId)) || !mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({ success: false, message: "Valid pet and doctor IDs are required" });
    }
    if (!petId && (typeof petName !== 'string' || !petName.trim() || petName.length > 100 || typeof species !== 'string' || !species.trim() || species.length > 50)) {
      return res.status(400).json({ success: false, message: 'Pet name and species are required' });
    }
    if (typeof reason !== "string" || !reason.trim()) {
      return res.status(400).json({ success: false, message: "Appointment reason is required" });
    }

    const schedule = parseSchedule(scheduledAt, durationMinutes ?? 30);
    if (!schedule) {
      return res.status(400).json({
        success: false,
        message: "Valid schedule and duration (15-180 minutes in 15-minute intervals) are required"
      });
    }
    if (schedule.start <= new Date()) {
      return res.status(400).json({ success: false, message: "Appointment must be scheduled in the future" });
    }

    const [pet, doctor] = await Promise.all([
      petId ? Pet.findOne({ _id: petId, owner: req.user.id }) : Promise.resolve(null),
      Doctor.findOne({ _id: doctorId, isActive: true, $or: [{ isVerified: true }, { isDemo: true }] })
    ]);
    if (petId && !pet) {
      return res.status(404).json({ success: false, message: "Pet not found or does not belong to you" });
    }
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Active verified doctor not found" });
    }

    if (await hasConflict({
      doctorId: doctor._id,
      petId: pet?._id,
      start: schedule.start,
      end: schedule.end
    })) {
      return res.status(409).json({
        success: false,
        message: "Doctor or pet already has an appointment during this time"
      });
    }

    const appointment = await Appointment.create({
      owner: req.user.id,
      pet: pet?._id || null,
      petDetails: { petName: pet?.petName || petName.trim(), species: pet?.species || species.trim() },
      doctor: doctor._id,
      isDemo: doctor.isDemo === true,
      scheduledAt: schedule.start,
      durationMinutes: schedule.duration,
      endsAt: schedule.end,
      reason,
      ownerNotes,
      consultationFee: doctor.consultationFee
    });
    await appointment.populate(appointmentPopulate);

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const listAppointments = async (req, res, filter) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50);
  if (["pending", "confirmed", "completed", "cancelled"].includes(req.query.status)) {
    filter.status = req.query.status;
  }

  const [appointments, totalAppointments] = await Promise.all([
    Appointment.find(filter)
      .populate(appointmentPopulate)
      .sort({ scheduledAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Appointment.countDocuments(filter)
  ]);

  return res.status(200).json({
    success: true,
    totalAppointments,
    page,
    totalPages: Math.ceil(totalAppointments / limit),
    appointments
  });
};

const getMyAppointments = async (req, res) => {
  try {
    return await listAppointments(req, res, { owner: req.user.id });
  } catch (error) {
    return sendError(res, error);
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await getDoctorForVet(req.user.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    return await listAppointments(req, res, { doctor: doctor._id });
  } catch (error) {
    return sendError(res, error);
  }
};

const getAdminAppointments = async (req, res) => {
  try {
    return await listAppointments(req, res, {});
  } catch (error) {
    return sendError(res, error);
  }
};

const getAppointmentById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Appointment ID" });
    }
    const appointment = await Appointment.findById(req.params.id).populate(appointmentPopulate);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    let canAccess = req.user.role === "admin" || appointment.owner._id.toString() === req.user.id;
    if (req.user.role === "vet") {
      const doctor = await getDoctorForVet(req.user.id);
      canAccess = doctor && appointment.doctor._id.toString() === doctor._id.toString();
    }
    if (!canAccess) {
      return res.status(403).json({ success: false, message: "You cannot access this appointment" });
    }

    return res.status(200).json({ success: true, appointment });
  } catch (error) {
    return sendError(res, error);
  }
};

const rescheduleAppointment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Appointment ID" });
    }
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    if (req.user.role !== "admin" && appointment.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only reschedule your own appointment" });
    }
    if (!["pending", "confirmed"].includes(appointment.status)) {
      return res.status(409).json({ success: false, message: "This appointment cannot be rescheduled" });
    }

    const schedule = parseSchedule(
      req.body.scheduledAt,
      req.body.durationMinutes ?? appointment.durationMinutes
    );
    if (!schedule || schedule.start <= new Date()) {
      return res.status(400).json({ success: false, message: "A valid future schedule is required" });
    }
    if (await hasConflict({
      doctorId: appointment.doctor,
      petId: appointment.pet,
      start: schedule.start,
      end: schedule.end,
      excludeId: appointment._id
    })) {
      return res.status(409).json({
        success: false,
        message: "Doctor or pet already has an appointment during this time"
      });
    }

    appointment.scheduledAt = schedule.start;
    appointment.durationMinutes = schedule.duration;
    appointment.endsAt = schedule.end;
    appointment.status = "pending";
    await appointment.save();
    await appointment.populate(appointmentPopulate);

    return res.status(200).json({
      success: true,
      message: "Appointment rescheduled and sent for confirmation",
      appointment
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Appointment ID" });
    }
    if (!["confirmed", "completed"].includes(req.body.status)) {
      return res.status(400).json({ success: false, message: "Status must be confirmed or completed" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    if (req.user.role === "vet") {
      const doctor = await getDoctorForVet(req.user.id);
      if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({ success: false, message: "You can only manage your own appointments" });
      }
    }

    const allowedTransition = (
      (appointment.status === "pending" && req.body.status === "confirmed") ||
      (appointment.status === "confirmed" && req.body.status === "completed")
    );
    if (!allowedTransition) {
      return res.status(409).json({ success: false, message: "Invalid appointment status transition" });
    }
    if (req.body.status === "completed" && appointment.scheduledAt > new Date()) {
      return res.status(409).json({ success: false, message: "Future appointment cannot be completed" });
    }

    appointment.status = req.body.status;
    await appointment.save();
    await appointment.populate(appointmentPopulate);
    return res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      appointment
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const cancelAppointment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Appointment ID" });
    }
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    let canCancel = req.user.role === "admin" || appointment.owner.toString() === req.user.id;
    if (req.user.role === "vet") {
      const doctor = await getDoctorForVet(req.user.id);
      canCancel = doctor && appointment.doctor.toString() === doctor._id.toString();
    }
    if (!canCancel) {
      return res.status(403).json({ success: false, message: "You cannot cancel this appointment" });
    }
    if (["completed", "cancelled"].includes(appointment.status)) {
      return res.status(409).json({ success: false, message: "This appointment cannot be cancelled" });
    }
    if (typeof req.body.reason !== "string" || !req.body.reason.trim()) {
      return res.status(400).json({ success: false, message: "Cancellation reason is required" });
    }

    appointment.status = "cancelled";
    appointment.cancelledBy = req.user.id;
    appointment.cancellationReason = req.body.reason;
    appointment.cancelledAt = new Date();
    await appointment.save();
    await appointment.populate(appointmentPopulate);

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAdminAppointments,
  getAppointmentById,
  rescheduleAppointment,
  updateAppointmentStatus,
  cancelAppointment
};
