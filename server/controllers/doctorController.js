const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

const publicDoctorPopulate = {
  path: "user",
  select: "fullName avatar"
};

const privateDoctorPopulate = {
  path: "user",
  select: "fullName email mobile avatar"
};

const sendError = (res, error) => {
  console.error(error.message);

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    return res.status(409).json({
      success: false,
      message: field === "user"
        ? "Doctor profile already exists for this user"
        : "License number is already registered"
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  return res.status(500).json({
    success: false,
    message: "Server Error"
  });
};

const isNonEmptyString = (value) => (
  typeof value === "string" && value.trim().length > 0
);

const validateCreateBody = (body) => {
  const requiredStrings = [
    "specialization",
    "licenseNumber",
    "clinicName"
  ];

  if (requiredStrings.some((field) => !isNonEmptyString(body[field]))) {
    return "Specialization, license number and clinic name are required";
  }

  if (!Array.isArray(body.qualifications) || body.qualifications.length === 0) {
    return "At least one qualification is required";
  }

  if (
    body.experienceYears === "" ||
    body.consultationFee === "" ||
    !Number.isFinite(Number(body.experienceYears)) ||
    !Number.isFinite(Number(body.consultationFee))
  ) {
    return "Experience years and consultation fee must be valid numbers";
  }

  const address = body.clinicAddress;
  if (
    !address ||
    !isNonEmptyString(address.addressLine) ||
    !isNonEmptyString(address.city) ||
    !isNonEmptyString(address.state) ||
    !isNonEmptyString(address.postalCode)
  ) {
    return "Complete clinic address is required";
  }

  if (body.availability !== undefined && !Array.isArray(body.availability)) {
    return "Availability must be an array";
  }

  return null;
};

const createDoctor = async (req, res) => {
  try {
    const validationMessage = validateCreateBody(req.body);
    if (validationMessage) {
      return res.status(400).json({ success: false, message: validationMessage });
    }

    const userId = req.user.role === "admin" ? req.body.userId : req.user.id;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Valid vet user ID is required" });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "vet") {
      return res.status(400).json({
        success: false,
        message: "Doctor profile can only be created for a vet user"
      });
    }

    const doctor = await Doctor.create({
      user: userId,
      specialization: req.body.specialization,
      qualifications: req.body.qualifications,
      experienceYears: Number(req.body.experienceYears),
      licenseNumber: req.body.licenseNumber,
      consultationFee: Number(req.body.consultationFee),
      clinicName: req.body.clinicName,
      clinicAddress: req.body.clinicAddress,
      bio: req.body.bio,
      languages: req.body.languages,
      availability: req.body.availability
    });

    await doctor.populate(privateDoctorPopulate);
    return res.status(201).json({
      success: true,
      message: "Doctor profile created and awaiting admin verification",
      doctor
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getDoctors = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50);
    const filter = { isActive: true, $or: [{ isVerified: true }, { isDemo: true }] };

    if (isNonEmptyString(req.query.specialization)) {
      filter.specialization = new RegExp(escapeRegExp(req.query.specialization.trim()), "i");
    }
    if (isNonEmptyString(req.query.city)) {
      filter["clinicAddress.city"] = new RegExp(`^${escapeRegExp(req.query.city.trim())}$`, "i");
    }
    if (isNonEmptyString(req.query.search)) {
      const search = new RegExp(escapeRegExp(req.query.search.trim()), "i");
      filter.$and = [{ $or: [{ specialization: search }, { clinicName: search }, { bio: search }] }];
    }

    const [doctors, totalDoctors] = await Promise.all([
      Doctor.find(filter)
        .populate(publicDoctorPopulate)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Doctor.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      totalDoctors,
      page,
      totalPages: Math.ceil(totalDoctors / limit),
      doctors
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getAdminDoctors = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const filter = {};

    if (req.query.isVerified === "true" || req.query.isVerified === "false") {
      filter.isVerified = req.query.isVerified === "true";
    }
    if (req.query.isActive === "true" || req.query.isActive === "false") {
      filter.isActive = req.query.isActive === "true";
    }

    const [doctors, totalDoctors] = await Promise.all([
      Doctor.find(filter)
        .populate(privateDoctorPopulate)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Doctor.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      totalDoctors,
      page,
      totalPages: Math.ceil(totalDoctors / limit),
      doctors
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id })
      .populate(privateDoctorPopulate);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    return res.status(200).json({ success: true, doctor });
  } catch (error) {
    return sendError(res, error);
  }
};

const getDoctorById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Doctor ID" });
    }

    const doctor = await Doctor.findOne({
      _id: req.params.id,
      isVerified: true,
      isActive: true
    }).populate(publicDoctorPopulate);

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    return res.status(200).json({ success: true, doctor });
  } catch (error) {
    return sendError(res, error);
  }
};

const updateDoctor = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Doctor ID" });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    if (req.user.role !== "admin" && doctor.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only update your own doctor profile" });
    }

    const allowedFields = [
      "specialization",
      "qualifications",
      "experienceYears",
      "licenseNumber",
      "consultationFee",
      "clinicName",
      "clinicAddress",
      "bio",
      "languages",
      "availability"
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) doctor[field] = req.body[field];
    });

    await doctor.save();
    await doctor.populate(privateDoctorPopulate);
    return res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      doctor
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const updateDoctorStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Doctor ID" });
    }
    const updates = {};
    if (typeof req.body.isVerified === "boolean") updates.isVerified = req.body.isVerified;
    if (typeof req.body.isActive === "boolean") updates.isActive = req.body.isActive;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "isVerified or isActive boolean value is required"
      });
    }

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate(privateDoctorPopulate);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor status updated successfully",
      doctor
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const deleteDoctor = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Doctor ID" });
    }
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    if (req.user.role !== "admin" && doctor.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only delete your own doctor profile" });
    }

    await doctor.deleteOne();
    return res.status(200).json({ success: true, message: "Doctor profile deleted successfully" });
  } catch (error) {
    return sendError(res, error);
  }
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = {
  createDoctor,
  getDoctors,
  getAdminDoctors,
  getMyDoctorProfile,
  getDoctorById,
  updateDoctor,
  updateDoctorStatus,
  deleteDoctor
};
