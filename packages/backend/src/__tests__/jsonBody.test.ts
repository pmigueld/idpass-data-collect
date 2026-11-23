/**
 * body-parser 2 leaves req.body undefined when a request has no entity.
 * jsonBody restores an empty object, keeps the configured size limit, and
 * still rejects malformed JSON.
 */
import express from "express";
import request from "supertest";
import { jsonBody } from "../middlewares/jsonBody";
import { errorHandler } from "../middlewares/errorHandlers";

function buildApp(limit = "1mb"): express.Express {
  const app = express();
  app.use(jsonBody({ limit }));
  app.get("/echo", (req, res) => {
    res.json({ body: req.body });
  });
  app.post("/echo", (req, res) => {
    res.json({ body: req.body });
  });
  app.use(errorHandler);
  return app;
}

describe("jsonBody", () => {
  it("sets req.body to an empty object when the request has no body", async () => {
    const response = await request(buildApp()).get("/echo");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ body: {} });
  });

  it("parses a JSON object", async () => {
    const response = await request(buildApp()).post("/echo").send({ name: "ada" });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ body: { name: "ada" } });
  });

  it("rejects malformed JSON with 400", async () => {
    const response = await request(buildApp())
      .post("/echo")
      .set("Content-Type", "application/json")
      .send("{");
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toEqual(expect.any(String));
  });

  it("rejects a body over the configured limit with 413", async () => {
    const response = await request(buildApp("100b")).post("/echo").send({
      padding: "x".repeat(200),
    });
    expect(response.status).toBe(413);
    expect(response.body.success).toBe(false);
  });
});
