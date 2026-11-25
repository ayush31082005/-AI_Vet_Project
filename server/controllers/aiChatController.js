const mongoose = require("mongoose");
const AIConversation = require("../models/AIConversation");
const MedicalRecord = require("../models/MedicalRecord");
const Pet = require("../models/Pet");
const Prescription = require("../models/Prescription");
const { generatePetHealthResponse } = require("../services/petHealthAIService");

const sendError = (res, error) => {
  console.error(error.message);
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error.name === "ModelSelectionError") {
    return res.status(error.status).json({
      success: false,
      message: error.message,
      code: error.code
    });
  }
  if (["OpenRouterError", "NvidiaError"].includes(error.name)) {
    const messages = {
      NVIDIA_AUTH_FAILED: 'NVIDIA API key is invalid or expired. Update the server configuration.',
      NVIDIA_ACCESS_DENIED: 'Your NVIDIA account does not have access to this model.',
      NVIDIA_MODEL_UNAVAILABLE: 'This NVIDIA model is unavailable. Refresh models and select the configured model.',
      NVIDIA_RATE_LIMIT: 'NVIDIA request limit reached. Please try again later.',
      NVIDIA_CREDITS_REQUIRED: 'NVIDIA account credits are required for this request.',
      NVIDIA_TIMEOUT: 'NVIDIA response timed out. Please retry.',
      NVIDIA_EMPTY_COMPLETION: 'NVIDIA returned no final answer. Please retry.',
      NVIDIA_NOT_CONFIGURED: 'NVIDIA API key is not configured on the server.',
      OPENROUTER_AUTH_FAILED: 'OpenRouter API key is invalid or expired. Ask the administrator to update it.',
      OPENROUTER_CREDITS_REQUIRED: 'OpenRouter requires available credits for this request. Check the provider account.',
      OPENROUTER_DATA_POLICY: 'OpenRouter account privacy settings do not allow an available provider. Review your OpenRouter privacy settings.',
      OPENROUTER_RATE_LIMIT: 'OpenRouter free request limit reached. Please retry later or select NVIDIA.',
      OPENROUTER_MODEL_UNAVAILABLE: 'Selected model has no available provider. Select a different model.',
      OPENROUTER_EMPTY_COMPLETION: 'The free model returned no final answer. Please retry or select NVIDIA.',
      OPENROUTER_TIMEOUT: 'AI response timed out. Please retry.',
      OPENROUTER_NOT_CONFIGURED: 'OpenRouter API key is not configured on the server.'
    };
    return res.status(error.status || 502).json({
      success: false,
      message: messages[error.code] || (error.status === 429
        ? "AI provider rate limit reached. Please try again later."
        : "AI provider is currently unavailable."),
      code: error.code,
      retryable: error.retryable
    });
  }
  return res.status(500).json({ success: false, message: "Server Error" });
};

const validMessage = (value) => (
  typeof value === "string" && value.trim().length > 0 && value.length <= 4000
);

const loadPetContext = async (petId, ownerId) => {
  const pet = await Pet.findOne({ _id: petId, owner: ownerId }).lean();
  if (!pet) return null;

  const [records, prescriptions] = await Promise.all([
    MedicalRecord.find({ pet: pet._id, isRevoked: false })
      .select("recordType title details recordDate vitals")
      .sort({ recordDate: -1 })
      .limit(5)
      .lean(),
    Prescription.find({ pet: pet._id, isRevoked: false })
      .select("diagnosis medicines advice followUpDate createdAt")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean()
  ]);

  return {
    pet: {
      name: pet.petName,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      gender: pet.gender,
      weightKg: pet.weight,
      vaccinationStatus: pet.vaccinationStatus,
      ownerProvidedHistory: String(pet.medicalHistory || "").slice(0, 1000)
    },
    recentMedicalRecords: records.map((record) => ({
      type: record.recordType,
      title: record.title,
      details: String(record.details || "").slice(0, 600),
      date: record.recordDate,
      vitals: record.vitals
    })),
    activePrescriptions: prescriptions.map((prescription) => ({
      diagnosis: String(prescription.diagnosis || "").slice(0, 500),
      medicines: prescription.medicines.slice(0, 10).map((medicine) => ({
        name: medicine.name,
        dosage: medicine.dosage,
        frequency: medicine.frequency,
        duration: medicine.duration
      })),
      advice: String(prescription.advice || "").slice(0, 500),
      followUpDate: prescription.followUpDate
    }))
  };
};

const runAI = async ({ conversation, message, petContext, selectionId, provider }) => {
  const history = conversation
    ? conversation.messages.slice(-12).map(({ role, content }) => ({ role, content }))
    : [];
  return generatePetHealthResponse({
    selectionId: conversation?.modelSelection?.toString() || selectionId,
    provider: conversation ? undefined : provider,
    messages: [...history, { role: "user", content: message.trim() }],
    petContext
  });
};

const sendChatMessage = async (req, res) => {
  try {
    const { petId, conversationId, message, selectionId, provider } = req.body;
    if (!mongoose.isValidObjectId(petId) || !validMessage(message)) {
      return res.status(400).json({
        success: false,
        message: "Valid pet ID and a message of up to 4000 characters are required"
      });
    }

    const petContext = await loadPetContext(petId, req.user.id);
    if (!petContext) {
      return res.status(404).json({ success: false, message: "Pet not found or does not belong to you" });
    }

    let conversation = null;
    if (conversationId) {
      if (!mongoose.isValidObjectId(conversationId)) {
        return res.status(400).json({ success: false, message: "Invalid Conversation ID" });
      }
      conversation = await AIConversation.findOne({
        _id: conversationId,
        owner: req.user.id,
        pet: petId,
        type: "chat"
      });
      if (!conversation) {
        return res.status(404).json({ success: false, message: "Conversation not found" });
      }
      if (conversation.isArchived) {
        return res.status(409).json({ success: false, message: "Archived conversation cannot receive messages" });
      }
      if (conversation.messages.length >= 100) {
        return res.status(409).json({ success: false, message: "Conversation message limit reached" });
      }
    }

    const result = await runAI({
      conversation,
      message,
      petContext,
      selectionId,
      provider
    });

    if (!conversation) {
      conversation = new AIConversation({
        owner: req.user.id,
        pet: petId,
        type: "chat",
        title: message.trim().slice(0, 120),
        modelSelection: result.selection.selectionId,
        provider: result.selection.provider,
        modelId: result.selection.model,
        messages: []
      });
    }
    conversation.messages.push(
      { role: "user", content: message.trim(), urgent: result.urgent },
      { role: "assistant", content: result.completion.content, urgent: result.urgent }
    );
    conversation.totalTokens += result.completion.usage.totalTokens;
    conversation.hasUrgentConcern ||= result.urgent;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return res.status(200).json({
      success: true,
      conversationId: conversation._id,
      response: {
        content: result.completion.content,
        urgent: result.urgent,
        emergencyNotice: result.emergencyNotice,
        disclaimer: result.disclaimer,
        provider: result.selection.provider,
        model: result.selection.displayName
      }
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const generateHealthSuggestions = async (req, res) => {
  try {
    const { petId, concern, selectionId, provider } = req.body;
    if (!mongoose.isValidObjectId(petId)) {
      return res.status(400).json({ success: false, message: "Valid Pet ID is required" });
    }
    if (concern !== undefined && !validMessage(concern)) {
      return res.status(400).json({ success: false, message: "Concern must be 1-4000 characters" });
    }
    const petContext = await loadPetContext(petId, req.user.id);
    if (!petContext) {
      return res.status(404).json({ success: false, message: "Pet not found or does not belong to you" });
    }

    const prompt = concern?.trim() || (
      "Based only on the supplied pet context, provide concise preventive-care " +
      "questions and general wellness suggestions to discuss with a veterinarian."
    );
    const result = await runAI({
      conversation: null,
      message: prompt,
      petContext,
      selectionId,
      provider
    });
    const conversation = await AIConversation.create({
      owner: req.user.id,
      pet: petId,
      type: "health_suggestion",
      title: `Health suggestions: ${petContext.pet.name}`.slice(0, 120),
      modelSelection: result.selection.selectionId,
      provider: result.selection.provider,
      modelId: result.selection.model,
      messages: [
        { role: "user", content: prompt, urgent: result.urgent },
        { role: "assistant", content: result.completion.content, urgent: result.urgent }
      ],
      totalTokens: result.completion.usage.totalTokens,
      hasUrgentConcern: result.urgent,
      lastMessageAt: new Date()
    });

    return res.status(200).json({
      success: true,
      conversationId: conversation._id,
      suggestions: result.completion.content,
      urgent: result.urgent,
      emergencyNotice: result.emergencyNotice,
      disclaimer: result.disclaimer,
      provider: result.selection.provider,
      model: result.selection.displayName
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getConversations = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50);
    const filter = { owner: req.user.id };
    if (req.query.archived === "true" || req.query.archived === "false") {
      filter.isArchived = req.query.archived === "true";
    }
    const [conversations, totalConversations] = await Promise.all([
      AIConversation.find(filter)
        .select("-messages")
        .populate("pet", "petName species breed petImage")
        .populate("modelSelection", "displayName provider modelId")
        .sort({ lastMessageAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      AIConversation.countDocuments(filter)
    ]);
    return res.status(200).json({
      success: true,
      totalConversations,
      page,
      totalPages: Math.ceil(totalConversations / limit),
      conversations
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getConversationById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Conversation ID" });
    }
    const conversation = await AIConversation.findOne({
      _id: req.params.id,
      owner: req.user.id
    })
      .populate("pet", "petName species breed petImage")
      .populate("modelSelection", "displayName provider modelId");
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    return sendError(res, error);
  }
};

const archiveConversation = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Conversation ID" });
    }
    const conversation = await AIConversation.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { isArchived: true },
      { new: true }
    );
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Conversation archived successfully",
      conversation
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  sendChatMessage,
  generateHealthSuggestions,
  getConversations,
  getConversationById,
  archiveConversation
};
