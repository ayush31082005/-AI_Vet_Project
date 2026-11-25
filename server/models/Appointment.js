const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
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
      default: null,
      index: true
    },
    petDetails: {
      petName: { type: String, trim: true, maxlength: 100 },
      species: { type: String, trim: true, maxlength: 50 }
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true
    },
    isDemo: { type: Boolean, default: false },
    endsAt: {
      type: Date,
      required: true
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 15,
      max: 180,
      default: 30
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    ownerNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      index: true
    },
    consultationFee: {
      type: Number,
      required: true,
      min: 0
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

appointmentSchema.pre("validate", function setEndsAt() {
  if (this.scheduledAt && this.durationMinutes) {
    this.endsAt = new Date(
      this.scheduledAt.getTime() + this.durationMinutes * 60 * 1000
    );
  }
});

appointmentSchema.index({ doctor: 1, scheduledAt: 1 });
appointmentSchema.index({ owner: 1, scheduledAt: -1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
