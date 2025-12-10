import { init } from "@instantdb/react";
import { appSchema } from "./schema";

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!APP_ID) {
  console.warn("InstantDB APP_ID is not configured. Set NEXT_PUBLIC_INSTANT_APP_ID.");
}

export function getInstantClient() {
  if (!APP_ID) {
    throw new Error("InstantDB APP_ID is not configured");
  }

  // InstantDB init - schema parameter may not be in types but is required
  // @ts-expect-error - InstantDB types may not include schema in Config type
  return init({ appId: APP_ID, schema: appSchema });
}

export function getInstantAdmin() {
  if (!APP_ID || !ADMIN_TOKEN) {
    throw new Error("InstantDB APP_ID and ADMIN_TOKEN must be configured");
  }

  // For server-side operations using InstantDB Admin SDK
  const { init: initAdmin } = require("@instantdb/admin");
  return initAdmin({ appId: APP_ID, adminToken: ADMIN_TOKEN });
}

