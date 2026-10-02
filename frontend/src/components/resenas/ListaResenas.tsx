import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { obtenerResenas, type ResenasProfesor } from "@/services/resenas";

function Estrellas({ valor }: { valor: number }) {
  return (
    <span className="text-lg leading-none">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={
            n <= Math.round(valor)
              ? "text-yellow-400"
              : "text-gray-300 dark:text-gray-600"
          }
        >
          ★
        </span>
      ))}
    </span>
  );
}

function obtenerProfesorId(parametro: string | null): string | null {
  if (parametro) return parametro;

  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?.tipo_usuario === "profesor" && user.documentId) {
      return user.documentId;
    }
  } catch {
    return null;
  }

  return null;
}

export default function ListaResenas() {
  const [searchParams] = useSearchParams();
  const profesorId = obtenerProfesorId(searchParams.get("profesor"));

  const [datos, setDatos] = useState<ResenasProfesor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profesorId) return;

    setLoading(true);
    setError(null);
    obtenerResenas(profesorId)
      .then(setDatos)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [profesorId]);

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        Reseñas
      </h4>

      {!profesorId && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Seleccioná un profesor para ver sus reseñas.
        </p>
      )}

      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
      )}

      {error && <p className="text-sm text-error-500">{error}</p>}

      {datos && !loading && (
        <>
          <div className="mb-5 flex items-center gap-3">
            {datos.promedio !== null ? (
              <>
                <span className="text-3xl font-semibold text-gray-800 dark:text-white/90">
                  {datos.promedio.toFixed(1)}
                </span>
                <Estrellas valor={datos.promedio} />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({datos.total} {datos.total === 1 ? "reseña" : "reseñas"})
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Todavía no hay reseñas.
              </span>
            )}
          </div>

          <ul className="space-y-4">
            {datos.resenas.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {r.alumno}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(r.fecha).toLocaleDateString("es-AR")}
                  </span>
                </div>
                <Estrellas valor={r.calificacion} />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {r.comentario}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}