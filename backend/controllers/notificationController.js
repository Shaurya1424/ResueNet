const Notification = require("../models/Notification");

const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id, read: false })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json(notification);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update notification", error: error.message });
  }
};

module.exports = { getUnreadNotifications, markNotificationAsRead };
