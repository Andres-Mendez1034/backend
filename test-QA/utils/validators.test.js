import validator from "validator";

describe("VALIDATORS", () => {

  test("Debe validar email correcto", () => {

    const email = "test@mail.com";

    const isValid = validator.isEmail(
      email
    );

    expect(isValid).toBe(true);

  });

  test("Debe rechazar email inválido", () => {

    const email = "correo-invalido";

    const isValid = validator.isEmail(
      email
    );

    expect(isValid).toBe(false);

  });

  test("Debe validar password fuerte", () => {

    const password = "Password123!";

    const isStrong = validator.isStrongPassword(
      password
    );

    expect(isStrong).toBe(true);

  });

  test("Debe rechazar password débil", () => {

    const password = "123";

    const isStrong = validator.isStrongPassword(
      password
    );

    expect(isStrong).toBe(false);

  });

});