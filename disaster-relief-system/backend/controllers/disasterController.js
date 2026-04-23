const Disaster = require("../models/Disaster");
const User = require("../models/User");
const Notification = require("../models/Notification");
const auditLogger = require("../middleware/auditLogger");

const STATUS_TRANSITIONS = {
  reported: "assessed",
  assessed: "active",
  active: "contained",
  contained: "closed",
  closed: null
};

const createDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.create(req.body);

    const volunteers = await User.find({ role: "volunteer" }).select("_id");
    if (volunteers.length > 0) {
      await Notification.insertMany(
        volunteers.map((volunteer) => ({
          userId: volunteer._id,
          message: `New disaster reported: ${disaster.title} (${disaster.severity})`,
          type: disaster.severity === "critical" ? "critical" : "warning",
          relatedTo: "Disaster"
        }))
      );
    }

    await auditLogger({
      action: "DISASTER_CREATED",
      performedBy: req.user.id,
      targetEntity: "Disaster",
      targetId: disaster._id,
      details: `Disaster ${disaster.title} created`
    });

    res.status(201).json(disaster);
  } catch (error) {
    res.status(500).json({ message: "Failed to create disaster", error: error.message });
  }
};

const getDisasters = async (_req, res) => {
  try {
    const disasters = await Disaster.find().sort({ createdAt: -1 });
    res.json(disasters);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch disasters", error: error.message });
  }
};

const updateDisasterStatus = async (req, res) => {
  try {
    const disaster = await Disaster.findById(req.params.id);
    if (!disaster) {
      return res.status(404).json({ message: "Disaster not found" });
    }

    const { status } = req.body;
    const nextValidStatus = STATUS_TRANSITIONS[disaster.status];

    if (status !== nextValidStatus) {
      return res.status(400).json({
        message: `Invalid status transition. Allowed next status from '${disaster.status}' is '${nextValidStatus}'`
      });
    }

    disaster.status = status;
    await disaster.save();

    await auditLogger({
      action: "DISASTER_STATUS_UPDATED",
      performedBy: req.user.id,
      targetEntity: "Disaster",
      targetId: disaster._id,
      details: `Status changed to ${status}`
    });

    return res.json(disaster);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update disaster status", error: error.message });
  }
};

const getDisasterStats = async (_req, res) => {
  try {
    const [total, byStatusAgg, bySeverityAgg, activeCount] = await Promise.all([
      Disaster.countDocuments(),
      Disaster.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Disaster.aggregate([{ $group: { _id: "$severity", count: { $sum: 1 } } }]),
      Disaster.countDocuments({ status: "active" })
    ]);

    const byStatus = byStatusAgg.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const bySeverity = bySeverityAgg.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({ total, byStatus, bySeverity, activeCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch disaster stats", error: error.message });
  }
};

module.exports = { createDisaster, getDisasters, updateDisasterStatus, getDisasterStats };
