const request = require("supertest");
const jwt = require("jsonwebtoken");
const { connect, closeDatabase, clearDatabase } = require("./setup");

let app;
let User;
let Volunteer;

beforeAll(async () => {
  await connect();
  app = require("../app");
  User = require("../models/User");
  Volunteer = require("../models/Volunteer");
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

const validAdmin = {
  name: "Ada Admin",
  email: "ada@rescuenet.io",
  password: "secret123",
  role: "admin"
};

const validVolunteer = {
  name: "Vic Volunteer",
  email: "vic@rescuenet.io",
  password: "secret123",
  role: "volunteer"
};

describe("POST /api/auth/register", () => {
  it("registers a new user and returns 201 with userId", async () => {
    const res = await request(app).post("/api/auth/register").send(validAdmin);

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/registered/i);
    expect(res.body.userId).toBeDefined();

    const user = await User.findOne({ email: validAdmin.email });
    expect(user).not.toBeNull();
    expect(user.password).not.toBe(validAdmin.password);
  });

  it("auto-creates a Volunteer profile when role is 'volunteer'", async () => {
    const res = await request(app).post("/api/auth/register").send(validVolunteer);
    expect(res.status).toBe(201);

    const profile = await Volunteer.findOne({ userId: res.body.userId });
    expect(profile).not.toBeNull();
    expect(profile.status).toBe("available");
  });

  it("does not create a Volunteer profile for non-volunteer roles", async () => {
    const res = await request(app).post("/api/auth/register").send(validAdmin);
    expect(res.status).toBe(201);

    const profile = await Volunteer.findOne({ userId: res.body.userId });
    expect(profile).toBeNull();
  });

  it("rejects duplicate email with 400", async () => {
    await request(app).post("/api/auth/register").send(validAdmin);
    const res = await request(app).post("/api/auth/register").send(validAdmin);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("returns 422 when required fields are missing", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "x@y.z" });
    expect(res.status).toBe(422);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it("returns 422 for invalid email format", async () => {
    const res = await request(app).post("/api/auth/register").send({
      ...validAdmin,
      email: "not-an-email"
    });
    expect(res.status).toBe(422);
  });

  it("returns 422 for invalid role", async () => {
    const res = await request(app).post("/api/auth/register").send({
      ...validAdmin,
      role: "overlord"
    });
    expect(res.status).toBe(422);
  });

  it("returns 422 when password is shorter than 6 characters", async () => {
    const res = await request(app).post("/api/auth/register").send({
      ...validAdmin,
      password: "123"
    });
    expect(res.status).toBe(422);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(validAdmin);
  });

  it("returns JWT and user on valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: validAdmin.email,
      password: validAdmin.password
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toMatchObject({
      email: validAdmin.email,
      name: validAdmin.name,
      role: validAdmin.role
    });

    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.role).toBe(validAdmin.role);
    expect(decoded.id).toBe(String(res.body.user.id));
  });

  it("rejects wrong password with 400", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: validAdmin.email,
      password: "wrong-password"
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it("rejects unknown email with 400", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "ghost@rescuenet.io",
      password: "whatever"
    });
    expect(res.status).toBe(400);
  });

  it("returns 422 when email/password are missing", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(422);
  });
});

describe("Route protection", () => {
  it("blocks protected routes without a bearer token", async () => {
    const res = await request(app).get("/api/disasters");
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/no token/i);
  });

  it("blocks protected routes with an invalid bearer token", async () => {
    const res = await request(app).get("/api/disasters").set("Authorization", "Bearer garbage");
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });
});
