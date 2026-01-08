import { createAuthClient } from "better-auth/client";

const authClient = createAuthClient();

export const getSession = async () => {
  return await authClient.getSession();
};

export const signIn = async () => {
  const data = await authClient.signIn.social({
    provider: "google",
  });

  return data;
};

export const signOut = async () => {
  return await authClient.signOut();
};
