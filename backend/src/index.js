import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRouter from "./routes/health.js";
import disponibilidadRouter from "./routes/disponibilidad.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api", healthRouter);
app.use("/api/disponibilidades", disponibilidadRouter);

app.get("/", (_req, res) => {
  res.json({ message: "API de TP2 corriendo 🚀" });
});

app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
});
