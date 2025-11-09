import { Response } from "express";
import { AuthenticatedRequest } from "../types/requests/auth.type";
import { uploadToCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/ApiResponse";

// GET PROFILE
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json(ApiResponse(401, null, "User not found"));
  }
  res
    .status(200)
    .json(ApiResponse(200, { user: req.user }, "Profile fetched Successfully"));
};

// UPDATE PROFILE
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const file = req.file;

  try {
    const { name } = req.body;
    const profileUrl = file?.path
      ? await uploadToCloudinary(file.path, "profiles")
      : null;
    const user = req.user;
    if (user) {
      user.name = name ?? user.name;
      user.profile = profileUrl ?? user.profile;
      const updatedProfile = await user?.save();

      res
        .status(200)
        .json(
          ApiResponse(
            200,
            { user: updateProfile },
            "Profile updated sucessfully"
          )
        );
    }
  } catch (error) {
    res.status(500).json(ApiResponse(500, null, "Failed to updated profile"));
  }
};

// CHANGE PASSWORD
export const updatePassword = () => {};
