const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const aiRateLimit = require("../middleware/aiRateLimit");
const {
  sendChatMessage,
  generateHealthSuggestions,
  getConversations,
  getConversationById,
  archiveConversation
} = require("../controllers/aiChatController");

const router = express.Router();

router.use(authMiddleware, authorizeRoles("petOwner"));

router.post("/message", aiRateLimit, sendChatMessage);
router.post("/suggestions", aiRateLimit, generateHealthSuggestions);
router.get("/conversations", getConversations);
router.get("/conversations/:id", getConversationById);
router.patch("/conversations/:id/archive", archiveConversation);

module.exports = router;
