import bcrypt from "bcrypt";

describe("HASH UTILS", () => {

  test("Debe generar hash correctamente", async () => {

    const password = "Password123!";

    const hash = await bcrypt.hash(
      password,
      10
    );

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);

  });

  test("Debe validar password correctamente", async () => {

    const password = "Password123!";

    const hash = await bcrypt.hash(
      password,
      10
    );

    const isValid = await bcrypt.compare(
      password,
      hash
    );

    expect(isValid).toBe(true);

  });

  test("Debe rechazar password incorrecta", async () => {

    const password = "Password123!";

    const hash = await bcrypt.hash(
      password,
      10
    );

    const isValid = await bcrypt.compare(
      "WrongPassword",
      hash
    );

    expect(isValid).toBe(false);

  });

});