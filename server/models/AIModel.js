const mongoose = require("mongoose");

const useCases = [
  "pet_health_chat",
  "general_chat",
  "medical_summary",
  "recommendation"
];

const aiModelSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["openrouter", "nvidia"],
      required: true,
      index: true
    },
    modelId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },
    useCases: {
      type: [{ type: String, enum: useCases }],
      validate: {
        validator: (items) => items.length > 0,
        message: "At least one AI use case is required"
      }
    },
    defaultFor: {
      type: [{ type: String, enum: useCases }],
      default: []
    },
    capabilities: {
      type: [{ type: String, enum: ["text", "vision", "tools"] }],
      default: ["text"]
    },
    contextLength: {
      type: Number,
      min: 1,
      default: null
    },
    pricing: {
      inputPerMillionTokens: { type: Number, min: 0, default: null },
      outputPerMillionTokens: { type: Number, min: 0, default: null },
      currency: { type: String, enum: ["USD"], default: "USD" }
    },
    priority: {
      type: Number,
      min: 0,
      max: 10000,
      default: 100
    },
    isEnabled: {
      type: Boolean,
      default: true,
      index: true
    },
    source: {
      type: String,
      enum: ["manual", "provider"],
      default: "manual"
    },
    lastSyncedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

aiModelSchema.index({ provider: 1, modelId: 1 }, { unique: true });
aiModelSchema.index({ isEnabled: 1, useCases: 1, priority: 1 });

aiModelSchema.pre("validate", function validateDefaults() {
  if (this.defaultFor.some((useCase) => !this.useCases.includes(useCase))) {
    this.invalidate("defaultFor", "Default use cases must also exist in useCases");
  }
});

module.exports = mongoose.model("AIModel", aiModelSchema);
module.exports.USE_CASES = useCases;
