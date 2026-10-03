import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import themePlugin from "@fullcalendar/react/themes/classic";
import type { CalendarEvent } from "./types";
import type { EventClickInfo } from "@fullcalendar/react";

const CalendarAlumno: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const obtenerHorarios = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/disponibilidades?profesorId=1");
        const data = await res.json();
        if (res.ok && data.horariosDisponibles) {
          const horariosFormateados = data.horariosDisponibles.map((dispo: any) => ({
            id: dispo.id || String(Math.random()),
            title: `Disponible: ${dispo.hora_inicio} a ${dispo.hora_fin}`,
            start: dispo.fecha,
            extendedProps: { calendar: "Success" }
          }));
          setEvents(horariosFormateados);
        }
      } catch (error) {
        console.error("Error al conectar con el backend:", error);
      } finally {
        setLoading(false);
      }
    };
    obtenerHorarios();
  }, []);

    const handleEventClick = async (clickInfo: EventClickInfo) => {
    const confirmacion = window.confirm(
      `¿Deseás reservar la clase particular en el horario "${clickInfo.event.title}"?`
    );

    if (confirmacion) {
      try {
        const res = await fetch(`http://localhost:4000/api/disponibilidades/${clickInfo.event.id}`, {
          method: "DELETE"
        });

        if (res.ok) {
          setEvents((prev) => prev.filter((ev) => ev.id !== clickInfo.event.id));
          alert("¡Clase reservada con éxito!");
        } else {
          alert("No se pudo procesar la reserva en el servidor.");
        }
      } catch (error) {
        console.error(error);
        alert("Hubo un problema al intentar confirmar tu reserva.");
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Cargando horarios disponibles del backend...</div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Seleccioná un Horario Disponible</h3>
        <p className="text-sm text-gray-500">Hacé clic sobre cualquiera de los bloques verdes para reservar tu clase particular.</p>
      </div>
      
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
          <div className="cursor-pointer p-1 text-xs font-medium bg-emerald-500 text-white rounded-md w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {eventInfo.event.title}
          </div>
        )}
      />
    </div>
  );
};

export default CalendarAlumno;