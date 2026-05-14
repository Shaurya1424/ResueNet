/**
 * Seed MongoDB with demo data (~6 docs per main collection + admin).
 * Each relief center lists six resource needs; resources/notifications/audit
 * are sized for dashboard and analytics demos.
 *
 * Usage (from backend/):
 *   MONGO_URI=mongodb://localhost:27017/disasterDB node scripts/seed.js
 *
 * Compose default DB matches docker-compose (disasterDB on host port 27017):
 *   npm run seed
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/User");
const Disaster = require("../models/Disaster");
const ReliefCenter = require("../models/ReliefCenter");
const Resource = require("../models/Resource");
const Volunteer = require("../models/Volunteer");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/disasterDB";
const demoPassword = "secret123";

/** Six line items per hub for relief-center UI tables. */
const resourceNeedsForHub = (hubIndex) => {
  const rot = hubIndex % 3;
  return [
    { resourceType: "Potable water", quantity: 180 + hubIndex * 25, urgency: rot === 0 ? "immediate" : "within 24h" },
    { resourceType: "Ready meals", quantity: 60 + hubIndex * 8, urgency: rot === 1 ? "immediate" : "48h window" },
    { resourceType: "Shelter kits", quantity: 40 + hubIndex * 6, urgency: "48h window" },
    { resourceType: "Hygiene packs", quantity: 120 + hubIndex * 10, urgency: "within 24h" },
    { resourceType: "Infant formula", quantity: 25 + hubIndex * 4, urgency: "immediate" },
    { resourceType: "Medical kits (basic)", quantity: 35 + hubIndex * 5, urgency: rot === 2 ? "immediate" : "within 24h" }
  ];
};

const clearCollections = async () => {
  await Promise.all([
    AuditLog.deleteMany({}),
    Notification.deleteMany({}),
    Resource.deleteMany({}),
    Volunteer.deleteMany({}),
    ReliefCenter.deleteMany({}),
    Disaster.deleteMany({}),
    User.deleteMany({})
  ]);
};

async function seed() {
  await mongoose.connect(uri);
  console.log("Connected:", uri.replace(/:\/\/.*@/, "://***@"));

  await clearCollections();

  const passwordHash = await bcrypt.hash(demoPassword, 10);

  const admin = await User.create({
    name: "RescueNet Admin",
    email: "admin@rescuenet.dev",
    password: passwordHash,
    role: "admin"
  });

  const reliefUsers = [];
  for (let i = 1; i <= 6; i++) {
    reliefUsers.push(
      await User.create({
        name: `Relief Center Lead ${i}`,
        email: `center${i}@rescuenet.dev`,
        password: passwordHash,
        role: "relief_center"
      })
    );
  }

  const volUsers = [];
  for (let i = 1; i <= 6; i++) {
    volUsers.push(
      await User.create({
        name: `Volunteer ${i}`,
        email: `volunteer${i}@rescuenet.dev`,
        password: passwordHash,
        role: "volunteer"
      })
    );
  }

  const disasters = await Disaster.insertMany([
    {
      title: "Urban flash flood — East district",
      type: "flood",
      location: { lat: 28.62, lng: 77.22, address: "East District, Riverside Ave" },
      severity: "high",
      description: "Storm surge overwhelmed storm drains; 200 households need evacuation support.",
      status: "active",
      affectedPeople: 850
    },
    {
      title: "Western fault-line tremors",
      type: "earthquake",
      location: { lat: 19.08, lng: 72.88, address: "Hill Block 4, Fault Valley" },
      severity: "critical",
      description: "M6.4 aftershocks; structural inspections ongoing.",
      status: "assessed",
      affectedPeople: 3200
    },
    {
      title: "Cyclone Mala approach",
      type: "cyclone",
      location: { lat: 13.08, lng: 80.27, address: "Coastal belt, Bay Quarter" },
      severity: "high",
      description: "Category 4 landfall expected in 48h; pre-position supplies.",
      status: "reported",
      affectedPeople: 5600
    },
    {
      title: "Monsoon inundation northern plains",
      type: "flood",
      location: { lat: 26.45, lng: 80.33, address: "North Plains, Grain Belt RD" },
      severity: "medium",
      description: "Rivers plateauing; farmland and arterial roads submerged.",
      status: "active",
      affectedPeople: 1200
    },
    {
      title: "Secondary cyclone band — Bay watch",
      type: "cyclone",
      location: { lat: 15.5, lng: 80.5, address: "Mid-coast radar arc, Sector 7" },
      severity: "medium",
      description: "Outer rain bands; ports on standby; shelters pre-staging dry rations.",
      status: "active",
      affectedPeople: 2100
    },
    {
      title: "Mountain landslide aftermath",
      type: "earthquake",
      location: { lat: 30.09, lng: 78.29, address: "Hill Route 109, Checkpoint C" },
      severity: "medium",
      description: "Access road reopened; shelters at capacity.",
      status: "closed",
      affectedPeople: 670
    }
  ]);

  const centers = [];
  for (let i = 0; i < 6; i++) {
    centers.push(
      await ReliefCenter.create({
        userId: reliefUsers[i]._id,
        name: `Regional Relief Hub ${i + 1}`,
        location: {
          lat: 20 + i * 0.35,
          lng: 74 + i * 0.4,
          address: `${100 + i * 10} Community Hall Rd, Sector ${i + 1}`
        },
        capacity: 240 + i * 40,
        currentOccupancy: 30 + i * 12,
        resourcesNeeded: resourceNeedsForHub(i),
        status: ["active", "active", "overwhelmed", "active", "inactive", "active"][i]
      })
    );
  }

  const resourcesInserted = await Resource.insertMany([
    {
      name: "Rice pallets",
      type: "food",
      quantity: 400,
      disasterId: disasters[0]._id,
      unit: "kg",
      assignedTo: centers[0]._id,
      status: "dispatched",
      lastUpdated: new Date()
    },
    {
      name: "Water bladders",
      type: "water",
      quantity: 120,
      disasterId: disasters[0]._id,
      unit: "L",
      assignedTo: centers[1]._id,
      status: "available"
    },
    {
      name: "Emergency antibiotics",
      type: "medicine",
      quantity: 90,
      disasterId: disasters[1]._id,
      unit: "courses",
      assignedTo: centers[2]._id,
      status: "available"
    },
    {
      name: "ORS sachets",
      type: "medicine",
      quantity: 2000,
      disasterId: disasters[2]._id,
      unit: "units",
      assignedTo: centers[3]._id,
      status: "dispatched"
    },
    {
      name: "Family meal kits",
      type: "food",
      quantity: 180,
      disasterId: disasters[3]._id,
      unit: "kits",
      assignedTo: centers[4]._id,
      status: "depleted",
      lastUpdated: new Date()
    },
    {
      name: "Bulk drinking water",
      type: "water",
      quantity: 600,
      disasterId: disasters[4]._id,
      unit: "L",
      assignedTo: centers[5]._id,
      status: "available"
    }
  ]);

  const volunteerDocs = [];
  for (let i = 0; i < 6; i++) {
    volunteerDocs.push(
      await Volunteer.create({
        userId: volUsers[i]._id,
        disasterId: disasters[i % disasters.length]._id,
        skills: [["logistics"], ["communications", "first-aid"], ["cooking"], ["medical"], ["search"], ["data"]][i],
        assignedTask: ["Route planning", "Helpline", "Kitchen lead", "Triage booth", "", "Shelter census"][i],
        taskDescription: "Demo assignment seeded for dashboards.",
        status: ["deployed", "deployed", "available", "inactive", "available", "deployed"][i],
        location: { lat: 12.9 + i * 0.1, lng: 77.6 + i * 0.1 }
      })
    );
  }

  await Notification.insertMany([
    { userId: admin._id, message: "Seeded database baseline ready.", type: "success", read: false, relatedTo: "system" },
    { userId: volUsers[0]._id, message: "Briefing scheduled for Relief Hub 1.", type: "info", read: false, relatedTo: "Volunteer onboarding" },
    { userId: volUsers[1]._id, message: "Fuel voucher approved for corridor run.", type: "success", read: true, relatedTo: "logistics" },
    { userId: reliefUsers[0]._id, message: "Inbound water shipment ETA 06:30.", type: "warning", read: false, relatedTo: "inventory" },
    { userId: reliefUsers[2]._id, message: "Shelter nearing capacity.", type: "critical", read: false, relatedTo: "capacity" },
    { userId: reliefUsers[4]._id, message: "Cold-chain meds courier checked in.", type: "info", read: false, relatedTo: "inventory" }
  ]);

  await AuditLog.insertMany([
    { action: "CREATE_DISASTER", performedBy: admin._id, targetEntity: "Disaster", targetId: disasters[0]._id, details: "Initial incident record" },
    { action: "UPDATE_STATUS", performedBy: admin._id, targetEntity: "Disaster", targetId: disasters[1]._id, details: "Escalated to assessed" },
    { action: "ALLOCATE_CENTER", performedBy: admin._id, targetEntity: "ReliefCenter", targetId: centers[0]._id, details: "Linked to corridor response" },
    { action: "DEPLOY_VOLUNTEER", performedBy: admin._id, targetEntity: "Volunteer", targetId: volunteerDocs[0]._id, details: "Deployment wave A" },
    {
      action: "RESOURCE_DISPATCH",
      performedBy: admin._id,
      targetEntity: "Resource",
      targetId: resourcesInserted[4]._id,
      details: "Food kits released"
    },
    { action: "NOTIFY_WATCH", performedBy: admin._id, targetEntity: "Disaster", targetId: disasters[2]._id, details: "Cyclone pre-alert" }
  ]);

  console.log("\nSeed complete.");
  console.log("Collections: users=", await User.countDocuments(), "| disasters=", await Disaster.countDocuments(), "| centers=", await ReliefCenter.countDocuments(), "| resources=", await Resource.countDocuments(), "| volunteers=", await Volunteer.countDocuments(), "| notifications=", await Notification.countDocuments(), "| auditlogs=", await AuditLog.countDocuments());
  console.log("\nAdmin login: admin@rescuenet.dev / " + demoPassword);
  console.log("Relief demo: center1@rescuenet.dev … center6 — password same.");
  console.log("Volunteer demo: volunteer1@rescuenet.dev … volunteer6 — password same.");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  mongoose.disconnect().catch(() => {});
  process.exit(1);
});
