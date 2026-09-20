import { useState, type FormEvent } from "react";
import { LoaderCircle, LogIn, ShieldCheck } from "lucide-react";

type LoginScreenProps = {
  configured?: boolean;
  loading?: boolean;
  error?: string | null;
  onSignIn?: (email: string, password: string) => void;
};

export function LoginScreen({
  configured = true,
  loading = false,
  error,
  onSignIn,
}: LoginScreenProps) {
  const ready = configured;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password || !ready || loading) return;
    onSignIn?.(email, password);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f7f8fa] px-5 py-10">
      <section className="w-full max-w-sm rounded-[28px] border border-gray-200 bg-white p-7 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white">
          <ShieldCheck size={24} />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Bienvenido</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Inicia sesión en Focus para continuar.
        </p>

        {!configured && (
          <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
            Falta configurar Firebase en las variables VITE_FIREBASE_*.
          </p>
        )}

        {error && (
          <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-gray-600">Correo</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo@ejemplo.com"
              required
              className="mt-1.5 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-300 focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-gray-600">Contraseña</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu contraseña"
              required
              className="mt-1.5 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-300 focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
            />
          </label>

          <button
            type="submit"
            disabled={!ready || loading || !email.trim() || !password}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 text-sm font-semibold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? <LoaderCircle className="animate-spin" size={18} /> : <LogIn size={18} />}
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

      </section>
    </main>
  );
}
