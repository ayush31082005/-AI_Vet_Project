require('dotenv').config({ quiet: true });
const { getOpenRouterConfig } = require('../config/aiProviders');

async function check() {
  const config = getOpenRouterConfig();
  if (!config.apiKey) throw new Error('NOT_CONFIGURED');
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'openrouter/free', messages: [{ role: 'system', content: 'You are a helpful assistant. Answer briefly.' }, { role: 'user', content: 'Reply only with OK.' }], max_tokens: 800, temperature: 0.2, stream: false }),
    signal: AbortSignal.timeout(30000)
  });
  const data = await response.json();
  // Never print provider text, headers, credentials or conversation content.
  const message = String(data.error?.message || '').toLowerCase();
  console.log(JSON.stringify({
    status: response.status, code: data.error?.code,
    hasText: typeof data.choices?.[0]?.message?.content === 'string',
    finishReason: data.choices?.[0]?.finish_reason,
    embeddedErrorCode: data.choices?.[0]?.error?.code,
    cause: /data policy|privacy|data policies/.test(message) ? 'DATA_POLICY'
      : /credit|balance/.test(message) ? 'CREDITS'
      : /key|auth|unauthorized/.test(message) ? 'AUTH'
      : /rate|limit/.test(message) ? 'RATE_LIMIT'
      : /endpoint|provider/.test(message) ? 'NO_ENDPOINT'
      : /model/.test(message) ? 'MODEL' : 'OTHER'
  }));
}
check().catch(error => { console.log(JSON.stringify({ error: error.name, networkCode: error.cause?.code })); process.exitCode = 1; });
