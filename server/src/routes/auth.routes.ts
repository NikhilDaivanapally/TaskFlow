import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import {
  loginUser,
  registerUser,
  signoutUser,
} from "../controllers/auth.controller";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { validateRequest } from "../middlewares/validateRequest";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/signin").post(validateRequest(loginSchema), loginUser);
router
  .route("/signup")
  .post(
    upload.single("profile"),
    validateRequest(registerSchema),
    registerUser
  );

router.route("/signout").post(verifyJWT, signoutUser);

export default router;
