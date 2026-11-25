require('dotenv').config({ quiet: true });
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const AIModel = require('../models/AIModel');
const openRouter = require('../services/openRouterService');
const { getOpenRouterConfig, getNvidiaConfig } = require('../config/aiProviders');

async function setup() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  await AIModel.init();
  const routerConfig = getOpenRouterConfig();
  if (routerConfig.apiKey) {
    try {
      const models = await openRouter.listModels();
      let imported = 0;
      for (const model of models) {
        if (typeof model.id !== 'string' || !model.id.trim() || model.id.length > 250) continue;
        const outputs = model.architecture?.output_modalities;
        if (Array.isArray(outputs) && !outputs.includes('text')) continue;
        await AIModel.updateOne({ provider: 'openrouter', modelId: model.id }, {
          $set: { lastSyncedAt: new Date() },
          $setOnInsert: {
            displayName: String(model.name || model.id).slice(0, 150),
            description: String(model.description || '').slice(0, 1000),
            useCases: AIModel.USE_CASES, capabilities: ['text'],
            source: 'provider', isEnabled: false, priority: 1000
          }
        }, { upsert: true, runValidators: true });
        imported += 1;
      }
      console.log(JSON.stringify({ provider: 'openrouter', catalogImported: imported }));
    } catch (error) {
      console.log(JSON.stringify({ provider: 'openrouter', catalogImported: false, error: error.name, code: String(error.code || 'CATALOG_FAILED').slice(0, 80) }));
    }
  }
  for (const [provider, config] of [['openrouter', routerConfig], ['nvidia', getNvidiaConfig()]]) {
    if (!config.apiKey) continue;
    const existing = await AIModel.findOne({ provider, modelId: config.defaultModel });
    if (existing) {
      existing.isEnabled = true;
      existing.useCases = [...new Set([...existing.useCases, 'pet_health_chat'])];
      await existing.save();
    } else {
      await AIModel.create({
        provider, modelId: config.defaultModel, displayName: config.defaultModel,
        useCases: AIModel.USE_CASES, capabilities: ['text'],
        isEnabled: true, priority: 100, source: 'manual'
      });
    }
    console.log(JSON.stringify({ provider, configuredDefaultEnabled: true }));
  }
  console.log(JSON.stringify({ totalModels: await AIModel.countDocuments(), enabledModels: await AIModel.countDocuments({ isEnabled: true }) }));
}

setup().catch(error => {
  console.error(JSON.stringify({ setupFailed: true, type: error.name, code: error.code }));
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
