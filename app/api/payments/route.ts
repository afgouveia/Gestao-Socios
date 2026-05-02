import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getServerAuthSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const year = request.nextUrl.searchParams.get("year");
    const memberId = request.nextUrl.searchParams.get("memberId");

    const where: any = {};
    if (year) where.year = parseInt(year);
    if (memberId) where.memberId = memberId;

    const payments = await prisma.payment.findMany({
      where,
      include: { member: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar pagamentos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { memberId, year, amount, status, paidAt } = body;

    if (!memberId || !year || !amount) {
      return NextResponse.json(
        { error: "Campos obrigatórios: memberId, year, amount" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        memberId,
        year,
        amount,
        status: status || "PENDING",
        paidAt: paidAt ? new Date(paidAt) : null,
      },
      include: { member: true },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar pagamento" }, { status: 500 });
  }
}
