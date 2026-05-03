"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ImportSummary = {
  createdMembers: number;
  updatedMembers: number;
  createdPayments: number;
  updatedPayments: number;
  skippedRows: number;
  warnings: string[];
};

export function ImportExcelButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/members/import", {
        method: "POST",
        body: formData,
      });
      const responseText = await response.text();
      const result = responseText ? JSON.parse(responseText) : {};

      if (!response.ok) {
        throw new Error(result.error ?? "Erro ao importar Excel");
      }

      const summary = result as ImportSummary;
      setMessage(
        `${summary.createdMembers} socios criados, ${summary.updatedMembers} atualizados, ` +
          `${summary.createdPayments} pagamentos criados, ${summary.updatedPayments} atualizados.`
      );
      if (summary.warnings.length > 0) {
        setError(summary.warnings.slice(0, 3).join(" "));
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFile}
        style={{ display: "none" }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading ? "A importar..." : "Importar Excel"}
      </button>
      {message ? <small style={{ color: "#166534" }}>{message}</small> : null}
      {error ? <small style={{ color: "#b91c1c" }}>{error}</small> : null}
    </div>
  );
}
