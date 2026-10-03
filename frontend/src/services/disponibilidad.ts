const API_URL = "http://localhost:4000/api";

export interface NuevaDisponibilidad {
  profesorId: number; 
  fecha: string;    
  hora_inicio: string; 
  hora_fin: string;    
}

export async function guardarDisponibilidad(datos: NuevaDisponibilidad) {
  const res = await fetch(`${API_URL}/disponibilidades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Error al guardar la disponibilidad");
  }

  return data;
}