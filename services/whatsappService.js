const axios = require("axios");

/**
 * WhatsApp Notification Service
 * Note: Update the environment variables in .env to use a real API.
 */

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "https://api.whatsapp.com/send"; // Placeholder
const WHATSAPP_AUTH_TOKEN = process.env.WHATSAPP_AUTH_TOKEN;
const WHATSAPP_SENDER_NUMBER = process.env.WHATSAPP_SENDER_NUMBER;

const sendWhatsAppMessage = async (to, message) => {
  try {
    if (!WHATSAPP_AUTH_TOKEN || !WHATSAPP_SENDER_NUMBER) {
      console.log(`[WhatsApp Mock] Sending to ${to}: ${message}`);
      return { success: true, mock: true };
    }

    // Example integration for a provider like Twilio or Meta WhatsApp Business API
    // This is a generic structure.
    const response = await axios.post(WHATSAPP_API_URL, {
      messaging_product: "whatsapp",
      to: to.startsWith("+") ? to : `+${to}`,
      type: "text",
      text: { body: message }
    }, {
      headers: {
        "Authorization": `Bearer ${WHATSAPP_AUTH_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    return response.data;
  } catch (error) {
    console.error(`[WhatsApp Error] Failed to send message to ${to}:`, error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Notify customer of a successful priest booking.
 */
exports.sendPoojaConfirmationToCustomer = async (user, bookingDetails) => {
  const message = `Hello ${user.name}! 🌟 Your pooja booking for "${bookingDetails.poojaName}" is confirmed for ${bookingDetails.date} at ${bookingDetails.time}. Our priest will be there soon. Thank you for choosing PujaKart! 🙏`;
  return await sendWhatsAppMessage(user.phone, message);
};

/**
 * Notify priest of a new booking.
 */
exports.sendPoojaConfirmationToPriest = async (priest, bookingDetails) => {
  const message = `Namasthe ${priest.name} ji! 🙏 You have a new booking for "${bookingDetails.poojaName}" on ${bookingDetails.date} at ${bookingDetails.time}. Customer: ${bookingDetails.customerName}. Please log in to view details.`;
  return await sendWhatsAppMessage(priest.phone, message);
};

/**
 * Notify customer of a successful Samuhikam booking.
 */
exports.sendSamuhikamConfirmationToCustomer = async (user, poojaDetails) => {
  const message = `Namasthe ${user.name}! 🌸 You have successfully registered for the Saamuhikam Pooja "${poojaDetails.name}" on ${poojaDetails.date} at ${poojaDetails.time}. We look forward to your participation! 🙏`;
  return await sendWhatsAppMessage(user.phone, message);
};

/**
 * Send abandoned cart reminder.
 */
exports.sendAbandonedCartReminder = async (user, poojaName) => {
  const message = `Hello ${user.name}! 😊 We noticed you have a pending pooja "${poojaName}" in your cart. Would you like to complete the booking now to ensure your preferred slot? Visit PujaKart to proceed. 🙏`;
  return await sendWhatsAppMessage(user.phone, message);
};
