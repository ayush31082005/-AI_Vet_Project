const openRouterService = require("../services/openRouterService");
const nvidiaService = require("../services/nvidiaService");

const getOpenRouterStatus = (req, res) => res.status(200).json({
  success: true,
  provider: openRouterService.getStatus()
});

const getNvidiaStatus = (req, res) => res.status(200).json({
  success: true,
  provider: nvidiaService.getStatus()
});

module.exports = { getOpenRouterStatus, getNvidiaStatus };
