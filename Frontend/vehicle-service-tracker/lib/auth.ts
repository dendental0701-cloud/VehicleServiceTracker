export type UserRole =
  | "Owner"
  | "ServiceCenter";

export interface LoginResponse {
  success: boolean;
  role: UserRole;
  userId: number;
}

export interface CurrentUserResponse {
  success: boolean;
  role: UserRole;
  userId: number;
}