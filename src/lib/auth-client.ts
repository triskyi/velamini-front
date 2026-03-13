"use client";

import {
  __NEXTAUTH,
  SessionProvider,
  signIn as nextSignIn,
  signOut as nextSignOut,
  useSession,
} from "next-auth/react";

const AUTH_BASE_PATH = "/api/auth";

function ensureAuthBasePath() {
  if (__NEXTAUTH.basePath !== AUTH_BASE_PATH) {
    __NEXTAUTH.basePath = AUTH_BASE_PATH;
  }
}

ensureAuthBasePath();

export function signIn(...args: Parameters<typeof nextSignIn>) {
  ensureAuthBasePath();
  return nextSignIn(...args);
}

export function signOut(...args: Parameters<typeof nextSignOut>) {
  ensureAuthBasePath();
  return nextSignOut(...args);
}

export { SessionProvider, useSession };
