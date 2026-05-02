import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/session";

async function fetchMembers() {
  return prisma.member.findMany({
    orderBy: { name: "asc" },
    include: { payments: true },
  });
}

export default async function MembersPage() {
  const session = await getServerAuthSession();
  if (!session) {
    return (
      <main className="container">
        <section className="card">
          <h1 className="page-title">Acesso restrito</h1>
          <p>É necessário iniciar sessão para ver a lista de sócios.</p>
          <Link href="/login">
            <button>Ir para Entrar</button>
          </Link>
        </section>
      </main>
    );
  }

  const members = await fetchMembers();

  return (
    <main className="container">
      <section className="card">
        <div className="header">
          <div>
            <h1 className="page-title">Sócios</h1>
            <p>Bem-vindo, {session.user?.name ?? session.user?.email}. Aqui estão os associados registados.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/payments">
              <button>Pagamentos</button>
            </Link>
            <Link href="/members/new">
              <button>+ Novo Sócio</button>
            </Link>
            <Link href="/">
              <button>Início</button>
            </Link>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Submetido</th>
                <th>Pagamentos</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member: any) => (
                <tr key={member.id}>
                  <td>
                    <Link href={`/members/${member.id}`}>{member.name}</Link>
                  </td>
                  <td>{member.category ?? "-"}</td>
                  <td>{member.email ?? "-"}</td>
                  <td>{member.phone ?? "-"}</td>
                  <td>{member.submittedAt ? new Date(member.submittedAt).toLocaleDateString() : "-"}</td>
                  <td>{member.payments.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
