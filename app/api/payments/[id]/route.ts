import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getServerAuthSession } from "@/lib/session";

interface PaymentRouteProps {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: PaymentRouteProps) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, status, paidAt } = body;

    const payment = await prisma.payment.update({
      where: { id: params.id },
      data: {
        amount: amount || undefined,
        status: status || undefined,
        paidAt: paidAt ? new Date(paidAt) : null,
      },
      include: { member: true },
    });

    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar pagamento" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: PaymentRouteProps) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    await prisma.payment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Pagamento eliminado" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao eliminar pagamento" }, { status: 500 });
  }
}
