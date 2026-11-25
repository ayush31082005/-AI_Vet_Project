
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const {

  addPet,
  getAllPets,
  getSinglePet,
  updatePet,
  deletePet

} = require("../controllers/petController");


// All Routes are Protected

router.use(authMiddleware);


// Add Pet

router.post(
  "/",
  upload.single("petImage"),
  addPet
);


// Get All Pets

router.get("/", getAllPets);


// Get Single Pet

router.get("/:id", getSinglePet);


// Update Pet

router.put(
  "/:id",
  upload.single("petImage"),
  updatePet
);


// Delete Pet

router.delete("/:id", deletePet);


module.exports = router;
