const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export type DisponibilidadHorario = {
  documentId: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
};

export type DatosDisponibilidad = Omit<DisponibilidadHorario, "documentId">;

function obtenerToken() {
  const token = localStorage.getItem("jwt");
  if (!token) {
    throw new Error("Iniciá sesión para gestionar o reservar horarios");
  }
  return token;
}

async function leerRespuesta<T>(res: Response, mensaje: string): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.error || mensaje);
  }
  return data as T;
}

function obtenerBackendUrl() {
  if (!BACKEND_URL) {
    throw new Error("Falta configurar VITE_BACKEND_URL");
  }
  return BACKEND_URL;
}

function headersAutenticacion() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${obtenerToken()}`,
  };
}

export async function listarDisponibilidadesProfesor(
  profesorId: string,
): Promise<DisponibilidadHorario[]> {
  const params = new URLSearchParams({ profesorId });
  const res = await fetch(`${obtenerBackendUrl()}/disponibilidades?${params}`);
  const data = await leerRespuesta<{
    horariosDisponibles?: DisponibilidadHorario[];
  }>(res, "Error al obtener las disponibilidades");
  if (!Array.isArray(data.horariosDisponibles)) {
    throw new Error("El backend devolvió una respuesta inválida");
  }
  return data.horariosDisponibles;
}

export async function crearDisponibilidad(
  datos: DatosDisponibilidad,
) {
  const res = await fetch(`${obtenerBackendUrl()}/disponibilidades`, {
    method: "POST",
    headers: headersAutenticacion(),
    body: JSON.stringify(datos),
  });
  return leerRespuesta<{ data: DisponibilidadHorario }>(
    res,
    "Error al guardar la disponibilidad",
  );
}

export async function actualizarDisponibilidad(
  documentId: string,
  datos: DatosDisponibilidad,
) {
  const res = await fetch(
    `${obtenerBackendUrl()}/disponibilidades/${encodeURIComponent(documentId)}`,
    {
      method: "PUT",
      headers: headersAutenticacion(),
      body: JSON.stringify(datos),
    },
  );
  return leerRespuesta<{ data: DisponibilidadHorario }>(
    res,
    "Error al actualizar la disponibilidad",
  );
}

export async function eliminarDisponibilidadProfesor(documentId: string) {
  const res = await fetch(
    `${obtenerBackendUrl()}/disponibilidades/${encodeURIComponent(documentId)}`,
    {
      method: "DELETE",
      headers: headersAutenticacion(),
    },
  );
  await leerRespuesta<unknown>(res, "Error al eliminar la disponibilidad");
}

export async function listarHorariosDisponibles(
  profesorId: string,
): Promise<DisponibilidadHorario[]> {
  const params = new URLSearchParams({ profesorId });
  const res = await fetch(`${obtenerBackendUrl()}/disponibilidades?${params}`);
  const data = await leerRespuesta<{
    horariosDisponibles?: DisponibilidadHorario[];
  }>(res, "Error al obtener los horarios disponibles");
  if (!Array.isArray(data.horariosDisponibles)) {
    throw new Error("El backend devolvió una respuesta inválida");
  }
  return data.horariosDisponibles;
}

export async function reservarHorario(
  documentId: string,
  profesorId: string,
) {
  const res = await fetch(
    `${obtenerBackendUrl()}/disponibilidades/${encodeURIComponent(documentId)}`,
    {
      method: "DELETE",
      headers: {
        ...headersAutenticacion(),
      },
      body: JSON.stringify({ profesorId }),
    },
  );
  await leerRespuesta<unknown>(res, "No se pudo reservar el horario");
}