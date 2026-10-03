import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import themePlugin from "@fullcalendar/react/themes/classic";
import type { EventClickInfo } from "@fullcalendar/react";
import {
  listarHorariosDisponibles,
  reservarHorario,
} from "@/services/disponibilidad";
import { listarProfesores, type Profesor } from "@/services/resenas";
import type { CalendarEvent } from "./types";

const CalendarAlumno: React.FC = () => {
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [profesorId, setProfesorId] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingProfesores, setLoadingProfesores] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    listarProfesores()
      .then((items) => {
        if (!cancelado) setProfesores(items);
      })
      .catch((err: Error) => {
        if (!cancelado) setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setLoadingProfesores(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!profesorId) {
      setEvents([]);
      return;
    }

    let cancelado = false;
    setLoadingHorarios(true);
    setError(null);
    listarHorariosDisponibles(profesorId)
      .then((horarios) => {
        if (!cancelado) {
          setEvents(
            horarios.map((horario) => ({
              id: horario.documentId,
              title: `Disponible: ${horario.hora_inicio.slice(0, 5)} a ${horario.hora_fin.slice(0, 5)}`,
              start: horario.fecha,
              allDay: true,
              extendedProps: { calendar: "Success" },
            })),
          );
        }
      })
      .catch((err: Error) => {
        if (!cancelado) setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setLoadingHorarios(false);
      });

    return () => {
      cancelado = true;
    };
  }, [profesorId]);

  const handleEventClick = async (clickInfo: EventClickInfo) => {
    if (!profesorId || reservando) return;

    const confirmacion = window.confirm(
      `¿Deseás reservar la clase particular en el horario "${clickInfo.event.title}"?`,
    );
    if (!confirmacion) return;

    setReservando(true);
    setError(null);
    try {
      await reservarHorario(clickInfo.event.id, profesorId);
      setEvents((prev) =>
        prev.filter((event) => event.id !== clickInfo.event.id),
      );
      window.alert("¡Clase reservada con éxito!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo confirmar la reserva",
      );
    } finally {
      setReservando(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Seleccioná un horario disponible
        </h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Elegí un profesor y luego seleccioná un horario para reservar.
        </p>
        <label
          htmlFor="profesor-disponibilidades"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Profesor
        </label>
        <select
          id="profesor-disponibilidades"
          value={profesorId}
          onChange={(event) => setProfesorId(event.target.value)}
          disabled={loadingProfesores}
          className="h-11 w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="">
            {loadingProfesores ? "Cargando profesores..." : "Elegí un profesor"}
          </option>
          {profesores.map((profesor) => (
            <option key={profesor.id} value={profesor.id}>
              {profesor.username}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mb-4 text-sm text-error-500" role="alert">
          {error}
        </p>
      )}
      {!loadingProfesores && !error && profesores.length === 0 && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Todavía no hay profesores disponibles.
        </p>
      )}
      {loadingHorarios && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Cargando horarios disponibles...
        </p>
      )}
      {!loadingHorarios && profesorId && events.length === 0 && !error && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Este profesor no tiene horarios disponibles.
        </p>
      )}

      <FullCalendar
        plugins={[themePlugin, dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          start: "prev,next",
          center: "title",
          end: "",
        }}
        events={events}
        eventClick={handleEventClick}
        eventContent={(eventInfo) => (
          <div className="w-full cursor-pointer overflow-hidden rounded-md bg-emerald-500 p-1 text-xs font-medium text-white text-ellipsis whitespace-nowrap">
            {eventInfo.event.title}
          </div>
        )}
      />
      {reservando && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Confirmando reserva...
        </p>
      )}
    </div>
  );
};

export default CalendarAlumno;
