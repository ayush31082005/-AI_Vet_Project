const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    dosage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    frequency: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    duration: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: 300,
      default: ""
    }
  },
  { _id: true }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true
    },
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
      required: true,
      index: true
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    medicines: {
      type: [medicineSchema],
      validate: {
        validator: (items) => items.length > 0 && items.length <= 25,
        message: "Provide between 1 and 25 medicines"
      }
    },
    advice: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ""
    },
    followUpDate: {
      type: Date,
      default: null
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

prescriptionSchema.index({ pet: 1, createdAt: -1 });
prescriptionSchema.index({ doctor: 1, createdAt: -1 });

module.exports = mongoose.model("Prescription", prescriptionSchema);
