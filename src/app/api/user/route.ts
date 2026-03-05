"use server";

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/permissions/requireRole";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/api.types";
import { canUpdateUser } from "@/permissions/userPermissions";
import bcrypt from "bcryptjs";

export const GET = requireRole(
  async (req, user) => {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const users = await prisma.user.findMany(
        { 
            where: { id: id ?? undefined },
            select: {
                id: true,
                name: true,
                role: true
            }
        } 
    );

    const apiResponse: ApiResponse<typeof users> = {
      data: users,
      msg: "Usuários listados com sucesso",
    };

    return NextResponse.json(apiResponse);
},
"ADMIN");

export const PUT = canUpdateUser(
  async (req, user) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if(!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 });
    }

   let passwordHash: string | undefined = undefined;
      if(body.password) {
        passwordHash = await bcrypt.hash(body.password, 10);
      }

      const userUpdated = await prisma.user.update({
        where: { id },
        data: { 
           name: body.name?? undefined,
           email: body.email?? undefined,
           password: passwordHash?? undefined,
         }
      });

      const apiResponse = {
        msg: "Usuário atualizado com sucesso",
        data: userUpdated,
      };
      

    return NextResponse.json(apiResponse);
  });