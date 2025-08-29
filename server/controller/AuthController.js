import bcrypt from "bcryptjs"; //for encrypting the password
import jwt from "jsonwebtoken";
import userModel from "../models/UserSchema.js";
import transporter from "../config/nodemailer.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/EmailTemplates.js";

export const register = async (req, res) => {
  //function for registeration of the user.
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" }); //return if details are missing
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" }); //return if existing user is trying to register.
    }
    const hashedPassword = await bcrypt.hash(password, 10); //used 10 for secure encrypt password, higher value will be slower.
    const user = new userModel({ name, email, password: hashedPassword }); //new user's info is stores in the database.
    await user.save(); //save the info in the database.

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    }); //creating jsonwebtoken

    res.cookie("token", token, {
      //creating a cookie to store jwt token on the client-side
      httpOnly: true, //	Prevents JavaScript access → XSS protection
      secure: process.env.NODE_ENV === "production", //Only sends over HTTPS → man-in-the-middle protection
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", //for cross-site requests
      maxAge: 7 * 24 * 60 * 60 * 1000, //expiration time
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Authentication System",
      text: `Welcome to Authentication sytem. Your account has been created with email id: ${email}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  //function for login
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password are required",
    }); //return if details are missing
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    }); //creating jsonwebtoken

    res.cookie("token", token, {
      //creating a cookie to store jwt token on the client-side
      httpOnly: true, //	Prevents JavaScript access → XSS protection
      secure: process.env.NODE_ENV === "production", //Only sends over HTTPS → man-in-the-middle protection
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", //for cross-site requests
      maxAge: 7 * 24 * 60 * 60 * 1000, //expiration time
    });

    return res.json({ success: true });
  } catch (error) {
    res.json({ sucess: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  //function for logging out
  try {
    //for clearing the cookie from the browser
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "Logged Out" }); //message for successfully logging out
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.json({ success: false, message: "userId not found" });
    }
    const user = await userModel.findById(userId);
    if (user.isVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(Math.random() * 900000) + 100000);
    user.verifyOTP = otp;
    user.verifyOtpExpiredAt = Date.now() + 5 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      // text: `Your otp is ${otp}. Verify your account using this OTP`,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Verification OTP Sent on Email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!user.verifyOTP || user.verifyOTP !== otp) {
      return res.json({ success: false, message: "Invalid Otp" });
    }

    if (!user.verifyOtpExpiredAt || user.verifyOtpExpiredAt < Date.now()) {
      return res.json({ success: false, message: "Otp Expired" });
    }

    user.isVerified = true;

    user.verifyOTP = null;
    user.verifyOtpExpiredAt = null;

    await user.save();
    return res.json({
      success: true,
      message: "Account Verification Successfull",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const setResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(Math.random() * 900000) + 100000);

    user.resetOTP = otp;
    user.resetOtpExpireAt = Date.now() + 5 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset Password OTP",
      // text: `Your OTP is ${otp}. Use this to reset your password. It will expire in 5 minutes.`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const passwordReset = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email, otp and new Password are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!user.resetOTP || user.resetOTP !== otp) {
      return res.json({ success: false, message: "Invalid otp" });
    }

    if (!user.resetOtpExpireAt || Date.now() > user.resetOtpExpireAt) {
      return res.json({ success: false, message: "Otp expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOTP = null;
    user.resetOtpExpireAt = null;
    await user.save();

    res.json({
      success: true,
      message: "New Password has been set successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
