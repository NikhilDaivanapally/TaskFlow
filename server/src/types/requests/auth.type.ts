import { Request } from "express";
import { IUserDocument } from "../models/user.type";

// Request with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
}
