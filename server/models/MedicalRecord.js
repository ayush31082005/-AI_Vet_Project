const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
      index: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
      index: true
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    source: {
      type: String,
      enum: ["owner", "veterinarian"],
      required: true
    },
    recordType: {
      type: String,
      enum: [
        "consultation",
        "vaccination",
        "surgery",
        "lab_result",
        "allergy",
        "condition",
        "note"
      ],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    details: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    recordDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    vitals: {
      weightKg: { type: Number, min: 0, max: 5000 },
      temperatureC: { type: Number, min: 20, max: 50 },
      heartRateBpm: { type: Number, min: 0, max: 500 }
    },
    revision: {
      type: Number,
      min: 1,
      default: 1
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true
    },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    revokedAt: {
      type: Date,
      default: null
    },
    revocationReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    }
  },
  { timestamps: true }
);

medicalRecordSchema.index({ pet: 1, recordDate: -1 });
medicalRecordSchema.index({ owner: 1, recordDate: -1 });

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
