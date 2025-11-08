import { IUserDocument } from "../types/models/user.type";

export const generateAccessAndRefreshToken = async (user: IUserDocument) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};
