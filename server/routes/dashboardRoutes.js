const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
  getOwnerDashboard,
  getDoctorDashboard,
  getAdminDashboard
} = require("../controllers/dashboardController");

const router = express.Router();

router.use(authMiddleware);

router.get("/owner", authorizeRoles("petOwner"), getOwnerDashboard);
router.get("/doctor", authorizeRoles("vet"), getDoctorDashboard);
router.get("/admin", authorizeRoles("admin"), getAdminDashboard);

module.exports = router;
