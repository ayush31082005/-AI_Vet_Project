require('dotenv').config({ quiet: true });
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const AIModel = require('../models/AIModel');
const { getNvidiaConfig } = require('../config/aiProviders');

async function sync() {
  const config = getNvidiaConfig();
  if (!config.apiKey) throw new Error('NVIDIA_NOT_CONFIGURED');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  let model = await AIModel.findOne({ provider: 'nvidia', modelId: config.defaultModel });
  if (!model) model = new AIModel({ provider: 'nvidia', modelId: config.defaultModel, displayName: config.defaultModel, useCases: AIModel.USE_CASES });
  model.isEnabled = true;
  model.priority = 10;
  model.useCases = [...new Set([...model.useCases, 'pet_health_chat'])];
  await model.save();
  // Disable only the exact legacy model confirmed to fail, preserving other models.
  if (config.defaultModel !== 'meta/llama-3.1-8b-instruct') {
    await AIModel.updateOne({ provider: 'nvidia', modelId: 'meta/llama-3.1-8b-instruct' }, { $set: { isEnabled: false, defaultFor: [] } });
  }
  console.log(JSON.stringify({ configuredModelEnabled: true, enabledNvidiaModels: await AIModel.countDocuments({ provider: 'nvidia', isEnabled: true }) }));
}
sync().catch(error => { console.error(JSON.stringify({ failed: true, type: error.name, code: error.code })); process.exitCode = 1; }).finally(() => mongoose.disconnect());
