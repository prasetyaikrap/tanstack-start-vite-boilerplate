import { ENVS } from "./envs";

export const COOKIES = {
  accessToken: `${ENVS.APP_ID.toLowerCase()}_access_token`,
  refreshToken: `${ENVS.APP_ID.toLowerCase()}_refresh_token`,
  sessionId: `${ENVS.APP_ID.toLowerCase()}_session_id`,
};
