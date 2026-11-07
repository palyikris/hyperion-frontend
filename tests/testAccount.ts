/// <reference types="node" />
import { env } from "node:process";

export function getTestCredentials() {
  const email = env.E2E_EMAIL;
  const password = env.E2E_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Set E2E_EMAIL and E2E_PASSWORD for a dedicated, disposable test account. " +
      "The media workflow tests clear that account's Vault.",
    );
  }
  return { email, password };
}
