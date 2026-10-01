const API_URL = import.meta.env.VITE_API_URL;

export async function registrar(datos: {
  username: string;
  email: string;
  password: string;
  tipo_usuario: string;
}) {
  const res = await fetch(`${API_URL}/auth/local/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Error al registrarse");
  }

  return data;
}

export async function iniciarSesion(datos: { identifier: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Error al iniciar sesión");
  }

  return data;
}