exports.bookingBroadcastKey = (bookingId) => `booking:broadcast:${bookingId}`;

exports.bookingLockKey = (bookingId) => `booking:lock:${bookingId}`;

exports.bookingOtpKey = (bookingId) => `booking:otp:${bookingId}`;

exports.latestAddressKey = (userId) => `user:latest-address:${userId}`;
