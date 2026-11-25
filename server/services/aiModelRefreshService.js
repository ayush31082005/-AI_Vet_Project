const AIModel = require("../models/AIModel");
const AIModelRefresh = require("../models/AIModelRefresh");
const openRouterService = require("./openRouterService");
const nvidiaService = require("./nvidiaService");

const allUseCases = AIModel.USE_CASES;

const finiteNonNegative = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

const perMillion = (value) => {
  const number = finiteNonNegative(value);
  return number === null ? null : number * 1000000;
};

const openRouterCapabilities = (model) => {
  const capabilities = ["text"];
  const inputs = model.architecture?.input_modalities || [];
  const parameters = model.supported_parameters || [];
  if (inputs.includes("image")) capabilities.push("vision");
  if (parameters.includes("tools") || parameters.includes("tool_choice")) {
    capabilities.push("tools");
  }
  return capabilities;
};

const isTextModel = (model) => {
  const outputs = model.architecture?.output_modalities;
  return !Array.isArray(outputs) || outputs.includes("text");
};

const refreshOpenRouter = async () => {
  const remoteModels = await openRouterService.listModels();
  const syncTime = new Date();
  const eligible = remoteModels.filter((model) => (
    model &&
    typeof model.id === "string" &&
    model.id.length <= 250 &&
    isTextModel(model)
  ));
  const operations = eligible.map((model) => ({
    updateOne: {
      filter: { provider: "openrouter", modelId: model.id },
      update: {
        $set: {
          displayName: String(model.name || model.id).slice(0, 150),
          description: String(model.description || "").slice(0, 1000),
          capabilities: openRouterCapabilities(model),
          contextLength: finiteNonNegative(model.context_length),
          pricing: {
            inputPerMillionTokens: perMillion(model.pricing?.prompt),
            outputPerMillionTokens: perMillion(model.pricing?.completion),
            currency: "USD"
          },
          source: "provider",
          lastSyncedAt: syncTime
        },
        $setOnInsert: {
          useCases: allUseCases,
          defaultFor: [],
          priority: 1000,
          isEnabled: false
        }
      },
      upsert: true
    }
  }));
  if (operations.length > 0) await AIModel.bulkWrite(operations, { ordered: false });
  return {
    discovered: remoteModels.length,
    processed: operations.length,
    skipped: remoteModels.length - operations.length
  };
};

const refreshNvidia = async () => {
  const status = nvidiaService.getStatus();
  if (!status.configured) {
    const error = new Error("NVIDIA Build AI is not configured");
    error.status = 503;
    error.code = "NVIDIA_NOT_CONFIGURED";
    throw error;
  }

  await AIModel.updateOne(
    { provider: "nvidia", modelId: status.defaultModel },
    {
      $set: { source: "provider", lastSyncedAt: new Date() },
      $setOnInsert: {
        displayName: status.defaultModel,
        description: "NVIDIA Build AI configured default model",
        useCases: allUseCases,
        defaultFor: [],
        capabilities: ["text"],
        priority: 1000,
        isEnabled: false
      }
    },
    { upsert: true, runValidators: true }
  );
  return { discovered: 1, processed: 1, skipped: 0 };
};

const refreshProviderModels = async ({ provider, userId }) => {
  if (!["openrouter", "nvidia"].includes(provider)) {
    const error = new Error("Invalid AI provider");
    error.status = 400;
    error.code = "INVALID_AI_PROVIDER";
    throw error;
  }

  try {
    const result = provider === "openrouter"
      ? await refreshOpenRouter()
      : await refreshNvidia();
    const refresh = await AIModelRefresh.create({
      provider,
      status: "completed",
      ...result,
      triggeredBy: userId
    });
    return { result, refresh };
  } catch (error) {
    await AIModelRefresh.create({
      provider,
      status: "failed",
      triggeredBy: userId,
      errorCode: String(error.code || "MODEL_REFRESH_FAILED").slice(0, 100)
    });
    throw error;
  }
};

module.exports = { refreshProviderModels };
