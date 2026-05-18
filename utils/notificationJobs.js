const cron = require("node-cron");
const Order = require("../models/Order");
const whatsappService = require("../services/whatsappService");

/**
 * Core logic to check for abandoned carts and send reminders.
 */
const checkAbandonedCarts = async () => {
  console.log("[Notification Job] Checking for abandoned carts...");
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    // Find orders that are still in CREATED status and were created more than 2 hours ago
    const abandonedOrders = await Order.find({
      status: "CREATED",
      isReminderSent: false,
      createdAt: { $lt: twoHoursAgo }
    }).populate("user").populate("service");

    let sentCount = 0;

    for (const order of abandonedOrders) {
      if (order.user && order.user.phone && order.service) {
        await whatsappService.sendAbandonedCartReminder(order.user, order.service.name);
        order.isReminderSent = true;
        await order.save();
        sentCount++;
      }
    }

    if (sentCount > 0) {
      console.log(`[Notification Job] Successfully sent ${sentCount} abandoned cart reminders.`);
    } else {
      console.log("[Notification Job] No pending reminders found.");
    }
  } catch (error) {
    console.error("[Notification Job] Error during abandoned cart check:", error);
  }
};

/**
 * Scheduled job to send reminders.
 * Runs every hour.
 */
const startNotificationJobs = () => {
  // Run once immediately on startup
  checkAbandonedCarts();

  // CRON Schedule: Every hour
  cron.schedule("0 * * * *", checkAbandonedCarts);

  console.log("[Notification Job] WhatsApp Reminder System initialized (1h interval).");
};

module.exports = { startNotificationJobs };
