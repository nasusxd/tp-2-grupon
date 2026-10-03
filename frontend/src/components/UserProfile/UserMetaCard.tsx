import { getUsuario } from "@/services/session";

export default function UserMetaCard() {
  const usuario = getUsuario();

  if (!usuario) {
    return (
      <div className="mb-6 rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Iniciá sesión para ver tu perfil.
        </p>
      </div>
    );
  }

  const tipo =
    usuario.tipo_usuario === "profesor"
      ? "Profesor"
      : usuario.tipo_usuario === "alumno"
        ? "Alumno"
        : "Usuario";

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-brand-500 text-3xl font-semibold text-white uppercase">
          {usuario.username.charAt(0)}
        </div>
        <div className="text-left">
          <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            {usuario.username}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tipo}</p>
        </div>
      </div>

      <div className="mt-6 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
            Nombre de usuario
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {usuario.username}
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
            Email
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {usuario.email}
          </p>
        </div>
      </div>
    </div>
  );
}