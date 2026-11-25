
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    mobile: {
      type: String,
      default: ""
    },

    password: {
      type: String,
      select: false
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true
    },

    avatar: {
      type: String,
      default: ""
    },

    role: {
      type: String,
      enum: ["petOwner", "vet", "admin"],
      default: "petOwner"
    }
  },

  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
