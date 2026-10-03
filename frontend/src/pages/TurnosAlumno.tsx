import CalendarAlumno from "@/components/calendar/CalendarAlumno";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

export default function TurnosAlumno() {
  return (
    <div>
      <PageMeta
        title="Reserva de Clases | Alumno"
        description="Pantalla de reserva de clases particulares para alumnos"
      />
      <PageBreadcrumb pageTitle="Reserva de Clases Particulares" />
      <CalendarAlumno />
    </div>
  );
}