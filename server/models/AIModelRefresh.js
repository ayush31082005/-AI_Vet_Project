const mongoose = require("mongoose");

const aiModelRefreshSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["openrouter", "nvidia"],
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["completed", "failed"],
      required: true,
      index: true
    },
    discovered: { type: Number, min: 0, default: 0 },
    processed: { type: Number, min: 0, default: 0 },
    skipped: { type: Number, min: 0, default: 0 },
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    errorCode: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIModelRefresh", aiModelRefreshSchema);
