import { Router } from "express";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

async function strapi(path, { token = STRAPI_API_TOKEN, ...options } = {}) {
  if (!token) {
    throw new Error("STRAPI_API_TOKEN no está configurado");
  }

  const response = await fetch(`${STRAPI_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, body };
}

function obtenerIdDocumentoRelacion(relacion) {
  return (
    relacion?.documentId ??
    relacion?.data?.documentId ??
    relacion?.data?.id?.documentId ??
    null
  );
}

function datosHorarioValidos(data) {
  if (!data || typeof data !== "object") return false;
  const { fecha, hora_inicio, hora_fin } = data;
  if (
    typeof fecha !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
    typeof hora_inicio !== "string" ||
    !/^\d{2}:\d{2}(?::\d{2})?$/.test(hora_inicio) ||
    typeof hora_fin !== "string" ||
    !/^\d{2}:\d{2}(?::\d{2})?$/.test(hora_fin)
  ) {
    return false;
  }

  const [year, month, day] = fecha.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const horaInicioHoras = Number(hora_inicio.slice(0, 2));
  const horaInicioMin = Number(hora_inicio.slice(3, 5));
  const horaFinHoras = Number(hora_fin.slice(0, 2));
  const horaFinMin = Number(hora_fin.slice(3, 5));
  const horaInicioMinutos = horaInicioHoras * 60 + horaInicioMin;
  const horaFinMinutos = horaFinHoras * 60 + horaFinMin;
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    horaInicioHoras < 24 &&
    horaInicioMin < 60 &&
    horaFinHoras < 24 &&
    horaFinMin < 60 &&
    horaInicioMinutos >= 0 &&
    horaInicioMinutos < 24 * 60 &&
    horaFinMinutos >= 0 &&
    horaFinMinutos < 24 * 60 &&
    horaInicioMinutos < horaFinMinutos
  );
}

function normalizarHora(hora) {
  const [horas, minutos, segundos = "00"] = hora.split(":");
  return `${horas}:${minutos}:${segundos.padEnd(2, "0")}.000`;
}

async function autenticar(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return { status: 401, error: "Falta el token de sesión" };
  }
  const usuario = await strapi("/users/me", { token: authHeader.slice(7) });
  if (!usuario.ok) {
    return { status: 401, error: "Sesión inválida o vencida" };
  }
  return { usuario: usuario.body };
}

async function obtenerDisponibilidad(documentId) {
  return strapi(
    `/disponibilidades/${encodeURIComponent(documentId)}?populate[profesor]=true`,
  );
}

async function validarSinCruces(data, profesorId, excluirDocumentId) {
  const params = new URLSearchParams({
    "filters[profesor][documentId][$eq]": profesorId,
    "filters[fecha][$eq]": data.fecha,
    "pagination[pageSize]": "100",
  });
  const existing = await strapi(`/disponibilidades?${params}`);
  if (!existing.ok || !Array.isArray(existing.body?.data)) {
    return { error: "No se pudieron verificar otros horarios del profesor" };
  }

  const inicio = data.hora_inicio.slice(0, 5);
  const fin = data.hora_fin.slice(0, 5);
  const cruza = existing.body.data.some((horario) => {
    if (horario.documentId === excluirDocumentId) return false;
    const inicioExistente = horario.hora_inicio.slice(0, 5);
    const finExistente = horario.hora_fin.slice(0, 5);
    return inicio < finExistente && fin > inicioExistente;
  });
  return cruza ? { conflict: true } : {};
}

router.get("/", async (req, res) => {
  const { profesorId, fecha } = req.query;
  if (typeof profesorId !== "string" || !profesorId.trim()) {
    return res.status(400).json({ error: "Falta el parámetro profesorId" });
  }
  if (fecha !== undefined && (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha))) {
    return res.status(400).json({ error: "La fecha debe tener formato YYYY-MM-DD" });
  }

  try {
    const params = new URLSearchParams({
      "filters[profesor][documentId][$eq]": profesorId,
      "pagination[pageSize]": "100",
      "sort[0]": "fecha:asc",
      "populate[profesor]": "true",
    });
    if (fecha) params.set("filters[fecha][$eq]", fecha);

    const result = await strapi(`/disponibilidades?${params}`);
    if (!result.ok) {
      console.error("Strapi rechazó la consulta de disponibilidades:", result.status);
      return res.status(502).json({
        error: "No se pudieron obtener los horarios del profesor",
      });
    }

    const disponibilidades = Array.isArray(result.body?.data)
      ? result.body.data
      : null;
    if (!disponibilidades) {
      console.error("Strapi devolvió un formato inesperado al consultar disponibilidades");
      return res.status(502).json({
        error: "Strapi devolvió una respuesta inválida",
      });
    }

    res.json({
      profesorId,
      fecha: fecha || "todas",
      horariosDisponibles: disponibilidades.map((disponibilidad) => ({
        id: disponibilidad.documentId,
        documentId: disponibilidad.documentId,
        fecha: disponibilidad.fecha,
        hora_inicio: disponibilidad.hora_inicio,
        hora_fin: disponibilidad.hora_fin,
      })),
    });
  } catch (error) {
    console.error("Error al consultar disponibilidades en Strapi:", error);
    res.status(502).json({ error: "No se pudo conectar con Strapi" });
  }
});

router.post("/", async (req, res) => {
  try {
    const auth = await autenticar(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });
    if (auth.usuario?.tipo_usuario !== "profesor" || !auth.usuario.documentId) {
      return res.status(403).json({
        error: "Solo los profesores pueden crear disponibilidades",
      });
    }

    const data = req.body ?? {};
    if (!datosHorarioValidos(data)) {
      return res.status(400).json({
        error: "La fecha y el rango horario no son válidos",
      });
    }

    const validacion = await validarSinCruces(data, auth.usuario.documentId);
    if (validacion.error) {
      return res.status(502).json({ error: validacion.error });
    }
    if (validacion.conflict) {
      return res.status(409).json({
        error: "El horario se superpone con otra disponibilidad",
      });
    }

    const creada = await strapi("/disponibilidades", {
      method: "POST",
      body: JSON.stringify({
        data: {
          fecha: data.fecha,
          hora_inicio: normalizarHora(data.hora_inicio),
          hora_fin: normalizarHora(data.hora_fin),
          profesor: auth.usuario.documentId,
          publishedAt: new Date().toISOString(),
        },
      }),
    });
    if (!creada.ok) {
      console.error("Strapi rechazó la creación de disponibilidad:", creada.status);
      return res.status(502).json({
        error:
          creada.status === 403
            ? "El token STRAPI_API_TOKEN no tiene permiso para crear disponibilidades en Strapi"
            : creada.body?.error?.message || "Strapi no pudo guardar el horario",
      });
    }

    res.status(201).json(creada.body);
  } catch (error) {
    console.error("Error al crear disponibilidad:", error);
    res.status(502).json({ error: "No se pudo guardar la disponibilidad" });
  }
});

router.put("/:documentId", async (req, res) => {
  try {
    const auth = await autenticar(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });
    if (auth.usuario?.tipo_usuario !== "profesor" || !auth.usuario.documentId) {
      return res.status(403).json({
        error: "Solo los profesores pueden modificar disponibilidades",
      });
    }

    const data = req.body ?? {};
    if (!datosHorarioValidos(data)) {
      return res.status(400).json({
        error: "La fecha y el rango horario no son válidos",
      });
    }

    const documentId = req.params.documentId;
    const actual = await obtenerDisponibilidad(documentId);
    if (actual.status === 404) {
      return res.status(404).json({ error: "No se encontró la disponibilidad" });
    }
    if (!actual.ok) {
      console.error("Strapi rechazó la consulta de disponibilidad:", actual.status);
      return res.status(502).json({ error: "No se pudo verificar el horario" });
    }
    if (
      obtenerIdDocumentoRelacion(actual.body?.data?.profesor) !==
      auth.usuario.documentId
    ) {
      return res.status(403).json({
        error: "Solo podés modificar tus propias disponibilidades",
      });
    }

    const validacion = await validarSinCruces(
      data,
      auth.usuario.documentId,
      documentId,
    );
    if (validacion.error) {
      return res.status(502).json({ error: validacion.error });
    }
    if (validacion.conflict) {
      return res.status(409).json({
        error: "El horario se superpone con otra disponibilidad",
      });
    }

    const actualizada = await strapi(
      `/disponibilidades/${encodeURIComponent(documentId)}`,
      {
        method: "PUT",
        body: JSON.stringify({
          data: {
            fecha: data.fecha,
            hora_inicio: normalizarHora(data.hora_inicio),
            hora_fin: normalizarHora(data.hora_fin),
          },
        }),
      },
    );
    if (!actualizada.ok) {
      console.error("Strapi rechazó la actualización de disponibilidad:", actualizada.status);
      return res.status(502).json({
        error:
          actualizada.status === 403
            ? "El token STRAPI_API_TOKEN no tiene permiso para actualizar disponibilidades en Strapi"
            : actualizada.body?.error?.message || "Strapi no pudo actualizar el horario",
      });
    }

    res.json(actualizada.body);
  } catch (error) {
    console.error("Error al actualizar disponibilidad:", error);
    res.status(502).json({ error: "No se pudo actualizar la disponibilidad" });
  }
});

router.delete("/:documentId", async (req, res) => {
  try {
    const auth = await autenticar(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    const disponibilidad = await obtenerDisponibilidad(req.params.documentId);
    if (disponibilidad.status === 404) {
      return res.status(404).json({ error: "El horario ya no está disponible" });
    }
    if (!disponibilidad.ok) {
      console.error("Strapi rechazó la consulta del horario:", disponibilidad.status);
      return res.status(502).json({ error: "No se pudo verificar el horario" });
    }

    const profesorId = obtenerIdDocumentoRelacion(
      disponibilidad.body?.data?.profesor,
    );
    if (!profesorId) {
      console.error("La disponibilidad consultada no tiene profesor asociado");
      return res.status(409).json({ error: "El horario no tiene un profesor válido" });
    }

    if (auth.usuario?.tipo_usuario === "profesor") {
      if (profesorId !== auth.usuario.documentId) {
        return res.status(403).json({
          error: "Solo podés eliminar tus propias disponibilidades",
        });
      }
    } else if (auth.usuario?.tipo_usuario === "alumno") {
      const { profesorId: profesorEsperado } = req.body ?? {};
      if (
        typeof profesorEsperado !== "string" ||
        profesorId !== profesorEsperado
      ) {
        return res.status(409).json({
          error: "El horario no pertenece al profesor seleccionado",
        });
      }
    } else {
      return res.status(403).json({ error: "No tenés permiso para borrar horarios" });
    }

    const eliminada = await strapi(
      `/disponibilidades/${encodeURIComponent(req.params.documentId)}`,
      { method: "DELETE" },
    );
    if (eliminada.status === 404) {
      return res.status(404).json({ error: "El horario ya no está disponible" });
    }
    if (!eliminada.ok) {
      console.error("Strapi rechazó la reserva del horario:", eliminada.status);
      return res.status(502).json({ error: "No se pudo reservar el horario" });
    }

    res.json({ mensaje: "Horario reservado y eliminado de las disponibilidades" });
  } catch (error) {
    console.error("Error al reservar disponibilidad:", error);
    res.status(502).json({ error: "No se pudo reservar el horario" });
  }
});

export default router;
