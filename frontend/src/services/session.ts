export type UsuarioSesion = {
  id: number;
  documentId: string;
  username: string;
  email: string;
  tipo_usuario?: "alumno" | "profesor";
};

export function getUsuario(): UsuarioSesion | null {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem("jwt");
  localStorage.removeItem("user");
}