const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
  createAIModel,
  getAvailableAIModels,
  getAdminAIModels,
  getSelectedAIModel,
  updateAIModel,
  setDefaultAIModel,
  refreshAIModels,
  getRefreshHistory,
  getAIModelRecommendations
} = require("../controllers/aiModelController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAvailableAIModels);
router.get("/selected", getSelectedAIModel);
router.get("/recommendations", getAIModelRecommendations);
router.get("/admin", authorizeRoles("admin"), getAdminAIModels);
router.get("/refresh-history", authorizeRoles("admin"), getRefreshHistory);
router.post("/", authorizeRoles("admin"), createAIModel);
router.post("/refresh", authorizeRoles("admin"), refreshAIModels);
router.patch("/:id", authorizeRoles("admin"), updateAIModel);
router.patch("/:id/default", authorizeRoles("admin"), setDefaultAIModel);

module.exports = router;
