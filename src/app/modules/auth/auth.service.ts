import status from "http-status";
import AppError from "../../errors/AppError";
import {
  ITenantRequest,
  LoginBody,
  TChangePassword,
  TRegisterTenant,
} from "./auth.interface";

import config from "../../config";
import bcrypt from "bcrypt";
import { createToken } from "./auth.utils";
import { dbManager } from "../../config/db";
import ModelFactory from "../../utils/modelFactory";
import catchAsync from "../../utils/catchAsync";

const registerTenantRequest = async (payload: TRegisterTenant) => {
  const { subdomain } = payload;

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

  if (existing) {
    throw new AppError(status.CONFLICT, `This subdomain is already registered`);
  }

  const request = await TenantRequest.create(payload);

  return request;
};

const approveTenant = async (subdomain: string) => {
  let tenantDbCreated = false;

  const centralConn = dbManager.getCentralConnection();
  if (!centralConn)
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Central DB not available",
    );

  const TenantRequest = ModelFactory.getModel(centralConn, "TenantRequest");

  const tenantRequest: ITenantRequest | null = await TenantRequest.findOne({
    subdomain,
  });

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

  const result = await TenantRequest.findByIdAndUpdate(tenantRequest._id, {
    status: "approved",
    approvedAt: new Date(),
  });

  return result;
};

const loginUser = async (payload: LoginBody) => {
  const { email, password, subdomain } = payload;

  // if (dbManager.tenancyType === "single") {
  //   return handleSingleTenantLogin(email, password, res);
  // } else if (dbManager.tenancyType === "multi") {
  //   return await handleMultiTenantLoginAutoDetect(email, password, school, res);
  // } else {
  //   return res.status(400).json({
  //     success: false,
  //     error: "Unknown tenancy type",
  //   });
  // }

  const centralConn = dbManager.getCentralConnection();
  if (!centralConn)
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Central DB not available",
    );

  const envEmail = config.single_admin_email;
  const envPassword = config.single_admin_password;
  let role: string;

  console.log("it is hit now");

  if (!envEmail || !envPassword)
    throw new AppError(status.UNAUTHORIZED, "Admin credentials not configured");

  if (email !== envEmail || password !== envPassword)
    throw new AppError(status.UNAUTHORIZED, "Invalid credentials");

  const tenantConn = await dbManager.getConnection(tenantRequest.subdomain);

  const UserModel = ModelFactory.getModel(tenantConn, "User");

  const user = await UserModel.findOne({ tenantID });

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

  if (!(await UserModel.isPasswordMatch(payload.password, user.password))) {
    throw new AppError(status.FORBIDDEN, "Password do not match");
  }

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

// const handleSingleTenantLogin = async (email, password, res) => {
//   try {

//     const envEmail =
//       process.env.SINGLE_TENANT_ADMIN_EMAIL || process.env.SUPER_ADMIN_ID;
//     const envPasswordPlain = process.env.SUPER_ADMIN_PASS;

//     let tenantConnection = await dbManager.getTenantConnection("school");
//     const User = ModelFactory.getModel(tenantConnection, "User");
//     const Role = ModelFactory.getModel(tenantConnection, "Role");
//     console.log("i am here");

//     if (!envEmail || !envPasswordPlain) {
//       return res.status(500).json({
//         success: false,
//         error: "Where is Super Admin!",
//       });
//     }

//     if (email === envEmail && password === envPasswordPlain) {
//       const jwtPayload = {
//         id: "",
//         email: envEmail,
//         role: process.env.ROLE,
//         school: "school",
//       };

//       const token = generateToken(jwtPayload);

//       return res.status(200).json({
//         success: true,
//         message: "Login successful",
//         user: {
//           id: "",
//           email: envEmail,
//           school: "school",
//         },
//         token,
//         needsPasswordChange: false,
//       });
//     }

//     const user = await User.findOne({ email }).select("+password");

//     console.log("user", user);

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         error: "Invalid email or password",
//       });
//     }

//     if (!user.isActive) {
//       return res.status(403).json({
//         success: false,
//         error:
//           "Your account has been deactivated. Please contact administrator.",
//       });
//     }

//     if (!(await User.isPasswordMatch(password, user.password))) {
//       return res.status(403).json({
//         success: false,
//         message: "Password doesn't match!",
//       });
//     }

//     const role = await Role.findById(user.role);

//     const jwtPayload = {
//       id: user.id,
//       email: user.email,
//       userType: user.userType,
//       childIds: user.childIds,
//       role: role?.roleName || null,
//       roleId: user.role || null,
//       school: "school",
//     };

//     const token = generateToken(jwtPayload);

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       user: {
//         id: user.id,
//         email: user.email,
//         school: "school",
//       },
//       token,
//       needsPasswordChange: user?.needsPasswordChange || false,
//     });

// };

async function handleMultiTenantLoginAutoDetect(email, password, school, res) {
  try {
    await dbManager.initCentralConnection();
    const CentralSchool = ModelFactory.getModel(
      dbManager.centralConnection,
      "School",
    );

    const envEmail = process.env.CENTRAL_SUPER_ADMIN_EMAIL;
    const envPasswordPlain = process.env.CENTRAL_SUPER_ADMIN_PASSWORD;

    if (!envEmail || !envPasswordPlain) {
      return res.status(500).json({
        success: false,
        error: "Where is Super Admin!",
      });
    }

    // Super admin login
    if (email === envEmail && password === envPasswordPlain) {
      const jwtPayload = {
        id: "",
        email: envEmail,
        role: process.env.ROLE,
        school: "school",
      };

      const token = generateToken(jwtPayload);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: "",
          email: envEmail,
          school: "school",
        },
        token,
        needsPasswordChange: false,
      });
    }

    const activeSchool = await CentralSchool.findOne({
      subdomain: school,
    });

    if (!activeSchool) {
      return res.status(500).json({
        success: false,
        error: "You are not authorized!",
      });
    }

    if (!school) {
      return res.status(400).json({
        success: false,
        message: "School identifier is required for multi-tenant login",
      });
    }

    let tenantConnection = await dbManager.getTenantConnection(school);
    const User = ModelFactory.getModel(tenantConnection, "User");
    const Role = ModelFactory.getModel(tenantConnection, "Role");

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      console.log(`You are not authorized!`);
      return res.status(401).json({
        success: false,
        error: "You are not authorized!",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error:
          "Your account has been deactivated. Please contact administrator.",
      });
    }

    if (!(await User.isPasswordMatch(password, user.password))) {
      return res.status(403).json({
        success: false,
        message: "Password doesn't match!",
      });
    }

    let role = null;

    if (user.role && mongoose.Types.ObjectId.isValid(user.role)) {
      role = await Role.findById(user.role);
    }

    console.log("user?.role", role);

    const jwtPayload = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      childIds: user.childIds,
      role: role?.roleName || user?.role,
      school: activeSchool.subdomain,
    };
    console.log("jwtPayload", jwtPayload);

    const token = generateToken(jwtPayload);

    // ============================================
    // PREPARE RESPONSE WITH SUBSCRIPTION STATUS
    // ============================================
    const response = {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        role: role?.roleName || user?.role,
        school: activeSchool.subdomain,
      },
      token,
      needsPasswordChange: user?.needsPasswordChange || false,
    };

    // Add subscription status to response
    if (!subscriptionStatus.isActive) {
      const userType = user.userType;

      // Determine user category
      const isSchoolAdmin =
        userType === "Super Admin" ||
        userType === "School Admin" ||
        (role && role.roleName === "super_admin");

      const isStaff = ["Teacher", "Staff", "Accountant", "Librarian"].includes(
        userType,
      );

      const isStudentOrParent = ["Student", "Parent"].includes(userType);

      response.subscriptionStatus = "EXPIRED";

      // School Admin → redirect to payment
      if (isSchoolAdmin) {
        response.redirectTo = "/payment";
        response.subscriptionMessage =
          "Your subscription has expired. Please renew to continue.";
        response.actionRequired = "PAYMENT_REQUIRED";
      }
      // Staff/Teachers → contact admin
      else if (isStaff) {
        response.subscriptionMessage =
          "Please contact the System Admin to clear the dues. Your account is in expired mode.";
        response.actionRequired = "CONTACT_ADMIN";
      }
      // Students/Parents → contact school
      else if (isStudentOrParent) {
        response.subscriptionMessage =
          "Please contact the School Admin for technical inactivity.";
        response.actionRequired = "CONTACT_SCHOOL";
      }
      // Default
      else {
        response.subscriptionMessage =
          "Your school's subscription has expired. Please contact administration.";
        response.actionRequired = "CONTACT_ADMIN";
      }
    } else {
      response.subscriptionStatus = "ACTIVE";
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("❌ Multi-tenant login error:", error);
    return res.status(500).json({
      success: false,
      error: "Login failed",
      ...(process.env.NODE_ENV === "development" && { details: error.message }),
    });
  }
}

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
