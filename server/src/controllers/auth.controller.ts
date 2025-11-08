import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { generateAccessAndRefreshToken } from "../utils/tokens";
import { RegisterInput, LoginInput } from "../schemas/auth.schema";
import { uploadToCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/ApiResponse";

// COMMON SECURE COOKIE OPTIONS
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

// REGISTER USER
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as RegisterInput;

    // Check duplicate user
    const existingUser = await User.findOne({ $or: [{ name }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with email or username already exists",
      });
    }

    // Handle optional profile upload
    let profileUrl: string | null = null;
    if (req.file?.path) {
      profileUrl = await uploadToCloudinary(req.file.path, "profiles");
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      profile: profileUrl,
    });

    // Generate new tokens and store refresh token in DB
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user
    );

    // Sanitize user
    const sanitizedUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return res
      .status(201)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(ApiResponse(201, sanitizedUser, "User registered successfully"));
  } catch (error: any) {
    return res
      .status(500)
      .json(
        ApiResponse(
          500,
          null,
          error.message || "Something went wrong during signup"
        )
      );
  }
};

// LOGIN USER
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginInput;
    console.log(email, password);

    // Check user with provided email
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(404).json(ApiResponse(404, null, "User not found"));
    }

    // Validate password
    const isValid = await user.isValidPassword(password);
    console.log(isValid);
    if (!isValid)
      return res
        .status(401)
        .json(ApiResponse(401, null, "Invalid credentials"));

    // Generate new tokens and store refresh token in DB
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user
    );

    // Sanitize user
    const sanitizedUser = await User.findById(user._id).select("-password");

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(ApiResponse(200, sanitizedUser, "Login successful"));
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json(
        ApiResponse(
          500,
          null,
          error.message || "Something went wrong during signin"
        )
      );
  }
};

// REFRESH TOKEN
export const refreshAccessToken = async (req: Request, res: Response) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken)
    return res
      .status(401)
      .json(ApiResponse(401, null, "Unauthorized: No token provided"));

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { _id: string };

    const user = await User.findById(decoded._id).select("-password");
    if (!user)
      return res.status(401).json(ApiResponse(401, null, "Invalid token user"));

    // Compare DB refresh token with cookie one
    if (user.refreshToken !== incomingRefreshToken) {
      return res
        .status(403)
        .json(ApiResponse(403, null, "Token mismatch or expired"));
    }

    // Generate new tokens and store refresh token in DB
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(ApiResponse(200, null, "Access token refreshed successfully"));
  } catch (error: any) {
    return res
      .status(401)
      .json(ApiResponse(401, null, "Invalid or expired refresh token"));
  }
};

// LOGOUT USER
export const logoutUser = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const decoded = jwt.decode(refreshToken) as { _id: string };
      if (decoded?._id) {
        await User.findByIdAndUpdate(decoded._id, {
          $unset: { refreshToken: null },
        });
      }
    }
    return res
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .status(200)
      .json(ApiResponse(200, null, "Logged out successfully"));
  } catch (error: any) {
    return res.status(500).json(ApiResponse(500, null, "failed to logout"));
  }
};
