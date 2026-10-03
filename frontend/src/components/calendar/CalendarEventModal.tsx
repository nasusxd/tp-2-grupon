import { Modal } from "@/components/ui/modal";
import React, { useEffect, useState } from "react";
import type { CalendarEvent, EventFormData } from "./types";

export interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: CalendarEvent | null;
  initialStartDate?: string;
  initialEndDate?: string;
  error?: string | null;
  onSave: (data: EventFormData) => void;
  onDelete: (documentId: string) => void;
}

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  selectedEvent,
  initialStartDate = "",
  error,
  onSave,
  onDelete,
}) => {
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFin, setHoraFin] = useState("09:00");
  const [fecha, setFecha] = useState("");

  useEffect(() => {
    if (selectedEvent) {
      const tituloStr = typeof selectedEvent.title === "string" ? selectedEvent.title : "";
      const deconstruirTitulo = tituloStr.replace("Disponible: ", "").split(" a ");
      
      setHoraInicio(deconstruirTitulo[0]?.slice(0, 5) || "08:00");
      setHoraFin(deconstruirTitulo[1]?.slice(0, 5) || "09:00");

      if (selectedEvent.start instanceof Date) {
        setFecha(selectedEvent.start.toISOString().split("T")[0]);
      } else if (typeof selectedEvent.start === "string") {
        setFecha(selectedEvent.start.split("T")[0]);
      } else {
        setFecha("");
      }
    } else {
      setHoraInicio("08:00");
      setHoraFin("09:00");
      setFecha(initialStartDate);
    }
  }, [selectedEvent, initialStartDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (horaInicio >= horaFin) {
      alert("La hora de inicio debe ser menor que la hora de fin.");
      return;
    }
    onSave({
      title: horaInicio,
      start: fecha,
      end: horaFin,
      level: "Success",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-140 p-4 sm:p-6 lg:p-8"
    >
      <form onSubmit={handleSubmit} className="flex flex-col space-y-6 px-1">
        <div>
          <h5 className="modal-title mb-2 text-theme-xl font-semibold text-gray-800 lg:text-2xl dark:text-white/90">
            {selectedEvent ? "Modificar Disponibilidad" : "Cargar Disponibilidad Horaria"}
          </h5>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Definir los horarios en los que vas a estar disponible para dictar clases particulares.
          </p>
        </div>

        <div className="space-y-5">
          {error && (
            <p className="text-sm text-error-500" role="alert">
              {error}
            </p>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Fecha Seleccionada
            </label>
            <input
              type="date"
              value={fecha}
              disabled
              className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900/50"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="hora-inicio" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Hora de Inicio
              </label>
              <input
                id="hora-inicio"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              />
            </div>

            {/* Campo Hora de Fin */}
            <div>
              <label htmlFor="hora-fin" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Hora de Fin
              </label>
              <input
                id="hora-fin"
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              />
            </div>
          </div>
        </div>

        {/* Botonera inferior */}
        <div className="modal-footer mt-4 flex items-center gap-3 sm:justify-end">
          {selectedEvent && (
            <button
              onClick={() => {
                if (window.confirm("¿Querés eliminar esta disponibilidad?")) {
                  onDelete(selectedEvent.id);
                }
              }}
              type="button"
              className="flex w-full justify-center rounded-lg border border-error-500 px-4 py-2.5 text-sm font-medium text-error-500 hover:bg-error-50 sm:me-auto sm:w-auto dark:hover:bg-error-500/10"
            >
              Eliminar
            </button>
          )}
          <button
            onClick={onClose}
            type="button"
            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            {selectedEvent ? "Actualizar Horario" : "Confirmar Disponibilidad"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CalendarEventModal;