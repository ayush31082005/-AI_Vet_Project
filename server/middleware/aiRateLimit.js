const windows = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 10;

const aiRateLimit = (req, res, next) => {
  const key = req.user?.id;
  if (!key) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  const now = Date.now();
  let entry = windows.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
  }
  entry.count += 1;
  windows.set(key, entry);

  res.set("X-RateLimit-Limit", String(MAX_REQUESTS));
  res.set("X-RateLimit-Remaining", String(Math.max(0, MAX_REQUESTS - entry.count)));
  res.set("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: "Too many AI requests. Please try again later."
    });
  }

  if (windows.size > 10000) {
    for (const [storedKey, storedEntry] of windows) {
      if (storedEntry.resetAt <= now) windows.delete(storedKey);
    }
  }
  return next();
};

module.exports = aiRateLimit;
