"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Payment {
  id: string;
  year: number;
  amount: number;
  status: string;
  paidAt?: string;
  member: {
    id: string;
    name: string;
  };
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch("/api/payments");
        if (!response.ok) {
          throw new Error("Erro ao carregar pagamentos");
        }
        const data = await response.json();
        setPayments(data);

        // Extrair anos únicos
        const uniqueYears = [...new Set(data.map((p: any) => p.year))].sort(
          (a, b) => (b as number) - (a as number)
        ) as number[];
        setYears(uniqueYears);

        // Selecionar ano atual por defeito
        const currentYear = new Date().getFullYear();
        if (uniqueYears.includes(currentYear)) {
          setSelectedYear(currentYear.toString());
        } else if (uniqueYears.length > 0) {
          setSelectedYear(uniqueYears[0].toString());
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      const filtered = payments.filter((p) => p.year === parseInt(selectedYear));
      setFilteredPayments(filtered);
    } else {
      setFilteredPayments(payments);
    }
  }, [selectedYear, payments]);

  const handleDelete = async (paymentId: string) => {
    if (!confirm("Tem a certeza que quer eliminar este pagamento?")) return;

    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao eliminar pagamento");
      }

      setPayments(payments.filter((p) => p.id !== paymentId));
    } catch (err: any) {
      setError(err.message);
    }
  };

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

  if (loading) return <main className="container"><p>A carregar...</p></main>;

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = filteredPayments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <main className="container">
      <section className="card">
        <div className="header">
          <div>
            <h1 className="page-title">Pagamentos</h1>
            <p>Gerir pagamentos de sócios</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/payments/new">
              <button>+ Novo Pagamento</button>
            </Link>
            <Link href="/members">
              <button>Sócios</button>
            </Link>
          </div>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="field" style={{ marginBottom: "20px" }}>
          <label htmlFor="year-filter">Filtrar por ano:</label>
          <select
            id="year-filter"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Todos os anos</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {selectedYear && (
          <div style={{ marginBottom: "20px", padding: "10px", background: "#f8f9fa", borderRadius: "5px" }}>
            <p>
              <strong>Total: €{totalAmount.toFixed(2)}</strong> | Pago: €{paidAmount.toFixed(2)} | Pendente: €{(totalAmount - paidAmount).toFixed(2)}
            </p>
          </div>
        )}

        {filteredPayments.length === 0 ? (
          <p>Nenhum pagamento registado {selectedYear ? `para ${selectedYear}` : ""}.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Sócio</th>
                  <th>Ano</th>
                  <th>Valor</th>
                  <th>Estado</th>
                  <th>Data Pagamento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <Link href={`/members/${payment.member.id}`}>
                        {payment.member.name}
                      </Link>
                    </td>
                    <td>{payment.year}</td>
                    <td>€{payment.amount.toFixed(2)}</td>
                    <td>
                      <span style={{ color: getStatusColor(payment.status) }}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td>
                      {payment.paidAt
                        ? new Date(payment.paidAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(payment.id)}
                        style={{
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "3px",
                          cursor: "pointer",
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
