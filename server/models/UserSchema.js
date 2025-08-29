import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true,},
    password: { type: String, required: true, minlength: 6 },
    verifyOTP: { type: String, default: null },
    verifyOtpExpiredAt: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    resetOTP: { type: String, default: null },
    resetOtpExpireAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
