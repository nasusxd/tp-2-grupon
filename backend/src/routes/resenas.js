import { Router } from "express";
import dotenv from "dotenv";


dotenv.config();

const router = Router();

const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;


async function strapi(path, { token = STRAPI_API_TOKEN, ...options } = {}) {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const body = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, body };
}

router.post("/resenas", async (req, res) => {
  try {
  
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Falta el token de sesión" });
    }
    const userToken = authHeader.slice(7);

    const me = await strapi("/users/me", { token: userToken });
    if (!me.ok) {
      return res.status(401).json({ error: "Sesión inválida o vencida" });
    }
    const alumno = me.body;

    if (alumno.tipo_usuario !== "alumno") {
      return res.status(403).json({ error: "Solo los alumnos pueden reseñar" });
    }

    
    const { profesorId, calificacion, comentario } = req.body ?? {};
    const nota = Number(calificacion);

    if (typeof profesorId !== "string" || !profesorId.trim()) {
      return res.status(400).json({ error: "Falta el profesor" });
    }
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
      return res
        .status(400)
        .json({ error: "La calificación debe ser un entero entre 1 y 5" });
    }
    if (typeof comentario !== "string" || !comentario.trim()) {
      return res.status(400).json({ error: "El comentario es obligatorio" });
    }

    
    const profesorQuery =
      `/users?filters[documentId][$eq]=${encodeURIComponent(profesorId)}` +
      `&filters[tipo_usuario][$eq]=profesor`;
    const profesor = await strapi(profesorQuery);
    if (!profesor.ok || !Array.isArray(profesor.body) || profesor.body.length === 0) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }

   
    const duplicadaQuery =
      `/resenas?filters[alumno][documentId][$eq]=${encodeURIComponent(alumno.documentId)}` +
      `&filters[profesor][documentId][$eq]=${encodeURIComponent(profesorId)}` +
      `&pagination[pageSize]=1`;
    const existente = await strapi(duplicadaQuery);
    if (!existente.ok) {
      return res.status(502).json({ error: "No se pudo verificar reseñas previas" });
    }
    if (existente.body?.meta?.pagination?.total > 0) {
      return res
        .status(409)
        .json({ error: "Ya reseñaste a este profesor" });
    }

    
    const creada = await strapi("/resenas", {
      method: "POST",
      body: JSON.stringify({
        data: {
          calificacion: nota,
          comentario: comentario.trim(),
          alumno: alumno.documentId,
          profesor: profesorId,
        },
      }),
    });
    if (!creada.ok) {
      return res
        .status(502)
        .json({ error: "Strapi no pudo guardar la reseña", detalle: creada.body });
    }

    res.status(201).json(creada.body.data);
  } catch (err) {
    console.error("Error al crear reseña:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;