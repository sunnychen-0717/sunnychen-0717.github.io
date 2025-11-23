// models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Display name as typed by the user (not unique, not case-insensitive)
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    // Normalized username for uniqueness (lowercased, unique)
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
    // Normalize and trim the display username; store a lowercased copy
    this.username = this.username.trim().normalize("NFKC");
    this.usernameLower = this.username.toLowerCase();
  }
  next();
});

// Optional: static helper to check availability (case-insensitive)
userSchema.statics.isUsernameAvailable = async function (name) {
  const u = (name || "").trim().normalize("NFKC").toLowerCase();
  if (!u || u.length < 2) return false;
  const exists = await this.exists({ usernameLower: u });
  return !exists;
};

module.exports = mongoose.model("User", userSchema);
