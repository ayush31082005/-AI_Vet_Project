const mongoose = require("mongoose");
const AIModel = require("../models/AIModel");
const openRouterService = require("./openRouterService");
const nvidiaService = require("./nvidiaService");

class ModelSelectionError extends Error {
  constructor(message, status = 400, code = "MODEL_SELECTION_ERROR") {
    super(message);
    this.name = "ModelSelectionError";
    this.status = status;
    this.code = code;
  }
}

const providerStatus = (provider) => {
  if (provider === "openrouter") return openRouterService.getStatus();
  if (provider === "nvidia") return nvidiaService.getStatus();
  return { configured: false };
};

const resolveModel = async ({ selectionId, provider, useCase = "pet_health_chat" } = {}) => {
  if (!AIModel.USE_CASES.includes(useCase)) {
    throw new ModelSelectionError("Invalid AI use case", 400, "INVALID_AI_USE_CASE");
  }

  const filter = { isEnabled: true, useCases: useCase };
  if (selectionId) {
    if (!mongoose.isValidObjectId(selectionId)) {
      throw new ModelSelectionError("Invalid AI model selection ID", 400, "INVALID_AI_MODEL_ID");
    }
    filter._id = selectionId;
  }
  if (provider) {
    if (!["openrouter", "nvidia"].includes(provider)) {
      throw new ModelSelectionError("Invalid AI provider", 400, "INVALID_AI_PROVIDER");
    }
    filter.provider = provider;
  }

  let model;
  if (selectionId) {
    model = await AIModel.findOne(filter);
  } else {
    model = await AIModel.findOne({ ...filter, defaultFor: useCase })
      .sort({ priority: 1, updatedAt: -1 });
    if (!model) model = await AIModel.findOne(filter).sort({ priority: 1, updatedAt: -1 });
  }

  if (!model) {
    throw new ModelSelectionError(
      "No enabled AI model is available for this use case",
      503,
      "AI_MODEL_UNAVAILABLE"
    );
  }
  if (!providerStatus(model.provider).configured) {
    throw new ModelSelectionError(
      `The selected ${model.provider} provider is not configured`,
      503,
      "AI_PROVIDER_NOT_CONFIGURED"
    );
  }

  return {
    selectionId: model._id.toString(),
    provider: model.provider,
    model: model.modelId,
    displayName: model.displayName,
    useCase
  };
};

module.exports = {
  ModelSelectionError,
  providerStatus,
  resolveModel
};
