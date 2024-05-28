const User = require("../models/user");

// Create new user
exports.createUser = async (req, res, next) => {
  try {
    // Destructure required fields from the request body
    const { _id, name, email, avatar } = req.body;

    // Check if the user already exists
    const checkUser = await User.findOne({ _id });

    if (checkUser) {
      return res.status(200).json({
        success: true,
        user: checkUser,
        message: `Welcome Back, ${checkUser.name}`,
      });
    }

    // Check for all required fields
    if (!_id || !name || !email || !avatar) {
      return res.status(400).json({
        success: false,
        error: "Please add all fields",
      });
    }

    // If user does not exist, create a new user
    const user = await User.create({ _id, name, email, avatar });

    return res.status(201).send({ user, message: `Welcome ${user.name}` });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Some error occurred",
      error,
    });
  }
};

// Make Admin
exports.makeAdmin = async (req, res) => {
  try {
    // Find the user by email
    const user = await User.findOne({ email: req.body.email });

    // Check if the user exists
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    // Update the user role to admin
    user.role = "admin";

    // Save the updated user
    await user.save();

    res.status(200).send({ message: "User role updated to admin", user });
  } catch (error) {
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

// login
exports.loginUser = async (req, res) => {
  try {
    // Check if user already exists by email
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.send({ user, message: `Welcome back ${user.name}` });
    } else {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Some Internal Error Occurs",
      error,
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Get one user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Update user details
exports.updateUser = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "avatar", "email", "phone", "gender", "dob"];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Check if the user making the request is the owner of the account or an admin
    if (user.role !== "admin" && user._id.toString() !== user._id.toString()) {
      return res.status(403).send({ error: "You are not authorized to update this user's details" });
    }

    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

    if (updates.length === 0) {
      return res.status(200).json({ success: true, message: "No details updated." });
    }

    console.log("User Updated.");
    res.status(200).json({
      success: true,
      message: "User details updated.",
      user,
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Check if the user making the request is the owner or an admin
    if (user.role !== "admin" && user._id !== user._id.toString()) {
      return res.status(403).send({ error: "Access forbidden. User does not have permission." });
    }

    await User.findByIdAndDelete(user.id);

    res.status(200).json({
      success: true,
      message: "User deleted.",
      user,
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
