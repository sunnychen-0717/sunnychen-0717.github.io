// models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Display username (as the user typed it)
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    // Normalized username for uniqueness (lowercased)
    usernameLower: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

// Ensure usernameLower is always set and normalized
userSchema.pre("validate", function (next) {
  if (this.username && typeof this.username === "string") {
    this.username = this.username.trim();
    this.usernameLower = this.username.toLowerCase();
  }
  next();
});

// Optional: static helper to check availability
userSchema.statics.isUsernameAvailable = async function (name) {
  const u = (name || "").trim().toLowerCase();
  if (!u || u.length < 2) return false;
  const exists = await this.exists({ usernameLower: u });
  return !exists;
};

module.exports = mongoose.model("User", userSchema);
