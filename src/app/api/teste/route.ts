import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/middlewares/requireRole";

export const GET = requireRole(
  async (req, user) => {
    return Response.json({ message: "Acesso liberado" });
  },
  "USER",);