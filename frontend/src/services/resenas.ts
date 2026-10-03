const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export type Resena = {
  id: string;
  calificacion: number;
  comentario: string;
  alumno: string;
  fecha: string;
};

export type ResenasProfesor = {
  promedio: number | null;
  total: number;
  resenas: Resena[];
};

export async function crearResena(datos: {
  profesorId: string;
  calificacion: number;
  comentario: string;
}) {
  const jwt = localStorage.getItem("jwt");

  const res = await fetch(`${BACKEND_URL}/resenas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(datos),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || "Error al enviar la reseña");
  }

  return data;
}

export async function obtenerResenas(profesorId: string): Promise<ResenasProfesor> {
  const res = await fetch(`${BACKEND_URL}/profesores/${profesorId}/resenas`);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || "Error al obtener las reseñas");
  }

  return data;
}

export type Profesor = {
  id: string;
  username: string;
};

export async function listarProfesores(): Promise<Profesor[]> {
  const res = await fetch(`${BACKEND_URL}/profesores`);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || "Error al obtener los profesores");
  }

  return data;
}