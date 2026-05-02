import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/session";
import Link from "next/link";

interface MemberPageProps {
  params: { id: string };
}

export default async function MemberDetailsPage({ params }: MemberPageProps) {
  const session = await getServerAuthSession();
  if (!session) {
    return (
      <main className="container">
        <section className="card">
          <h1 className="page-title">Acesso restrito</h1>
          <p>Inicie sessão para ver os detalhes do sócio.</p>
        </section>
      </main>
    );
  }

  const member = await prisma.member.findUnique({
    where: { id: params.id },
    include: { payments: { orderBy: { year: "desc" } } },
  });

  if (!member) {
    return (
      <main className="container">
        <section className="card">
          <h1 className="page-title">Sócio não encontrado</h1>
          <Link href="/members">
            <button>Voltar a Sócios</button>
          </Link>
        </section>
      </main>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "#28a745";
      case "PENDING":
        return "#ffc107";
      case "CANCELED":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return "Pago";
      case "PENDING":
        return "Pendente";
      case "CANCELED":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <main className="container">
      <section className="card">
        <div className="header">
          <div>
            <h1 className="page-title">{member.name}</h1>
            <p>Categoria: {member.category ?? "-"}</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href={`/members/${member.id}/edit`}>
              <button>✏️ Editar</button>
            </Link>
            <Link href="/members">
              <button>Voltar</button>
            </Link>
          </div>
        </div>

        <div className="field">
          <p><strong>Morada:</strong> {member.address ?? "-"}</p>
          <p><strong>NIF:</strong> {member.nif ?? "-"}</p>
          <p><strong>Data Nascimento:</strong> {member.birthDate ? new Date(member.birthDate).toLocaleDateString() : "-"}</p>
          <p><strong>Email:</strong> {member.email ?? "-"}</p>
          <p><strong>Telefone:</strong> {member.phone ?? "-"}</p>
          <p><strong>Submetido em:</strong> {member.submittedAt ? new Date(member.submittedAt).toLocaleDateString() : "-"}</p>
          <p><strong>Nota:</strong> {member.note ?? "-"}</p>
        </div>

        <div className="table-wrapper">
          <div className="header">
            <h2 className="section-title">Pagamentos ({member.payments.length})</h2>
            <Link href={`/payments/new`}>
              <button>+ Novo Pagamento</button>
            </Link>
          </div>
          {member.payments.length === 0 ? (
            <p>Nenhum pagamento registado para este sócio.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ano</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Pago em</th>
                </tr>
              </thead>
              <tbody>
                {member.payments.map((payment: any) => (
                  <tr key={payment.id}>
                    <td>{payment.year}</td>
                    <td>€{payment.amount.toFixed(2)}</td>
                    <td>
                      <span style={{ color: getStatusColor(payment.status) }}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td>{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
