import { Document } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  profile: string | null;
  refreshToken: string | null;
}

export interface IUserDocument extends IUser, Document {
  generateAccessToken(): string;
  generateRefreshToken(): string;
  isValidPassword(password: string): Promise<boolean>;
}
