const request = require("supertest");
const jwt = require("jsonwebtoken");
const { connect, closeDatabase, clearDatabase } = require("./setup");

let app;
let User;
let Disaster;
let Notification;

beforeAll(async () => {
  await connect();
  app = require("../app");
  User = require("../models/User");
  Disaster = require("../models/Disaster");
  Notification = require("../models/Notification");
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

const createUser = async (role = "admin", email = "admin@rescuenet.io") => {
  const user = await User.create({
    name: `Test ${role}`,
    email,
    password: "hashed",
    role
  });
  const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return { user, token };
};

const validDisasterPayload = () => ({
  title: "Chennai Flood 2025",
  type: "flood",
  location: { address: "Chennai, IN", lat: 13.08, lng: 80.27 },
  severity: "high",
  description: "Widespread urban flooding across the city",
  affectedPeople: 15000
});

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

describe("GET /api/disasters", () => {
  it("returns 401 without auth", async () => {
    const res = await request(app).get("/api/disasters");
    expect(res.status).toBe(401);
  });

  it("returns empty list initially", async () => {
    const { token } = await createUser("admin");
    const res = await request(app).get("/api/disasters").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns disasters sorted by createdAt desc", async () => {
    const { token } = await createUser("admin");
    await Disaster.create({ ...validDisasterPayload(), title: "Older" });
    await new Promise((resolve) => setTimeout(resolve, 20));
    await Disaster.create({ ...validDisasterPayload(), title: "Newer" });

    const res = await request(app).get("/api/disasters").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].title).toBe("Newer");
  });
});

describe("POST /api/disasters", () => {
  it("creates a disaster and returns 201", async () => {
    const { token } = await createUser("admin");
    const payload = validDisasterPayload();

    const res = await request(app).post("/api/disasters").set(authHeader(token)).send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: payload.title,
      type: payload.type,
      severity: payload.severity,
      affectedPeople: payload.affectedPeople,
      status: "reported"
    });
    expect(res.body.location).toMatchObject(payload.location);
  });

  it("creates notifications for every volunteer when a disaster is reported", async () => {
    const { token } = await createUser("admin");
    await User.create({ name: "Vol 1", email: "v1@test.io", password: "x", role: "volunteer" });
    await User.create({ name: "Vol 2", email: "v2@test.io", password: "x", role: "volunteer" });
    await User.create({ name: "Relief", email: "r@test.io", password: "x", role: "relief_center" });

    const res = await request(app)
      .post("/api/disasters")
      .set(authHeader(token))
      .send({ ...validDisasterPayload(), severity: "critical" });
    expect(res.status).toBe(201);

    const notifs = await Notification.find({});
    expect(notifs).toHaveLength(2);
    expect(notifs[0].type).toBe("critical");
    expect(notifs.every((n) => n.message.includes("Chennai Flood 2025"))).toBe(true);
  });

  it("returns 422 when location coordinates are out of range", async () => {
    const { token } = await createUser("admin");
    const res = await request(app)
      .post("/api/disasters")
      .set(authHeader(token))
      .send({ ...validDisasterPayload(), location: { address: "Nowhere", lat: 999, lng: 80 } });
    expect(res.status).toBe(422);
  });

  it("returns 422 for an invalid disaster type", async () => {
    const { token } = await createUser("admin");
    const res = await request(app)
      .post("/api/disasters")
      .set(authHeader(token))
      .send({ ...validDisasterPayload(), type: "meteor-strike" });
    expect(res.status).toBe(422);
  });

  it("returns 422 for an invalid severity", async () => {
    const { token } = await createUser("admin");
    const res = await request(app)
      .post("/api/disasters")
      .set(authHeader(token))
      .send({ ...validDisasterPayload(), severity: "apocalyptic" });
    expect(res.status).toBe(422);
  });
});

describe("PATCH /api/disasters/:id/status", () => {
  it("accepts a valid status transition (reported -> assessed)", async () => {
    const { token } = await createUser("admin");
    const disaster = await Disaster.create({ ...validDisasterPayload() });

    const res = await request(app)
      .patch(`/api/disasters/${disaster._id}/status`)
      .set(authHeader(token))
      .send({ status: "assessed" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("assessed");
  });

  it("rejects a non-adjacent transition (reported -> closed)", async () => {
    const { token } = await createUser("admin");
    const disaster = await Disaster.create({ ...validDisasterPayload() });

    const res = await request(app)
      .patch(`/api/disasters/${disaster._id}/status`)
      .set(authHeader(token))
      .send({ status: "closed" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid status transition/i);
  });

  it("returns 404 for an unknown disaster id", async () => {
    const { token } = await createUser("admin");
    const res = await request(app)
      .patch("/api/disasters/64b000000000000000000000/status")
      .set(authHeader(token))
      .send({ status: "assessed" });

    expect(res.status).toBe(404);
  });

  it("returns 422 for an invalid status value", async () => {
    const { token } = await createUser("admin");
    const disaster = await Disaster.create({ ...validDisasterPayload() });

    const res = await request(app)
      .patch(`/api/disasters/${disaster._id}/status`)
      .set(authHeader(token))
      .send({ status: "gone" });

    expect(res.status).toBe(422);
  });
});

describe("GET /api/disasters/stats", () => {
  it("returns aggregated counts by status and severity", async () => {
    const { token } = await createUser("admin");
    await Disaster.create({ ...validDisasterPayload(), severity: "low" });
    await Disaster.create({ ...validDisasterPayload(), title: "Quake A", type: "earthquake", severity: "high" });
    const active = await Disaster.create({ ...validDisasterPayload(), title: "Cyc A", type: "cyclone", severity: "critical" });
    active.status = "assessed";
    await active.save();
    active.status = "active";
    await active.save();

    const res = await request(app).get("/api/disasters/stats").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.activeCount).toBe(1);
    expect(res.body.bySeverity).toMatchObject({ low: 1, high: 1, critical: 1 });
    expect(res.body.byStatus).toMatchObject({ reported: 2, active: 1 });
  });
});
