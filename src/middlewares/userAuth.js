const User = require("../models/user");

const adminOnly = async (req, res, next) => {
  try {
    const { id } = req.query;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.role !== "admin") {
      return res.status(403).send("Access forbidden. Admin rights required.");
    }

    next();
  } catch (error) {
    console.error("Error in adminOnly middleware:", error);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = adminOnly;
