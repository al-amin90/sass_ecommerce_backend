export type TRegisterTenant = {
  businessName: string;
  subdomain: string;
  adminEmail: string;
  adminPassword: string;
  contactPhone?: string;
  address?: string;
  status: string;
  approvedAt: string;
};

export type LoginBody = {
  email: string;
  password: string;
  subdomain?: string;
};

export type TChangePassword = {
  oldPassword: string;
  newPassword: string;
};
