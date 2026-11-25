const { getOpenRouterConfig } = require("../config/aiProviders");

class OpenRouterError extends Error {
  constructor(message, { status = 502, code = "OPENROUTER_ERROR", retryable = false } = {}) {
    super(message);
    this.name = "OpenRouterError";
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

const createHeaders = (config) => {
  const headers = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json"
  };
  if (config.appUrl) headers["HTTP-Referer"] = config.appUrl;
  if (config.appName) headers["X-Title"] = config.appName;
  return headers;
};

const requestOpenRouter = async (path, options = {}) => {
  const config = getOpenRouterConfig();
  if (!config.apiKey) {
    throw new OpenRouterError("OpenRouter is not configured", {
      status: 503,
      code: "OPENROUTER_NOT_CONFIGURED"
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${config.baseUrl}${path}`, {
      method: options.method || "GET",
      headers: createHeaders(config),
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new OpenRouterError("OpenRouter returned an invalid response", {
        status: 502,
        code: "OPENROUTER_INVALID_RESPONSE",
        retryable: true
      });
    }

    if (!response.ok || data?.error) {
      const providerStatus = Number(data?.error?.code) || response.status;
      const providerMessage = String(data?.error?.message || '').toLowerCase();
      const code = /data polic|privacy/.test(providerMessage) ? 'OPENROUTER_DATA_POLICY'
        : providerStatus === 401 ? 'OPENROUTER_AUTH_FAILED'
        : providerStatus === 402 ? 'OPENROUTER_CREDITS_REQUIRED'
        : providerStatus === 429 ? 'OPENROUTER_RATE_LIMIT'
        : providerStatus === 404 ? 'OPENROUTER_MODEL_UNAVAILABLE'
        : 'OPENROUTER_REQUEST_FAILED';
      const retryable = response.status === 429 || response.status >= 500;
      throw new OpenRouterError("OpenRouter request failed", {
        status: response.status === 429 ? 429 : 502,
        code,
        retryable
      });
    }

    return data;
  } catch (error) {
    if (error instanceof OpenRouterError) throw error;
    if (error.name === "AbortError") {
      throw new OpenRouterError("OpenRouter request timed out", {
        status: 504,
        code: "OPENROUTER_TIMEOUT",
        retryable: true
      });
    }
    throw new OpenRouterError("OpenRouter is currently unavailable", {
      status: 502,
      code: "OPENROUTER_UNAVAILABLE",
      retryable: true
    });
  } finally {
    clearTimeout(timer);
  }
};

const validateMessages = (messages) => {
  const allowedRoles = ["system", "user", "assistant"];
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
    throw new OpenRouterError("Messages must contain between 1 and 50 items", {
      status: 400,
      code: "INVALID_AI_MESSAGES"
    });
  }

  const valid = messages.every((message) => (
    message &&
    allowedRoles.includes(message.role) &&
    typeof message.content === "string" &&
    message.content.trim().length > 0 &&
    message.content.length <= 20000
  ));
  if (!valid) {
    throw new OpenRouterError("Each message requires a valid role and text content", {
      status: 400,
      code: "INVALID_AI_MESSAGE"
    });
  }
};

const createChatCompletion = async ({
  messages,
  model,
  temperature = 0.2,
  maxTokens = 800
}) => {
  validateMessages(messages);
  const config = getOpenRouterConfig();
  const selectedModel = model || config.defaultModel;

  if (typeof selectedModel !== "string" || !selectedModel.trim()) {
    throw new OpenRouterError("A valid OpenRouter model is required", {
      status: 400,
      code: "INVALID_AI_MODEL"
    });
  }
  if (!Number.isFinite(temperature) || temperature < 0 || temperature > 2) {
    throw new OpenRouterError("Temperature must be between 0 and 2", {
      status: 400,
      code: "INVALID_AI_TEMPERATURE"
    });
  }
  if (!Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > 4096) {
    throw new OpenRouterError("maxTokens must be between 1 and 4096", {
      status: 400,
      code: "INVALID_AI_MAX_TOKENS"
    });
  }

  const request = {
    method: "POST",
    body: {
      model: selectedModel.trim(),
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false
    }
  };
  let data = await requestOpenRouter("/chat/completions", request);
  let choice = data?.choices?.[0];
  // Free routing may select a reasoning model which exhausts its budget without
  // producing final text. Retry once with a larger bounded budget, never paid fallback.
  if ((!choice || typeof choice.message?.content !== 'string' || !choice.message.content.trim()) &&
      (selectedModel === 'openrouter/free' || selectedModel.endsWith(':free'))) {
    data = await requestOpenRouter('/chat/completions', {
      ...request,
      body: { ...request.body, max_tokens: Math.min(4096, Math.max(maxTokens * 2, 1600)) }
    });
    choice = data?.choices?.[0];
  }
  if (!choice || typeof choice.message?.content !== "string" || !choice.message.content.trim()) {
    throw new OpenRouterError("OpenRouter returned no text completion", {
      status: 502,
      code: "OPENROUTER_EMPTY_COMPLETION",
      retryable: true
    });
  }

  return {
    provider: "openrouter",
    id: data.id || null,
    model: data.model || selectedModel,
    content: choice.message.content,
    finishReason: choice.finish_reason || null,
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0
    }
  };
};

const listModels = async () => {
  const data = await requestOpenRouter("/models");
  if (!Array.isArray(data?.data)) {
    throw new OpenRouterError("OpenRouter returned an invalid model list", {
      status: 502,
      code: "OPENROUTER_INVALID_MODELS",
      retryable: true
    });
  }
  return data.data;
};

const getStatus = () => {
  const config = getOpenRouterConfig();
  return {
    provider: "openrouter",
    configured: Boolean(config.apiKey),
    baseUrl: config.baseUrl,
    defaultModel: config.defaultModel,
    timeoutMs: config.timeoutMs
  };
};

module.exports = {
  OpenRouterError,
  createChatCompletion,
  listModels,
  getStatus
};
