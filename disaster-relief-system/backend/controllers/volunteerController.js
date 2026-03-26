const Volunteer = require("../models/Volunteer");
const User = require("../models/User");

const registerVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.create(req.body);
    res.status(201).json(volunteer);
  } catch (error) {
    res.status(500).json({ message: "Failed to register volunteer", error: error.message });
  }
};

const assignVolunteerTask = async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }
    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: "Failed to assign volunteer task", error: error.message });
  }
};

const getVolunteers = async (_req, res) => {
  try {
    const volunteerUsers = await User.find({ role: "volunteer" }).select("_id");
    await Promise.all(
      volunteerUsers.map((user) =>
        Volunteer.findOneAndUpdate(
          { userId: user._id },
          { $setOnInsert: { userId: user._id, assignedTask: "", status: "available" } },
          { upsert: true, new: false }
        )
      )
    );

    const volunteers = await Volunteer.find()
      .populate("userId", "name email role")
      .populate("disasterId", "title type location")
      .sort({ createdAt: -1 });
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch volunteers", error: error.message });
  }
};

module.exports = { registerVolunteer, assignVolunteerTask, getVolunteers };
