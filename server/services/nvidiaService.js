const { getNvidiaConfig } = require("../config/aiProviders");

class NvidiaError extends Error {
  constructor(message, { status = 502, code = "NVIDIA_ERROR", retryable = false } = {}) {
    super(message);
    this.name = "NvidiaError";
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

const requestNvidia = async (body) => {
  const config = getNvidiaConfig();
  if (!config.apiKey) {
    throw new NvidiaError("NVIDIA Build AI is not configured", {
      status: 503,
      code: "NVIDIA_NOT_CONFIGURED"
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new NvidiaError("NVIDIA returned an invalid response", {
        status: 502,
        code: "NVIDIA_INVALID_RESPONSE",
        retryable: true
      });
    }

    if (!response.ok || data?.error) {
      const providerStatus = Number(data?.error?.code) || response.status;
      const code = providerStatus === 401 ? 'NVIDIA_AUTH_FAILED'
        : providerStatus === 403 ? 'NVIDIA_ACCESS_DENIED'
        : providerStatus === 404 ? 'NVIDIA_MODEL_UNAVAILABLE'
        : providerStatus === 429 ? 'NVIDIA_RATE_LIMIT'
        : providerStatus === 402 ? 'NVIDIA_CREDITS_REQUIRED'
        : 'NVIDIA_REQUEST_FAILED';
      const retryable = response.status === 429 || response.status >= 500;
      throw new NvidiaError("NVIDIA request failed", {
        status: response.status === 429 ? 429 : 502,
        code,
        retryable
      });
    }
    return data;
  } catch (error) {
    if (error instanceof NvidiaError) throw error;
    if (error.name === "AbortError") {
      throw new NvidiaError("NVIDIA request timed out", {
        status: 504,
        code: "NVIDIA_TIMEOUT",
        retryable: true
      });
    }
    throw new NvidiaError("NVIDIA Build AI is currently unavailable", {
      status: 502,
      code: "NVIDIA_UNAVAILABLE",
      retryable: true
    });
  } finally {
    clearTimeout(timer);
  }
};

const validateMessages = (messages) => {
  const allowedRoles = ["system", "user", "assistant"];
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
    throw new NvidiaError("Messages must contain between 1 and 50 items", {
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
    throw new NvidiaError("Each message requires a valid role and text content", {
      status: 400,
      code: "INVALID_AI_MESSAGE"
    });
  }
};

const createChatCompletion = async ({
  messages,
  model,
  temperature = 0.2,
  maxTokens = 800,
  topP = 0.9
}) => {
  validateMessages(messages);
  const config = getNvidiaConfig();
  const selectedModel = model || config.defaultModel;

  if (typeof selectedModel !== "string" || !selectedModel.trim()) {
    throw new NvidiaError("A valid NVIDIA model is required", {
      status: 400,
      code: "INVALID_AI_MODEL"
    });
  }
  if (!Number.isFinite(temperature) || temperature < 0 || temperature > 1) {
    throw new NvidiaError("Temperature must be between 0 and 1", {
      status: 400,
      code: "INVALID_AI_TEMPERATURE"
    });
  }
  if (!Number.isFinite(topP) || topP <= 0 || topP > 1) {
    throw new NvidiaError("topP must be greater than 0 and at most 1", {
      status: 400,
      code: "INVALID_AI_TOP_P"
    });
  }
  if (!Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > 4096) {
    throw new NvidiaError("maxTokens must be between 1 and 4096", {
      status: 400,
      code: "INVALID_AI_MAX_TOKENS"
    });
  }

  const data = await requestNvidia({
    model: selectedModel.trim(),
    messages,
    temperature,
    top_p: topP,
    max_tokens: maxTokens,
    stream: false
  });
  const choice = data?.choices?.[0];
  if (!choice || typeof choice.message?.content !== "string" || !choice.message.content.trim()) {
    throw new NvidiaError("NVIDIA returned no text completion", {
      status: 502,
      code: "NVIDIA_EMPTY_COMPLETION",
      retryable: true
    });
  }

  return {
    provider: "nvidia",
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

const getStatus = () => {
  const config = getNvidiaConfig();
  return {
    provider: "nvidia",
    configured: Boolean(config.apiKey),
    baseUrl: config.baseUrl,
    defaultModel: config.defaultModel,
    timeoutMs: config.timeoutMs
  };
};

module.exports = {
  NvidiaError,
  createChatCompletion,
  getStatus
};
