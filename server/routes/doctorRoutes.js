const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
  createDoctor,
  getDoctors,
  getAdminDoctors,
  getMyDoctorProfile,
  getDoctorById,
  updateDoctor,
  updateDoctorStatus,
  deleteDoctor
} = require("../controllers/doctorController");

const router = express.Router();

router.get("/", getDoctors);
router.get(
  "/admin",
  authMiddleware,
  authorizeRoles("admin"),
  getAdminDoctors
);
router.get(
  "/me",
  authMiddleware,
  authorizeRoles("vet"),
  getMyDoctorProfile
);
router.post(
  "/",
  authMiddleware,
  authorizeRoles("vet", "admin"),
  createDoctor
);
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("admin"),
  updateDoctorStatus
);
router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles("vet", "admin"),
  updateDoctor
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("vet", "admin"),
  deleteDoctor
);
router.get("/:id", getDoctorById);

module.exports = router;
