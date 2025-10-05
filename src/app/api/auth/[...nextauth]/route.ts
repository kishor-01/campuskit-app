// app/api/auth/[...nextauth]/route.ts
// A more explicit way to export the handlers

import { handlers } from "@/auth";
export const { GET, POST } = handlers;