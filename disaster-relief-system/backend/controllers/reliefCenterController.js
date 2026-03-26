const ReliefCenter = require("../models/ReliefCenter");

const registerCenter = async (req, res) => {
  try {
    const center = await ReliefCenter.create(req.body);
    res.status(201).json(center);
  } catch (error) {
    res.status(500).json({ message: "Failed to register relief center", error: error.message });
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
    res.json({ message: "Resource request submitted", center });
  } catch (error) {
    res.status(500).json({ message: "Failed to request resources", error: error.message });
  }
};

module.exports = { registerCenter, requestResources };
