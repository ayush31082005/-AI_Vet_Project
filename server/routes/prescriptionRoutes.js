const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
  createPrescription,
  getMyPrescriptions,
  getDoctorPrescriptions,
  getAdminPrescriptions,
  getPrescriptionById,
  getPrescriptionByAppointment,
  updatePrescription,
  revokePrescription
} = require("../controllers/prescriptionController");

const router = express.Router();

router.use(authMiddleware);

router.post("/", authorizeRoles("vet"), createPrescription);
router.get("/mine", authorizeRoles("petOwner"), getMyPrescriptions);
router.get("/doctor", authorizeRoles("vet"), getDoctorPrescriptions);
router.get("/admin", authorizeRoles("admin"), getAdminPrescriptions);
router.get(
  "/appointment/:appointmentId",
  authorizeRoles("petOwner", "vet", "admin"),
  getPrescriptionByAppointment
);
router.get(
  "/:id",
  authorizeRoles("petOwner", "vet", "admin"),
  getPrescriptionById
);
router.patch("/:id", authorizeRoles("vet"), updatePrescription);
router.patch(
  "/:id/revoke",
  authorizeRoles("vet", "admin"),
  revokePrescription
);

module.exports = router;
