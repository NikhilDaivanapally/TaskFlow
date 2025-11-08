import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import { loginUser, registerUser } from "../controllers/auth.controller";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { validateRequest } from "../middlewares/validateRequest";

const router = Router();

router.route("/signin").post(validateRequest(loginSchema), loginUser);
router
  .route("/signup")
  .post(
    upload.single("profile"),
    validateRequest(registerSchema),
    registerUser
  );


export default router;
