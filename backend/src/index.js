import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRouter from "./routes/health.js";
import resenasRouter from "./routes/resenas.js";  
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
  
app.use("/api", healthRouter);
app.use("/api", resenasRouter);
app.get("/", (_req, res) => {
  res.json({ message: "API de TP2 corriendo 🚀" });
});

app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
});
