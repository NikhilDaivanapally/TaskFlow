import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { getProfile, updateProfile } from "../controllers/user.controller";
const router = Router();

router
  .route("/profile")
  .get(verifyJWT, getProfile)
  .patch(verifyJWT, upload.single("profile"), updateProfile);

// tasks

export default router;
