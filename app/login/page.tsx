"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Credenciais inválidas. Verifique email e senha.");
      return;
    }

    router.push("/members");
  };

  return (
    <main className="container">
      <section className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1 className="page-title">Entrar</h1>
        <p>Use a conta de administrador criada durante a configuração inicial para começar.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error ? <p style={{ color: "#b91c1c" }}>{error}</p> : null}
          <button type="submit">Entrar</button>
        </form>
      </section>
    </main>
  );
}
