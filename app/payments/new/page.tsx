"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  name: string;
}

export default function NewPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    memberId: "",
    year: currentYear,
    amount: "",
    status: "PENDING",
    paidAt: "",
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/members");
        const data = await response.json();
        setMembers(data);
      } catch (err) {
        setError("Erro ao carregar sócios");
      }
    };

    fetchMembers();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year.toString()),
          amount: parseFloat(formData.amount),
          paidAt: formData.status === "PAID" && formData.paidAt ? formData.paidAt : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao registar pagamento");
      }

      router.push("/payments");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <section className="card">
        <div className="header">
          <div>
            <h1 className="page-title">Novo Pagamento</h1>
            <p>Registar um novo pagamento de sócio.</p>
          </div>
          <div>
            <Link href="/payments">
              <button>Voltar</button>
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="field">
            <label htmlFor="memberId">Sócio *</label>
            <select
              id="memberId"
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um sócio</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="year">Ano *</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="amount">Valor (€) *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="status">Estado *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="CANCELED">Cancelado</option>
            </select>
          </div>

          {formData.status === "PAID" && (
            <div className="field">
              <label htmlFor="paidAt">Data de Pagamento</label>
              <input
                type="date"
                id="paidAt"
                name="paidAt"
                value={formData.paidAt}
                onChange={handleChange}
              />
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Registando..." : "Registar Pagamento"}
          </button>
        </form>
      </section>
    </main>
  );
}
