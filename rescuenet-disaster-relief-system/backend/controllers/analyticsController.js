const Disaster = require("../models/Disaster");
const Volunteer = require("../models/Volunteer");
const Resource = require("../models/Resource");
const ReliefCenter = require("../models/ReliefCenter");
const AuditLog = require("../models/AuditLog");
const mongoose = require("mongoose");

const getOverview = async (_req, res) => {
  try {
    const [activeDisasters, deployedVolunteers, resourcesFulfilled, openRequests, recentActivity] = await Promise.all([
      Disaster.countDocuments({ status: "active" }),
      Volunteer.countDocuments({ status: "deployed" }),
      Resource.countDocuments({ status: "dispatched" }),
      ReliefCenter.aggregate([
        { $unwind: { path: "$resourcesNeeded", preserveNullAndEmptyArrays: false } },
        { $match: { "resourcesNeeded.quantity": { $gt: 0 } } },
        { $count: "count" }
      ]),
      AuditLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate("performedBy", "name email role")
    ]);

    res.json({
      activeDisasters,
      deployedVolunteers,
      resourcesFulfilled,
      openRequests: openRequests[0]?.count || 0,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics overview", error: error.message });
  }
};

const getDisasterAnalytics = async (req, res) => {
  try {
    const disasterId = req.params.id;
    const disasterObjectId = new mongoose.Types.ObjectId(disasterId);
    const [volunteersDeployed, resourcesAllocated, centerRequests] = await Promise.all([
      Volunteer.countDocuments({ disasterId, status: "deployed" }),
      Resource.aggregate([
        { $match: { disasterId: disasterObjectId } },
        {
          $group: {
            _id: "$type",
            totalQuantity: { $sum: "$quantity" }
          }
        }
      ]),
      ReliefCenter.aggregate([
        { $unwind: { path: "$resourcesNeeded", preserveNullAndEmptyArrays: false } },
        { $match: { "resourcesNeeded.quantity": { $gt: 0 } } },
        {
          $project: {
            centerName: "$name",
            request: "$resourcesNeeded"
          }
        }
      ])
    ]);

    res.json({
      disasterId,
      volunteersDeployed,
      resourcesAllocated,
      centerRequests
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch disaster analytics", error: error.message });
  }
};

module.exports = { getOverview, getDisasterAnalytics };
