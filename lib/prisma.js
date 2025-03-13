import { PrismaClient } from "@prisma/client";

export const db= globalThis.prisma ||  new PrismaClient();

if(process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

// globalThis ensures that on reloading it will not create a new instance of PrismaClient