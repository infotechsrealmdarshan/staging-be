import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  fullName: { type: String },
  mobile: { type: String },
  profileImg: { type: String },
  firebaseUid: { type: String, unique: true, sparse: true },
  authProvider: { type: String, enum: ['email', 'google'], default: 'email' },
  isEmailVerified: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
