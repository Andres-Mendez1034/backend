import chatbotService from "../services/chatbot.service.js";

/**
 * Enviar mensaje al chatbot
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const user = req.user || null;

    const result = await chatbotService.processMessage(message, user);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Historial de conversación (placeholder listo para DB)
 */
export const getHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // aquí luego conectas base de datos (Mongo/Postgres)
    const history = [];

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};