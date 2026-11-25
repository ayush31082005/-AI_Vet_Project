const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 20000
    },
    urgent: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const aiConversationSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ["chat", "health_suggestion"],
      default: "chat"
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    modelSelection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIModel",
      required: true
    },
    provider: {
      type: String,
      enum: ["openrouter", "nvidia"],
      required: true
    },
    modelId: {
      type: String,
      required: true,
      maxlength: 250
    },
    messages: {
      type: [messageSchema],
      validate: {
        validator: (items) => items.length <= 100,
        message: "Conversation cannot exceed 100 stored messages"
      }
    },
    totalTokens: {
      type: Number,
      min: 0,
      default: 0
    },
    hasUrgentConcern: {
      type: Boolean,
      default: false,
      index: true
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

aiConversationSchema.index({ owner: 1, lastMessageAt: -1 });

module.exports = mongoose.model("AIConversation", aiConversationSchema);
