import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { IUserDocument } from "../types/models/user.type";

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email: string): boolean =>
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            email
          ),
        message: (props: any) => `Invalid email format: ${props.value}`,
      },
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },

    profile: {
      type: String,
      default: null,
    },

    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre<IUserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

//  Generate Access Token
userSchema.methods.generateAccessToken = function (): string {
  const secret = process.env.ACCESS_TOKEN_SECRET as Secret;
  const expiresIn = (process.env.ACCESS_TOKEN_EXPIRY ||
    "15m") as SignOptions["expiresIn"];

  if (!secret) throw new Error("ACCESS_TOKEN_SECRET not defined");

  return jwt.sign({ _id: this._id }, secret, { expiresIn });
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function (): string {
  const secret = process.env.REFRESH_TOKEN_SECRET as Secret;
  const expiresIn = (process.env.REFRESH_TOKEN_EXPIRY ||
    "7d") as SignOptions["expiresIn"];

  if (!secret) throw new Error("REFRESH_TOKEN_SECRET not defined");

  return jwt.sign({ _id: this._id }, secret, { expiresIn });
};

//  Validate Password
userSchema.methods.isValidPassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>(
  "User",
  userSchema
);
