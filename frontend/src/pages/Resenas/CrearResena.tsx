import Label from "@/components/form/Label";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { crearResena } from "@/services/resenas";

export default function CrearResena() {
  const { profesorId } = useParams();
  const navigate = useNavigate();

  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!profesorId) {
      setError("Falta el profesor.");
      return;
    }
    if (calificacion < 1) {
      setError("Elegí una calificación.");
      return;
    }
    if (!comentario.trim()) {
      setError("Escribí un comentario.");
      return;
    }

    setLoading(true);
    try {
      await crearResena({ profesorId, calificacion, comentario });
      navigate(`/profile?profesor=${profesorId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90">
        Dejar una reseña
      </h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Contá cómo fue tu clase con el profesor.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {error && <p className="text-sm text-error-500">{error}</p>}

          <div>
            <Label>
              Calificación<span className="text-error-500">*</span>
            </Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCalificacion(n)}
                  className={`text-3xl leading-none transition ${
                    n <= calificacion ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                  }`}
                  aria-label={`${n} estrellas`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>
              Comentario<span className="text-error-500">*</span>
            </Label>
            <textarea
              rows={5}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribí tu reseña"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar reseña"}
          </button>
        </div>
      </form>
    </div>
  );
}