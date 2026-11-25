
const Pet = require("../models/Pet");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");


// ================= DELETE IMAGE HELPER =================

const deleteImage = async (imagePath) => {

  if (!imagePath) return;

  const filePath = path.join(
    __dirname,
    "../uploads/pets",
    path.basename(imagePath)
  );

  try {

    await fs.promises.unlink(filePath);

  } catch (error) {

    if (error.code !== "ENOENT") {
      console.log(error.message);
    }

  }
};


// ================= ADD PET =================

const addPet = async (req, res) => {

  try {

    const {
      petName,
      species,
      breed,
      age,
      gender,
      weight,
      color,
      vaccinationStatus,
      medicalHistory
    } = req.body;

    if (
      !petName ||
      !species ||
      age === undefined ||
      age === "" ||
      !gender
    ) {

      if (req.file) {
        await deleteImage(req.file.filename);
      }

      return res.status(400).json({
        success: false,
        message: "Required fields are missing"
      });

    }

    const pet = await Pet.create({

      owner: req.user.id,

      petName,
      species,
      breed,
      age,
      gender,
      weight,
      color,
      vaccinationStatus,
      medicalHistory,

      petImage: req.file
        ? `/uploads/pets/${req.file.filename}`
        : ""

    });

    return res.status(201).json({

      success: true,

      message: "Pet Added Successfully",

      pet

    });

  } catch (error) {

    if (req.file) {
      await deleteImage(req.file.filename);
    }

    console.log(error.message);

    return res.status(
      error.name === "ValidationError" ? 400 : 500
    ).json({

      success: false,

      message: error.name === "ValidationError"
        ? error.message
        : "Server Error"

    });

  }

};


// ================= GET ALL MY PETS =================

const getAllPets = async (req, res) => {

  try {

    const pets = await Pet.find({

      owner: req.user.id

    }).sort({ createdAt: -1 });

    return res.status(200).json({

      success: true,

      totalPets: pets.length,

      pets

    });

  } catch (error) {

    console.log(error.message);

    return res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }

};


// ================= GET SINGLE PET =================

const getSinglePet = async (req, res) => {

  try {

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {

      return res.status(400).json({
        success: false,
        message: "Invalid Pet ID"
      });

    }

    const pet = await Pet.findOne({

      _id: id,

      owner: req.user.id

    });

    if (!pet) {

      return res.status(404).json({

        success: false,

        message: "Pet Not Found"

      });

    }

    return res.status(200).json({

      success: true,

      pet

    });

  } catch (error) {

    console.log(error.message);

    return res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }

};


// ================= UPDATE PET =================

const updatePet = async (req, res) => {

  try {

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {

      if (req.file) {
        await deleteImage(req.file.filename);
      }

      return res.status(400).json({
        success: false,
        message: "Invalid Pet ID"
      });

    }

    const pet = await Pet.findOne({

      _id: id,

      owner: req.user.id

    });

    if (!pet) {

      if (req.file) {
        await deleteImage(req.file.filename);
      }

      return res.status(404).json({

        success: false,

        message: "Pet Not Found"

      });

    }

    const allowedFields = [

      "petName",
      "species",
      "breed",
      "age",
      "gender",
      "weight",
      "color",
      "vaccinationStatus",
      "medicalHistory"

    ];

    allowedFields.forEach((field) => {

      if (req.body[field] !== undefined) {

        pet[field] = req.body[field];

      }

    });

    const oldImage = pet.petImage;

    if (req.file) {

      pet.petImage =
        `/uploads/pets/${req.file.filename}`;

    }

    await pet.save();

    if (req.file && oldImage) {

      await deleteImage(oldImage);

    }

    return res.status(200).json({

      success: true,

      message: "Pet Updated Successfully",

      pet

    });

  } catch (error) {

    if (req.file) {
      await deleteImage(req.file.filename);
    }

    console.log(error.message);

    return res.status(
      error.name === "ValidationError" ? 400 : 500
    ).json({

      success: false,

      message: error.name === "ValidationError"
        ? error.message
        : "Server Error"

    });

  }

};


// ================= DELETE PET =================

const deletePet = async (req, res) => {

  try {

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {

      return res.status(400).json({
        success: false,
        message: "Invalid Pet ID"
      });

    }

    const pet = await Pet.findOneAndDelete({

      _id: id,

      owner: req.user.id

    });

    if (!pet) {

      return res.status(404).json({

        success: false,

        message: "Pet Not Found"

      });

    }

    if (pet.petImage) {

      await deleteImage(pet.petImage);

    }

    return res.status(200).json({

      success: true,

      message: "Pet Deleted Successfully"

    });

  } catch (error) {

    console.log(error.message);

    return res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }

};


module.exports = {

  addPet,
  getAllPets,
  getSinglePet,
  updatePet,
  deletePet

};
