import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { authControllers } from "./auth.controller";
import { authValidation } from "./auth.validation";
import auth from "../../middlewares/auth";

const router = Router();

router.post(
  "/register",
  validateRequest(authValidation.registerTenantValidationSchema),
  authControllers.loginUser,
);

router.post(
  "/login",
  validateRequest(authValidation.LoginBodyValidationSchema),
  authControllers.loginUser,
);

// router.post(
//   "/change-password",
//   auth(USER_ROLE.admin, USER_ROLE.faculty, USER_ROLE.student),
//   validateRequest(authValidation.changePasswordValidationSchema),
//   authControllers.changePassword,
// );

// router.post(
//   "/refresh-token",
//   validateRequest(authValidation.refreshTokenValidationSchema),
//   authControllers.refreshToken,
// );

export const authRouter = router;
