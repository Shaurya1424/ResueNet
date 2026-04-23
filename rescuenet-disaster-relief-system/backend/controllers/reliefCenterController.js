const ReliefCenter = require("../models/ReliefCenter");
const Resource = require("../models/Resource");
const auditLogger = require("../middleware/auditLogger");

const getCenters = async (_req, res) => {
  try {
    const centers = await ReliefCenter.find().sort({ createdAt: -1 });
    return res.json(centers);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch relief centers", error: error.message });
  }
};

const getMyCenter = async (req, res) => {
  try {
    const center = await ReliefCenter.findOne({ userId: req.user.id });
    if (!center) {
      return res.json({ center: null });
    }
    const resources = await Resource.find({ assignedTo: center._id }).populate("disasterId", "title severity status");
    return res.json({ center, receivedResources: resources });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load relief center", error: error.message });
  }
};

const registerCenter = async (req, res) => {
  try {
    const payload = { ...req.body, userId: req.user.id };
    const center = await ReliefCenter.create(payload);
    await auditLogger({
      action: "RELIEF_CENTER_REGISTERED",
      performedBy: req.user.id,
      targetEntity: "ReliefCenter",
      targetId: center._id,
      details: `Relief center ${center.name} registered`
    });
    res.status(201).json(center);
  } catch (error) {
    res.status(500).json({ message: "Failed to register relief center", error: error.message });
  }
};

const updateMyCenter = async (req, res) => {
  try {
    const center = await ReliefCenter.findOne({ userId: req.user.id });
    if (!center) {
      return res.status(404).json({ message: "Relief center not found for this user" });
    }

    const allowedFields = ["name", "location", "capacity", "currentOccupancy", "status"];
    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        center[field] = req.body[field];
      }
    });

    await center.save();
    await auditLogger({
      action: "RELIEF_CENTER_UPDATED",
      performedBy: req.user.id,
      targetEntity: "ReliefCenter",
      targetId: center._id,
      details: `Relief center ${center.name} updated`
    });
    res.json(center);
  } catch (error) {
    res.status(500).json({ message: "Failed to update relief center", error: error.message });
  }
};

const requestResources = async (req, res) => {
  try {
    const { centerId, resourcesNeeded } = req.body;
    const center = await ReliefCenter.findById(centerId);
    if (!center) {
      return res.status(404).json({ message: "Relief center not found" });
    }

    center.resourcesNeeded = resourcesNeeded || [];
    await center.save();
    await auditLogger({
      action: "RESOURCE_REQUEST_SUBMITTED",
      performedBy: req.user.id,
      targetEntity: "ReliefCenter",
      targetId: center._id,
      details: "Relief center submitted resource request"
    });
    res.json({ message: "Resource request submitted", center });
  } catch (error) {
    res.status(500).json({ message: "Failed to request resources", error: error.message });
  }
};

module.exports = {
  registerCenter,
  requestResources,
  getCenters,
  getMyCenter,
  updateMyCenter
};
