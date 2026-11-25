const mongoose = require("mongoose");
const AIModel = require("../models/AIModel");
const modelSelectionService = require("../services/modelSelectionService");
const AIModelRefresh = require("../models/AIModelRefresh");
const { refreshProviderModels } = require("../services/aiModelRefreshService");
const { recommendModels } = require("../services/aiModelRecommendationService");

const sendError = (res, error) => {
  console.error(error.message);
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "This provider model is already registered"
    });
  }
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
  return res.status(500).json({ success: false, message: "Server Error" });
};

const createAIModel = async (req, res) => {
  try {
    const { provider, modelId, displayName, useCases } = req.body;
    if (
      !["openrouter", "nvidia"].includes(provider) ||
      typeof modelId !== "string" || !modelId.trim() ||
      typeof displayName !== "string" || !displayName.trim() ||
      !Array.isArray(useCases) || useCases.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Provider, model ID, display name and use cases are required"
      });
    }

    const aiModel = await AIModel.create({
      provider,
      modelId,
      displayName,
      description: req.body.description,
      useCases,
      capabilities: req.body.capabilities,
      contextLength: req.body.contextLength,
      pricing: req.body.pricing,
      priority: req.body.priority,
      isEnabled: req.body.isEnabled,
      source: "manual"
    });
    return res.status(201).json({
      success: true,
      message: "AI model registered successfully",
      aiModel
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getAvailableAIModels = async (req, res) => {
  try {
    const filter = { isEnabled: true };
    if (req.query.provider !== undefined) {
      if (!["openrouter", "nvidia"].includes(req.query.provider)) {
        return res.status(400).json({ success: false, message: "Invalid AI provider" });
      }
      filter.provider = req.query.provider;
    }
    if (req.query.useCase !== undefined) {
      if (!AIModel.USE_CASES.includes(req.query.useCase)) {
        return res.status(400).json({ success: false, message: "Invalid AI use case" });
      }
      filter.useCases = req.query.useCase;
    }

    const models = await AIModel.find(filter).sort({ priority: 1, displayName: 1 }).lean();
    const aiModels = models.map((model) => ({
      ...model,
      providerConfigured: modelSelectionService.providerStatus(model.provider).configured
    }));
    return res.status(200).json({ success: true, totalModels: aiModels.length, aiModels });
  } catch (error) {
    return sendError(res, error);
  }
};

const getAdminAIModels = async (req, res) => {
  try {
    const models = await AIModel.find().sort({ provider: 1, priority: 1, displayName: 1 }).lean();
    const aiModels = models.map((model) => ({
      ...model,
      providerConfigured: modelSelectionService.providerStatus(model.provider).configured
    }));
    return res.status(200).json({ success: true, totalModels: aiModels.length, aiModels });
  } catch (error) {
    return sendError(res, error);
  }
};

const getSelectedAIModel = async (req, res) => {
  try {
    const selection = await modelSelectionService.resolveModel({
      selectionId: req.query.selectionId,
      provider: req.query.provider,
      useCase: req.query.useCase || "pet_health_chat"
    });
    return res.status(200).json({ success: true, selection });
  } catch (error) {
    return sendError(res, error);
  }
};

const updateAIModel = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid AI Model ID" });
    }
    const aiModel = await AIModel.findById(req.params.id);
    if (!aiModel) {
      return res.status(404).json({ success: false, message: "AI model not found" });
    }

    const allowedFields = [
      "displayName",
      "description",
      "useCases",
      "capabilities",
      "contextLength",
      "pricing",
      "priority",
      "isEnabled"
    ];
    let hasChanges = false;
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        aiModel[field] = req.body[field];
        hasChanges = true;
      }
    });
    if (!hasChanges) {
      return res.status(400).json({ success: false, message: "Provide at least one model field to update" });
    }
    if (req.body.isEnabled === false) aiModel.defaultFor = [];

    await aiModel.save();
    return res.status(200).json({
      success: true,
      message: "AI model updated successfully",
      aiModel
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const setDefaultAIModel = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid AI Model ID" });
    }
    const { useCase } = req.body;
    if (!AIModel.USE_CASES.includes(useCase)) {
      return res.status(400).json({ success: false, message: "Valid AI use case is required" });
    }

    const aiModel = await AIModel.findOne({
      _id: req.params.id,
      isEnabled: true,
      useCases: useCase
    });
    if (!aiModel) {
      return res.status(404).json({
        success: false,
        message: "Enabled AI model supporting this use case was not found"
      });
    }
    if (!modelSelectionService.providerStatus(aiModel.provider).configured) {
      return res.status(409).json({
        success: false,
        message: `Configure ${aiModel.provider} before selecting it as default`
      });
    }

    await AIModel.updateMany(
      { _id: { $ne: aiModel._id }, defaultFor: useCase },
      { $pull: { defaultFor: useCase } }
    );
    if (!aiModel.defaultFor.includes(useCase)) aiModel.defaultFor.push(useCase);
    await aiModel.save();

    return res.status(200).json({
      success: true,
      message: `Default AI model selected for ${useCase}`,
      aiModel
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const refreshAIModels = async (req, res) => {
  try {
    const { provider } = req.body;
    if (!["openrouter", "nvidia"].includes(provider)) {
      return res.status(400).json({ success: false, message: "Valid AI provider is required" });
    }
    const { result, refresh } = await refreshProviderModels({
      provider,
      userId: req.user.id
    });
    return res.status(200).json({
      success: true,
      message: `${provider} models refreshed successfully`,
      result,
      refresh
    });
  } catch (error) {
    console.error(error.message);
    return res.status(error.status >= 400 && error.status <= 504 ? error.status : 502).json({
      success: false,
      message: "AI model refresh failed",
      code: error.code || "MODEL_REFRESH_FAILED"
    });
  }
};

const getRefreshHistory = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 50);
    const [refreshes, totalRefreshes] = await Promise.all([
      AIModelRefresh.find()
        .populate("triggeredBy", "fullName email role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      AIModelRefresh.countDocuments()
    ]);
    return res.status(200).json({
      success: true,
      totalRefreshes,
      page,
      totalPages: Math.ceil(totalRefreshes / limit),
      refreshes
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const getAIModelRecommendations = async (req, res) => {
  try {
    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const recommendations = await recommendModels({
      useCase: req.query.useCase || "pet_health_chat",
      capability: req.query.capability || "text",
      limit: Number.isInteger(parsedLimit) ? parsedLimit : 5
    });
    return res.status(200).json({
      success: true,
      totalRecommendations: recommendations.length,
      recommendations
    });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: error.code
      });
    }
    return sendError(res, error);
  }
};

module.exports = {
  createAIModel,
  getAvailableAIModels,
  getAdminAIModels,
  getSelectedAIModel,
  updateAIModel,
  setDefaultAIModel,
  refreshAIModels,
  getRefreshHistory,
  getAIModelRecommendations
};
