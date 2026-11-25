const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAdminAppointments,
  getAppointmentById,
  rescheduleAppointment,
  updateAppointmentStatus,
  cancelAppointment
} = require("../controllers/appointmentController");

const router = express.Router();

router.use(authMiddleware);

router.post("/", authorizeRoles("petOwner"), createAppointment);
router.get("/mine", authorizeRoles("petOwner"), getMyAppointments);
router.get("/doctor", authorizeRoles("vet"), getDoctorAppointments);
router.get("/admin", authorizeRoles("admin"), getAdminAppointments);
router.get(
  "/:id",
  authorizeRoles("petOwner", "vet", "admin"),
  getAppointmentById
);
router.patch(
  "/:id/reschedule",
  authorizeRoles("petOwner", "admin"),
  rescheduleAppointment
);
router.patch(
  "/:id/status",
  authorizeRoles("vet", "admin"),
  updateAppointmentStatus
);
router.patch(
  "/:id/cancel",
  authorizeRoles("petOwner", "vet", "admin"),
  cancelAppointment
);

module.exports = router;
