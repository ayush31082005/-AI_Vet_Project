const positiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const getOpenRouterConfig = () => ({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseUrl: (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1")
    .replace(/\/$/, ""),
  defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || "openrouter/auto",
  timeoutMs: positiveInteger(process.env.OPENROUTER_TIMEOUT_MS, 30000),
  appUrl: process.env.APP_URL || "",
  appName: process.env.APP_NAME || "AI Vet"
});

const getNvidiaConfig = () => ({
  apiKey: process.env.NVIDIA_API_KEY || "",
  baseUrl: (process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1")
    .replace(/\/$/, ""),
  defaultModel: process.env.NVIDIA_DEFAULT_MODEL || "meta/llama-3.1-8b-instruct",
  timeoutMs: positiveInteger(process.env.NVIDIA_TIMEOUT_MS, 30000)
});

module.exports = { getOpenRouterConfig, getNvidiaConfig };
