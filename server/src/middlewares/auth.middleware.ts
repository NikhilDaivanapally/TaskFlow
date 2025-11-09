import { Request, Response, NextFunction } from "express";
import { refreshAccessToken } from "../controllers/auth.controller";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { AuthenticatedRequest } from "../types/requests/auth.type";

const verifyJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    if (req.cookies.refreshToken) {
      refreshAccessToken(req, res);
    } else {
      throw new Error("Unauthorized request");
    }
  } else {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new Error("Invalide Access Token");
    }
    req.user = user;
    next();
  }
};

export { verifyJWT };
