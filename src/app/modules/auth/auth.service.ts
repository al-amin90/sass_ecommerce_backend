import status from "http-status";
import AppError from "../../errors/AppError";
import { LoginBody, TChangePassword, TRegisterTenant } from "./auth.interface";

import config from "../../config";
import bcrypt from "bcrypt";
import { createToken } from "./auth.utils";
import { dbManager } from "../../config/db";
import ModelFactory from "../../utils/modelFactory";
import catchAsync from "../../utils/catchAsync";

const registerTenantRequest = async (payload: TRegisterTenant) => {
  const { subdomain } = payload;

  console.log("it is hit now");

  const centralConn = dbManager.getCentralConnection();

  if (!centralConn)
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Central DB not available",
    );

  const TenantRequest = ModelFactory.getModel(centralConn, "TenantRequest");

  const existing = await TenantRequest.findOne({
    subdomain: subdomain,
  });
  console.log("existing", existing);

  if (existing) {
    throw new AppError(status.CONFLICT, `This subdomain is already registered`);
  }

  const request = await TenantRequest.create(payload);

  return request;
};

const approveTenant = catchAsync(async (tenantId, payload) => {
  let tenantDbCreated = false;

  const centralConn = dbManager.getCentralConnection();
  if (!centralConn)
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Central DB not available",
    );

  const TenantRequest = ModelFactory.getModel(centralConn, "TenantRequest");

  const tenantRequest = await TenantRequest.findById(tenantId);

  if (!tenantRequest)
    throw new AppError(status.NOT_FOUND, "Tenant request not found");

  if (tenantRequest.status === "approved")
    throw new AppError(status.NOT_FOUND, "Already approved");

  const tenantConn = await dbManager.getConnection(tenantRequest.subdomain);
  tenantDbCreated = true;

  const User = ModelFactory.getModel(tenantConn, "User");

  const alreadyExists = await User.findOne({ email: tenantRequest.adminEmail });

  if (!alreadyExists) {
    await User.create({
      email: tenantRequest.adminEmail,
      password: tenantRequest.adminPassword,
      role: "super_admin",
    });
  }

  const result = await TenantRequest.findByIdAndUpdate(tenantId, {
    status: "approved",
    approvedAt: new Date(),
  });

  return result;
});

const loginUser = async (payload: LoginBody) => {
  const { email, password } = payload;
  const envEmail = config.single_admin_email;
  const envPassword = config.single_admin_password;
  let role: string;

  console.log("it is hit now");

  if (!envEmail || !envPassword)
    throw new AppError(status.UNAUTHORIZED, "Admin credentials not configured");

  if (email !== envEmail || password !== envPassword)
    throw new AppError(status.UNAUTHORIZED, "Invalid credentials");

  // const user = await UserModel.isUserExistByCustomId(payload.id)

  // if (!user) {
  //   throw new AppError(status.NOT_FOUND, "The User Does't exists")
  // }

  // const isDeleted = user.isDeleted
  // if (isDeleted) {
  //   throw new AppError(status.FORBIDDEN, 'The User is Deleted')
  // }

  // if (user.status === 'blocked') {
  //   throw new AppError(status.FORBIDDEN, 'The User is Blocked')
  // }

  // if (!(await UserModel.isPasswordMatch(payload.password, user.password))) {
  //   throw new AppError(status.FORBIDDEN, 'Password do not match')
  // }

  const jwtPayload = {
    id: "",
    role: "super_admin",
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.access_token as string,
    config.jwt.access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt.refresh_token as string,
    config.jwt.refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
    // needsPasswordChange: user.needsPasswordChange,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: TChangePassword,
) => {
  const user = await UserModel.isUserExistByCustomId(userData.id);

  if (!user) {
    throw new AppError(status.NOT_FOUND, "The User Does't exists");
  }

  const isDeleted = user.isDeleted;
  if (isDeleted) {
    throw new AppError(status.FORBIDDEN, "The User is Deleted");
  }

  if (user.status === "blocked") {
    throw new AppError(status.FORBIDDEN, "The User is Blocked");
  }

  if (!(await UserModel.isPasswordMatch(payload.oldPassword, user.password))) {
    throw new AppError(status.FORBIDDEN, "Password do not match");
  }

  const newPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await UserModel.findOneAndUpdate(
    {
      id: user.id,
      role: user.role,
    },
    {
      password: newPassword,
      needsPasswordChange: false,
      passwordChangeAt: new Date(),
    },
  );

  return result;
};

const refreshToken = async (token: string) => {
  const decoded = jwt.verify(token, config.jwt_refresh_token as string);
  const { id, iat } = decoded as JwtPayload;

  const user = await UserModel.isUserExistByCustomId(id);

  if (!user) {
    throw new AppError(status.NOT_FOUND, "The User Does't exists");
  }

  const isDeleted = user.isDeleted;
  if (isDeleted) {
    throw new AppError(status.FORBIDDEN, "The User is Deleted");
  }

  if (user.status === "blocked") {
    throw new AppError(status.FORBIDDEN, "The User is Blocked");
  }

  if (
    user.passwordChangeAt &&
    (await UserModel.isJWTIssuedBeforePassword(
      user.passwordChangeAt,
      iat as number,
    ))
  ) {
    throw new AppError(status.UNAUTHORIZED, "You are not authorized. by!");
  }

  const jwtPayload = {
    id: user.id,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_token as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

export const authServices = {
  registerTenantRequest,
  loginUser,
  changePassword,
  refreshToken,
  approveTenant,
};
