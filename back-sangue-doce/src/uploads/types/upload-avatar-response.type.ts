import { JwtPayload } from "src/auth/types/jwt-payload.type";

export type UploadAvatarResponse = {
  access_token: string;
  avatarUrl: string;
  bucket: string;
  objectName: string;
  profile: JwtPayload;
};
