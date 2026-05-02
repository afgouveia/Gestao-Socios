import Link from "next/link";
import { getServerAuthSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getServerAuthSession();

  return (
    <main className="container">
      <section className="card">
        <div className="header">
          <div>
            <h1 className="page-title">Gestão de Sócios</h1>
            <p>Comece a gerir associados, categorias e pagamentos com um sistema simples e responsivo.</p>
          </div>
          <div>
            {session ? (
              <Link href="/members">
                <button>Sócios</button>
              </Link>
            ) : (
              <Link href="/login">
                <button>Entrar</button>
              </Link>
            )}
          </div>
        </div>

        <div>
          <h2 className="section-title">O que já está implementado</h2>
          <ul>
            <li>✅ Estrutura de dados para sócios, pagamentos e utilizadores.</li>
            <li>✅ Autenticação segura via NextAuth.</li>
            <li>✅ Lista de sócios com detalhes completos.</li>
            <li>✅ Base para permissões por papel de utilizador.</li>
            <li>✅ Criar novos sócios com formulário.</li>
            <li>✅ Editar informações de sócios.</li>
            <li>✅ Registar pagamentos com status (Pendente, Pago, Cancelado).</li>
            <li>✅ Filtrar pagamentos por ano.</li>
            <li>✅ Ver histórico de pagamentos por sócio.</li>
          </ul>
        </div>

        {session && (
          <div style={{ marginTop: "24px" }}>
            <h2 className="section-title">Navegação rápida</h2>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link href="/members">
                <button>👥 Sócios</button>
              </Link>
              <Link href="/members/new">
                <button>➕ Novo Sócio</button>
              </Link>
              <Link href="/payments">
                <button>💰 Pagamentos</button>
              </Link>
              <Link href="/payments/new">
                <button>➕ Novo Pagamento</button>
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
