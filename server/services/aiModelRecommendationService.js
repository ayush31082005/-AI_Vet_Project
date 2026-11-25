const AIModel = require("../models/AIModel");
const { providerStatus } = require("./modelSelectionService");

const scoreModel = (model, useCase) => {
  let score = Math.max(0, 500 - model.priority);
  const reasons = [];

  if (model.defaultFor.includes(useCase)) {
    score += 1000;
    reasons.push("Current default for this use case");
  }
  if (model.contextLength) {
    score += Math.min(200, Math.round(model.contextLength / 1000));
    reasons.push(`Supports ${model.contextLength} context tokens`);
  }
  const input = model.pricing?.inputPerMillionTokens;
  const output = model.pricing?.outputPerMillionTokens;
  if (Number.isFinite(input) && Number.isFinite(output)) {
    const averageCost = (input + output) / 2;
    score += Math.max(0, 200 - Math.round(averageCost));
    reasons.push("Pricing metadata available for cost comparison");
  }
  if (model.capabilities.includes("tools")) {
    score += 25;
    reasons.push("Supports tool calling");
  }
  if (reasons.length === 0) reasons.push("Enabled for the requested use case");
  return { score, reasons };
};

const recommendModels = async ({ useCase, capability = "text", limit = 5 }) => {
  if (!AIModel.USE_CASES.includes(useCase)) {
    const error = new Error("Invalid AI use case");
    error.status = 400;
    error.code = "INVALID_AI_USE_CASE";
    throw error;
  }
  if (!["text", "vision", "tools"].includes(capability)) {
    const error = new Error("Invalid AI capability");
    error.status = 400;
    error.code = "INVALID_AI_CAPABILITY";
    throw error;
  }

  const models = await AIModel.find({
    isEnabled: true,
    useCases: useCase,
    capabilities: capability
  }).lean();

  return models
    .filter((model) => providerStatus(model.provider).configured)
    .map((model) => ({ ...model, ...scoreModel(model, useCase) }))
    .sort((a, b) => b.score - a.score || a.priority - b.priority)
    .slice(0, Math.min(Math.max(limit, 1), 10));
};

module.exports = { recommendModels };
