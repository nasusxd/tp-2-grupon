import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import ListaResenas from "@/components/resenas/ListaResenas";
import { listarProfesores, type Profesor } from "@/services/resenas";

export default function PerfilProfesor() {
  const { profesorId } = useParams();
  const [profesor, setProfesor] = useState<Profesor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;

    setProfesor(null);
    setError(null);
    setLoading(true);

    listarProfesores()
      .then((profesores) => {
        if (cancelado) return;
        const encontrado = profesores.find((item) => item.id === profesorId);
        if (!encontrado) {
          setError("No se encontró al profesor.");
          return;
        }
        setProfesor(encontrado);
      })
      .catch((err: Error) => {
        if (!cancelado) setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [profesorId]);

  return (
    <>
      <PageMeta
        title="Perfil del profesor"
        description="Perfil y reseñas del profesor"
      />
      <PageBreadcrumb pageTitle="Perfil del profesor" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Perfil del profesor
          </h1>
          {profesorId && (
            <Link
              to={`/profesores/${profesorId}/resenar`}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Dejar reseña
            </Link>
          )}
        </div>

        {loading && (
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Cargando perfil...
          </p>
        )}
        {error && (
          <p className="mb-6 text-sm text-error-500" role="alert">
            {error}
          </p>
        )}

        {profesor && (
          <div className="mb-6 rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-brand-500 text-2xl font-semibold text-white uppercase">
                {profesor.username.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {profesor.username}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Profesor
                </p>
              </div>
            </div>
          </div>
        )}

        {profesorId && <ListaResenas profesorId={profesorId} />}
      </div>
    </>
  );
}
