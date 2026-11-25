const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
  createMedicalRecord,
  getMyMedicalRecords,
  getDoctorMedicalRecords,
  getAdminMedicalRecords,
  getPetMedicalTimeline,
  getMedicalRecordById,
  updateMedicalRecord,
  revokeMedicalRecord
} = require("../controllers/medicalHistoryController");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  authorizeRoles("petOwner", "vet"),
  createMedicalRecord
);
router.get("/mine", authorizeRoles("petOwner"), getMyMedicalRecords);
router.get("/doctor", authorizeRoles("vet"), getDoctorMedicalRecords);
router.get("/admin", authorizeRoles("admin"), getAdminMedicalRecords);
router.get(
  "/pet/:petId",
  authorizeRoles("petOwner", "vet", "admin"),
  getPetMedicalTimeline
);
router.get(
  "/:id",
  authorizeRoles("petOwner", "vet", "admin"),
  getMedicalRecordById
);
router.patch(
  "/:id",
  authorizeRoles("petOwner", "vet"),
  updateMedicalRecord
);
router.patch(
  "/:id/revoke",
  authorizeRoles("petOwner", "vet", "admin"),
  revokeMedicalRecord
);

module.exports = router;
