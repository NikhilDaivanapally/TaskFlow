import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";
import { FileUploadRequest } from "../types/requests/file.type";

export const validateRequest =
  (schema: ZodObject) =>
  (
    req: Request | FileUploadRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      schema.parse({
        body: req.body,
        file: (req as FileUploadRequest).file, // safely cast only if it exists
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error: any) {
      console.error(error);

      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors ?? error,
      });
    }
  };
