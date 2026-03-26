const Resource = require("../models/Resource");

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

module.exports = { createResource, getResources };
