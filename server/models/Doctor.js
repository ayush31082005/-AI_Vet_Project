const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      required: true
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/
    }
  },
  { _id: false }
);

availabilitySchema.path("endTime").validate(function validateEndTime(value) {
  return !this.startTime || value > this.startTime;
}, "End time must be later than start time");

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    qualifications: {
      type: [{ type: String, trim: true, maxlength: 150 }],
      validate: {
        validator: (items) => items.length > 0 && items.length <= 10,
        message: "Provide between 1 and 10 qualifications"
      }
    },
    experienceYears: {
      type: Number,
      required: true,
      min: 0,
      max: 80
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 80
    },
    consultationFee: {
      type: Number,
      required: true,
      min: 0,
      max: 1000000
    },
    clinicName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    clinicAddress: {
      addressLine: { type: String, required: true, trim: true, maxlength: 250 },
      city: { type: String, required: true, trim: true, maxlength: 100 },
      state: { type: String, required: true, trim: true, maxlength: 100 },
      postalCode: { type: String, required: true, trim: true, maxlength: 20 }
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },
    languages: {
      type: [{ type: String, trim: true, maxlength: 50 }],
      default: []
    },
    availability: {
      type: [availabilitySchema],
      default: []
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true
    },
    isDemo: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

doctorSchema.index({ specialization: 1, "clinicAddress.city": 1 });

module.exports = mongoose.model("Doctor", doctorSchema);
