import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getServerAuthSession } from "@/lib/session";

export async function GET() {
  const members = await prisma.member.findMany({
    orderBy: { name: "asc" },
    include: { payments: true },
  });
  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, address, nif, birthDate, email, phone, category, note } = body;

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const member = await prisma.member.create({
      data: {
        name,
        address: address || null,
        nif: nif || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        email: email || null,
        phone: phone || null,
        category: category || null,
        note: note || null,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar sócio" }, { status: 500 });
  }
}
