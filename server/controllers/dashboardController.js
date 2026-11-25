const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const MedicalRecord = require("../models/MedicalRecord");
const Pet = require("../models/Pet");
const Prescription = require("../models/Prescription");
const User = require("../models/User");

const appointmentPopulate = [
  { path: "pet", select: "petName species breed petImage" },
  { path: "owner", select: "fullName" },
  {
    path: "doctor",
    select: "specialization clinicName user",
    populate: { path: "user", select: "fullName avatar" }
  }
];

const sendError = (res, error) => {
  console.error(error.message);
  return res.status(500).json({ success: false, message: "Server Error" });
};

const statusMap = (rows, allowedStatuses) => {
  const result = Object.fromEntries(allowedStatuses.map((status) => [status, 0]));
  rows.forEach((row) => {
    if (Object.hasOwn(result, row._id)) result[row._id] = row.count;
  });
  return result;
};

const appointmentStatusCounts = async (match) => {
  const rows = await Appointment.aggregate([
    { $match: match },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  return statusMap(rows, ["pending", "confirmed", "completed", "cancelled"]);
};

const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();
    const [
      totalPets,
      appointmentStats,
      activePrescriptions,
      medicalRecords,
      upcomingAppointments,
      recentPrescriptions
    ] = await Promise.all([
      Pet.countDocuments({ owner: ownerId }),
      appointmentStatusCounts({ owner: ownerId }),
      Prescription.countDocuments({ owner: ownerId, isRevoked: false }),
      MedicalRecord.countDocuments({ owner: ownerId, isRevoked: false }),
      Appointment.find({
        owner: ownerId,
        status: { $in: ["pending", "confirmed"] },
        scheduledAt: { $gte: now }
      })
        .populate(appointmentPopulate)
        .sort({ scheduledAt: 1 })
        .limit(5),
      Prescription.find({ owner: ownerId })
        .populate([
          { path: "pet", select: "petName species petImage" },
          {
            path: "doctor",
            select: "specialization user",
            populate: { path: "user", select: "fullName" }
          }
        ])
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        totals: {
          pets: totalPets,
          appointments: Object.values(appointmentStats).reduce((sum, count) => sum + count, 0),
          activePrescriptions,
          medicalRecords
        },
        appointmentStats,
        upcomingAppointments,
        recentPrescriptions
      }
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getDoctorDashboard = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id })
      .populate("user", "fullName email mobile avatar");
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
    const doctorId = doctor._id;

    const [
      appointmentStats,
      patientIds,
      todayAppointments,
      upcomingAppointments,
      prescriptionsIssued,
      medicalRecordsCreated,
      completedValue
    ] = await Promise.all([
      appointmentStatusCounts({ doctor: doctorId }),
      Appointment.distinct("pet", {
        doctor: doctorId,
        status: { $in: ["confirmed", "completed"] }
      }),
      Appointment.find({
        doctor: doctorId,
        scheduledAt: { $gte: startOfDay, $lt: endOfDay },
        status: { $in: ["pending", "confirmed"] }
      })
        .populate(appointmentPopulate)
        .sort({ scheduledAt: 1 }),
      Appointment.find({
        doctor: doctorId,
        scheduledAt: { $gte: now },
        status: { $in: ["pending", "confirmed"] }
      })
        .populate(appointmentPopulate)
        .sort({ scheduledAt: 1 })
        .limit(10),
      Prescription.countDocuments({ doctor: doctorId, isRevoked: false }),
      MedicalRecord.countDocuments({ doctor: doctorId, isRevoked: false }),
      Appointment.aggregate([
        { $match: { doctor: doctorId, status: "completed" } },
        { $group: { _id: null, value: { $sum: "$consultationFee" } } }
      ])
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        doctor,
        totals: {
          patients: patientIds.length,
          appointments: Object.values(appointmentStats).reduce((sum, count) => sum + count, 0),
          prescriptionsIssued,
          medicalRecordsCreated,
          completedConsultationValue: completedValue[0]?.value || 0
        },
        appointmentStats,
        today: {
          timezone: "UTC",
          totalAppointments: todayAppointments.length,
          appointments: todayAppointments
        },
        upcomingAppointments
      }
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [
      userRows,
      doctorRows,
      appointmentStats,
      totalPets,
      activePrescriptions,
      medicalRecords,
      newUsersLast30Days,
      recentAppointments
    ] = await Promise.all([
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Doctor.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            verified: { $sum: { $cond: ["$isVerified", 1, 0] } },
            active: { $sum: { $cond: ["$isActive", 1, 0] } },
            pendingVerification: {
              $sum: { $cond: [{ $eq: ["$isVerified", false] }, 1, 0] }
            }
          }
        }
      ]),
      appointmentStatusCounts({}),
      Pet.countDocuments(),
      Prescription.countDocuments({ isRevoked: false }),
      MedicalRecord.countDocuments({ isRevoked: false }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Appointment.find()
        .populate(appointmentPopulate)
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const userStats = statusMap(userRows, ["petOwner", "vet", "admin"]);
    const doctorStats = doctorRows[0] || {
      total: 0,
      verified: 0,
      active: 0,
      pendingVerification: 0
    };

    return res.status(200).json({
      success: true,
      dashboard: {
        totals: {
          users: Object.values(userStats).reduce((sum, count) => sum + count, 0),
          pets: totalPets,
          doctors: doctorStats.total,
          appointments: Object.values(appointmentStats).reduce((sum, count) => sum + count, 0),
          activePrescriptions,
          medicalRecords
        },
        userStats,
        doctorStats,
        appointmentStats,
        newUsersLast30Days,
        recentAppointments
      }
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  getOwnerDashboard,
  getDoctorDashboard,
  getAdminDashboard
};
