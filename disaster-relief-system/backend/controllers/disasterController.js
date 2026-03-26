const Disaster = require("../models/Disaster");

const createDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.create(req.body);
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

module.exports = { createDisaster, getDisasters };
