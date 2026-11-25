const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
  getOpenRouterStatus,
  getNvidiaStatus
} = require("../controllers/aiProviderController");

const router = express.Router();

router.use(authMiddleware, authorizeRoles("admin"));

router.get("/openrouter/status", getOpenRouterStatus);
router.get("/nvidia/status", getNvidiaStatus);

module.exports = router;
