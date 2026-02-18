const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    resetToken: { type: String, default: null },
    resetExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

// ✅ pre-save normalization (promise style, no next)
userSchema.pre("save", function () {
  if (this.email) this.email = this.email.toLowerCase().trim();
});

module.exports = mongoose.model("User", userSchema);
