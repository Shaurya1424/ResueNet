const Resource = require("../models/Resource");
const auditLogger = require("../middleware/auditLogger");

const createResource = async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: "Failed to create resource", error: error.message });
  }
};

const getResources = async (_req, res) => {
  try {
    const resources = await Resource.find().populate("disasterId", "title type location").sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resources", error: error.message });
  }
};

const dispatchResource = async (req, res) => {
  try {
    const { reliefCenterId } = req.body;
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    resource.status = "dispatched";
    resource.assignedTo = reliefCenterId;
    resource.lastUpdated = new Date();
    await resource.save();

    await auditLogger({
      action: "RESOURCE_DISPATCHED",
      performedBy: req.user.id,
      targetEntity: "Resource",
      targetId: resource._id,
      details: `Resource dispatched to center ${reliefCenterId}`
    });

    return res.json(resource);
  } catch (error) {
    return res.status(500).json({ message: "Failed to dispatch resource", error: error.message });
  }
};

const getResourceSummary = async (_req, res) => {
  try {
    const [totalItems, byTypeAgg, lowStock] = await Promise.all([
      Resource.countDocuments(),
      Resource.aggregate([
        {
          $group: {
            _id: "$type",
            totalQuantity: { $sum: "$quantity" }
          }
        }
      ]),
      Resource.find({ quantity: { $lt: 10 } }).sort({ quantity: 1 })
    ]);

    const byType = byTypeAgg.reduce((acc, item) => {
      acc[item._id] = item.totalQuantity;
      return acc;
    }, {});

    return res.json({ totalItems, byType, lowStock });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch resource summary", error: error.message });
  }
};

module.exports = { createResource, getResources, dispatchResource, getResourceSummary };
