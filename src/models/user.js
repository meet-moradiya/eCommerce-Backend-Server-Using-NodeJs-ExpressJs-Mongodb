const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: String,
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phone: Number,
    gender: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    dob: Date,
  },
  { timestamps: true }
);

// Virtual property to calculate age
userSchema.virtual("age").get(function () {
  if (!this.dob) return undefined;
  const diffMs = Date.now() - this.dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
