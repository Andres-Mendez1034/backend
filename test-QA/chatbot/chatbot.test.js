import request from "supertest";
import app from "../../src/app.js";

describe("CHATBOT", () => {

  test("Debe fallar si no se envía mensaje", async () => {

    const response = await request(app)
      .post("/api/chatbot")
      .send({});

    expect([400, 422]).toContain(response.status);

  });

  test("Debe fallar si el mensaje está vacío", async () => {

    const response = await request(app)
      .post("/api/chatbot")
      .send({
        message: ""
      });

    expect([400, 422]).toContain(response.status);

  });

  test("Debe responder correctamente a un mensaje válido", async () => {

    const response = await request(app)
      .post("/api/chatbot")
      .send({
        message: "Hola, necesito ayuda con mi pedido"
      });

    expect([200, 201]).toContain(response.status);

  });

  test("Debe manejar mensajes largos sin romperse", async () => {

    const longMessage = "Hola ".repeat(500);

    const response = await request(app)
      .post("/api/chatbot")
      .send({
        message: longMessage
      });

    expect(response.status).not.toBe(500);

  });

});