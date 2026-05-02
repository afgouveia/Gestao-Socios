import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getServerAuthSession } from "@/lib/session";

interface MemberRouteProps {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: MemberRouteProps) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, address, nif, birthDate, email, phone, category, note } = body;

    const member = await prisma.member.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        address: address || null,
        nif: nif || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        email: email || null,
        phone: phone || null,
        category: category || null,
        note: note || null,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar sócio" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: MemberRouteProps) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await prisma.member.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Sócio eliminado" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao eliminar sócio" }, { status: 500 });
  }
}
