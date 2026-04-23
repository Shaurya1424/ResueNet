const request = require("supertest");
const mongoose = require("mongoose");
const { connect, closeDatabase } = require("./setup");

let app;

beforeAll(async () => {
  await connect();
  app = require("../app");
});

afterAll(async () => {
  await closeDatabase();
});

describe("Health endpoints", () => {
  describe("GET /api/health", () => {
    it("returns 200 with status, uptime, and db readyState", async () => {
      const res = await request(app).get("/api/health");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: "ok" });
      expect(typeof res.body.uptime).toBe("number");
      expect(res.body.uptime).toBeGreaterThanOrEqual(0);
      expect(typeof res.body.db).toBe("number");
      expect(typeof res.body.timestamp).toBe("string");
    });

    it("reports connected db state (readyState === 1)", async () => {
      const res = await request(app).get("/api/health");
      expect(res.body.db).toBe(mongoose.connection.readyState);
      expect(res.body.db).toBe(1);
    });
  });

  describe("GET /api/ready", () => {
    it("returns 200 ready when mongoose is connected", async () => {
      const res = await request(app).get("/api/ready");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ready" });
    });
  });

  describe("GET /api/metrics", () => {
    it("exposes Prometheus-formatted metrics", async () => {
      const res = await request(app).get("/api/metrics");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/text\/plain/);
      expect(res.text).toContain("http_requests_total");
      expect(res.text).toContain("active_disasters_gauge");
      expect(res.text).toContain("deployed_volunteers_gauge");
    });
  });

  describe("GET /", () => {
    it("returns a plain text banner", async () => {
      const res = await request(app).get("/");
      expect(res.status).toBe(200);
      expect(res.text).toMatch(/RescueNet/i);
    });
  });
});
