import axios from "axios";

class ChatbotService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.baseURL = "https://api.deepseek.com/v1/chat/completions";
  }

  async processMessage(message, user = null) {
    if (!message) {
      throw new Error("Message is required");
    }

    const aiResponse = await this.callDeepSeek(message);

    return {
      reply: aiResponse,
      timestamp: new Date(),
      user: user ? user.id : null,
    };
  }

  async callDeepSeek(message) {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `
Eres un consultor senior en marketing de performance especializado en microinfluencers, crecimiento de negocios locales y e-commerce.

Tu objetivo principal es ayudar a negocios pequeños y medianos a generar ventas reales mediante estrategias de influencers, no solo visibilidad.

REGLAS DE RESPUESTA:
- Sé directo, claro y estratégico. Evita frases genéricas o motivacionales vacías.
- Prioriza acciones concretas que el usuario pueda ejecutar hoy.
- Recomienda tipos específicos de microinfluencers (nicho, tamaño de audiencia, tipo de contenido).
- Explica el porqué de cada recomendación desde una lógica de marketing.
- Si el usuario tiene un negocio, adapta la estrategia a su producto o servicio.
- Evita ideas virales sin intención de conversión (ej: bailes o trends sin contexto de ventas).
- Piensa siempre en retorno de inversión (ROI) y conversión a ventas.

ESTILO:
- Profesional pero cercano
- Tipo agencia de marketing de alto nivel
- Sin exageraciones ni humo
- Estructurado cuando sea necesario (listas, pasos, estrategias)

CONTEXTO:
El usuario puede no saber de marketing. Debes guiarlo como un asesor experto que traduce lo complejo en acciones simples.
              `.trim(),
            },
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data?.choices?.[0]?.message?.content;
    } catch (error) {
      console.error(
        "DeepSeek error:",
        error.response?.data || error.message
      );

      return "Lo siento, hubo un problema procesando tu solicitud en este momento.";
    }
  }
}

const chatbotService = new ChatbotService();

export default chatbotService;