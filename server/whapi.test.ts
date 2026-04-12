import { describe, it, expect } from "vitest";

// Valida que o WHAPI_TOKEN está configurado e a API responde corretamente
describe("WHAPI_TOKEN", () => {
  it("deve conseguir listar grupos via Whapi.Cloud", async () => {
    const token = process.env.WHAPI_TOKEN;
    expect(token, "WHAPI_TOKEN deve estar configurado").toBeTruthy();

    const res = await fetch("https://gate.whapi.cloud/groups?count=1", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    expect(res.status, "API Whapi deve retornar 200").toBe(200);
    const data = await res.json() as { groups?: unknown[] };
    expect(Array.isArray(data.groups), "Resposta deve conter array de grupos").toBe(true);
  });
});
