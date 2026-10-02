import { useEffect, useState } from "react";
import { Link } from "react-router";
import { listarProfesores, type Profesor } from "@/services/resenas";

export default function Profesores() {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarProfesores()
      .then(setProfesores)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90">
        Profesores
      </h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Elegí un profesor para ver o dejar una reseña.
      </p>

      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
      )}
      {error && <p className="text-sm text-error-500">{error}</p>}
      {!loading && !error && profesores.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Todavía no hay profesores.
        </p>
      )}

      <ul className="space-y-3">
        {profesores.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-gray-800"
          >
            <span className="text-sm font-medium text-gray-800 dark:text-white/90">
              {p.username}
            </span>
            <div className="flex gap-2">
              <Link
                to={`/profile?profesor=${p.id}`}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Ver reseñas
              </Link>
              <Link
                to={`/profesores/${p.id}/resenar`}
                className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Dejar reseña
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}