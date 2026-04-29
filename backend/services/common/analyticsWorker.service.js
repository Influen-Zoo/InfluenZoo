const { aggregateEvents } = require('./analyticsAggregation.service');

let intervalHandle = null;
let running = false;

const runOnce = async () => {
  if (running) return;
  running = true;
  try {
    const result = await aggregateEvents();
    if (result.processed || result.failed.length) {
      console.log(`Analytics aggregation processed=${result.processed} failed=${result.failed.length}`);
    }
  } catch (error) {
    console.error('Analytics aggregation worker failed:', error);
  } finally {
    running = false;
  }
};

const startAnalyticsWorker = () => {
  if (process.env.ANALYTICS_WORKER_ENABLED === 'false' || intervalHandle) return;

  const intervalMs = Number(process.env.ANALYTICS_WORKER_INTERVAL_MS || 60000);
  intervalHandle = setInterval(runOnce, intervalMs);
  if (intervalHandle.unref) intervalHandle.unref();
};

const stopAnalyticsWorker = () => {
  if (!intervalHandle) return;
  clearInterval(intervalHandle);
  intervalHandle = null;
};

module.exports = {
  startAnalyticsWorker,
  stopAnalyticsWorker,
  runOnce,
};
