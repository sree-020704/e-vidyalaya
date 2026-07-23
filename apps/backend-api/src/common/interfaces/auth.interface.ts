export interface UserSessionPayload {
  userId: string;
  tenantId: string;
  role: "student" | "faculty" | "admin";
}
