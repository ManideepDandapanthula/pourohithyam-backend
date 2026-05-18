const cron = require("node-cron");
const SaamuhikamPooja = require("../models/SaamuhikamPooja");

/**
 * Parses a date object and a time string (e.g., "10:30 AM") 
 * into a single unified Date object.
 */
const parseDateTime = (date, timeStr) => {
  const d = new Date(date);
  const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  
  if (!timeMatch) return d;

  let hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2]);
  const period = timeMatch[3].toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  d.setHours(hours, minutes, 0, 0);
  return d;
};

/**
 * Core logic to check and delete expired poojas.
 */
const performCleanup = async () => {
  console.log("[Cleanup Job] Checking for expired Saamuhikam Poojas...");
  try {
    const allPoojas = await SaamuhikamPooja.find({});
    const now = new Date();
    let deletedCount = 0;

    for (const pooja of allPoojas) {
      if (!pooja.date || !pooja.time) continue;

      const ritualTime = parseDateTime(pooja.date, pooja.time);
      
      // If ritual time is in the past, delete it
      if (ritualTime < now) {
        await SaamuhikamPooja.findByIdAndDelete(pooja._id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[Cleanup Job] Successfully deleted ${deletedCount} expired rituals.`);
    } else {
      console.log("[Cleanup Job] No expired rituals found.");
    }
  } catch (error) {
    console.error("[Cleanup Job] Error during cleanup:", error);
  }
};

/**
 * Scheduled job to remove past Saamuhikam Poojas.
 * Runs every 30 minutes.
 */
const startCleanupJob = () => {
  // Run once immediately on startup
  performCleanup();

  // CRON Schedule: Every 30 minutes
  cron.schedule("*/30 * * * *", performCleanup);

  console.log("[Cleanup Job] Saamuhikam Auto-Cleanup initialized (30m interval).");
};

module.exports = { startCleanupJob };
