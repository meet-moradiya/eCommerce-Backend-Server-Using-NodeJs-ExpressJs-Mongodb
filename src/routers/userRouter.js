const express = require("express");
const userController = require("../controllers/userController");
const adminOnly = require("../middlewares/userAuth");

const router = express.Router();

// Create new user
router.post("/new", userController.createUser);

// Make new Admin
router.put("/make-admin", adminOnly, userController.makeAdmin);

// Login user
router.post("/login", userController.loginUser);

// Get all users (accessible only to admins)
router.get("/all", adminOnly, userController.getAllUsers);

// Get one user by ID
router.get("/:id", userController.getUserById);

// Update user details (accessible only to admins or the user itself)
router.put("/:id", userController.updateUser);

// Delete user (accessible only to admins or the user itself)
router.delete("/:id", userController.deleteUser);

module.exports = router;
