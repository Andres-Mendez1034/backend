function validateChatMessage(req, res, next) {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      error: "Message is required and must be a string",
    });
  }

  if (message.trim().length === 0) {
    return res.status(400).json({
      error: "Message cannot be empty",
    });
  }

  if (message.length > 2000) {
    return res.status(400).json({
      error: "Message is too long (max 2000 characters)",
    });
  }

  next();
}

module.exports = {
  validateChatMessage,
};