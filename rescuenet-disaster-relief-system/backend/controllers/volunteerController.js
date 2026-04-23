const Volunteer = require("../models/Volunteer");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const auditLogger = require("../middleware/auditLogger");

const registerVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.create(req.body);
    await auditLogger({
      action: "VOLUNTEER_REGISTERED",
      performedBy: req.user.id,
      targetEntity: "Volunteer",
      targetId: volunteer._id,
      details: "Volunteer profile created"
    });
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
    await auditLogger({
      action: "VOLUNTEER_UPDATED",
      performedBy: req.user.id,
      targetEntity: "Volunteer",
      targetId: volunteer._id,
      details: "Volunteer assignment/status updated"
    });
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

const getAvailableVolunteers = async (_req, res) => {
  try {
    const volunteers = await Volunteer.find({ status: "available" })
      .populate("userId", "name email role")
      .populate("disasterId", "title type location")
      .sort({ createdAt: -1 });
    return res.json(volunteers);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch available volunteers", error: error.message });
  }
};

const getMyVolunteerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const volunteer = await Volunteer.findOne({ userId: req.user.id }).populate(
      "disasterId",
      "title type location severity status"
    );

    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer profile not found" });
    }

    return res.json({ user, volunteer });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

const updateMyVolunteerProfile = async (req, res) => {
  try {
    const { name, password, skills, status } = req.body;
    const user = await User.findById(req.user.id);
    const volunteer = await Volunteer.findOne({ userId: req.user.id });

    if (!user || !volunteer) {
      return res.status(404).json({ message: "Volunteer profile not found" });
    }

    if (name) user.name = name;
    if (password) user.password = await bcrypt.hash(password, 10);
    await user.save();

    if (Array.isArray(skills)) volunteer.skills = skills;
    if (status) volunteer.status = status;
    await volunteer.save();

    await auditLogger({
      action: "VOLUNTEER_PROFILE_UPDATED",
      performedBy: req.user.id,
      targetEntity: "Volunteer",
      targetId: volunteer._id,
      details: "Volunteer updated profile information"
    });

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      volunteer
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

const matchVolunteers = async (req, res) => {
  try {
    const { disasterId, requiredSkills } = req.body;
    const requiredSet = new Set((requiredSkills || []).map((skill) => skill.toLowerCase()));

    const volunteers = await Volunteer.find({ status: "available" }).populate("userId", "name email");

    const scoredVolunteers = volunteers
      .map((volunteer) => {
        const volunteerSkills = (volunteer.skills || []).map((skill) => skill.toLowerCase());
        const overlap = volunteerSkills.filter((skill) => requiredSet.has(skill)).length;
        const score = requiredSet.size === 0 ? 0 : overlap / requiredSet.size;

        return {
          volunteer,
          overlap,
          score
        };
      })
      .sort((a, b) => b.score - a.score || b.overlap - a.overlap);

    return res.json({
      disasterId,
      requiredSkills,
      matches: scoredVolunteers
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to match volunteers", error: error.message });
  }
};

module.exports = {
  registerVolunteer,
  assignVolunteerTask,
  getVolunteers,
  getAvailableVolunteers,
  matchVolunteers,
  getMyVolunteerProfile,
  updateMyVolunteerProfile
};
