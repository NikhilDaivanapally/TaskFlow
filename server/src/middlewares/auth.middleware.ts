import { Response, NextFunction } from "express";
import { refreshAccessToken } from "../controllers/auth.controller";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model";
import { AuthenticatedRequest } from "../types/requests/auth.type";

const verifyJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      if (req.cookies?.refreshToken) {
        return refreshAccessToken(req, res);
      } else {
        return res.status(401).json({ message: "Unauthorized request" });
      }
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new Error("ACCESS_TOKEN_SECRET is not defined in environment");
    }

    const decodedToken = jwt.verify(token, secret) as JwtPayload & { _id: string };

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid Access Token" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export { verifyJWT };
