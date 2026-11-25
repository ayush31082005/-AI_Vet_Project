
const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    petName: {
      type: String,
      required: true,
      trim: true
    },

    species: {
      type: String,
      required: true
    },

    breed: {
      type: String,
      default: ""
    },

    age: {
      type: Number,
      required: true,
      min: 0
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Unknown"],
      required: true
    },

    weight: {
      type: Number,
      min: 0,
      default: 0
    },

    color: {
      type: String,
      default: ""
    },

    petImage: {
      type: String,
      default: ""
    },

    vaccinationStatus: {
      type: String,
      enum: [
        "Vaccinated",
        "Not Vaccinated",
        "Partially Vaccinated",
        "Unknown"
      ],
      default: "Unknown"
    },

    medicalHistory: {
      type: String,
      default: ""
    }
  },

  {
    timestamps: true
  }
);

module.exports = mongoose.model("Pet", petSchema);
