import { Route, BrowserRouter as Router, Routes } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import CrearResena from "./pages/Resenas/CrearResena";
export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Layout principal (con sidebar/header) */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Calendar />} />
            <Route path="/profesores/:profesorId/resenar" element={<CrearResena />} />
            {/* Perfil: acá va a vivir el listado de reseñas del profesor */}
            <Route path="/profile" element={<UserProfiles />} />

            {/* Disponibilidad: calendario para gestionar/ver horarios */}
            <Route path="/calendar" element={<Calendar />} />
          </Route>

          {/* Login y registro */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Ruta no encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}