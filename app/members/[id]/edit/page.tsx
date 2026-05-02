"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

interface Member {
  id: string;
  name: string;
  address?: string;
  nif?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
  category?: string;
  note?: string;
}

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [member, setMember] = useState<Member | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    nif: "",
    birthDate: "",
    email: "",
    phone: "",
    category: "",
    note: "",
  });

  useEffect(() => {
    if (!memberId) return;

    const fetchMember = async () => {
      try {
        // Buscar todos os membros (temporário até ter endpoint específico)
        const response = await fetch("/api/members");
        if (!response.ok) throw new Error("Erro ao carregar sócio");
        
        const members = await response.json();
        const current = members.find((m: Member) => m.id === memberId);
        
        if (current) {
          setMember(current);
          setFormData({
            name: current.name || "",
            address: current.address || "",
            nif: current.nif || "",
            birthDate: current.birthDate ? current.birthDate.split("T")[0] : "",
            email: current.email || "",
            phone: current.phone || "",
            category: current.category || "",
            note: current.note || "",
          });
        } else {
          setError("Sócio não encontrado");
        }
      } catch (err) {
        setError("Erro ao carregar sócio");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [memberId]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar sócio");
      }

      router.push(`/members/${memberId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem a certeza que quer eliminar este sócio?")) return;

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao eliminar sócio");
      }

      router.push("/members");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <main className="container"><p>A carregar...</p></main>;

  return (
    <main className="container">
      <section className="card">
        <div className="header">
          <div>
            <h1 className="page-title">Editar Sócio</h1>
            <p>Edite as informações do sócio {member?.name}</p>
          </div>
          <div>
            <Link href={`/members/${memberId}`}>
              <button>Voltar</button>
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="field">
            <label htmlFor="name">Nome *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="category">Categoria</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="phone">Telefone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="nif">NIF</label>
            <input
              type="text"
              id="nif"
              name="nif"
              value={formData.nif}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="birthDate">Data de Nascimento</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="address">Morada</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="note">Notas</label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Alterações"}
            </button>
            <button type="button" onClick={handleDelete} style={{ background: "#dc3545" }}>
              Eliminar Sócio
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
