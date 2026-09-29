import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("cargando...");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) =>
        setStatus(data.db === "connected" ? "conectado ✅" : "sin conexión ❌")
      )
      .catch(() => setStatus("no se pudo contactar al backend ❌"));
  }, []);

  return (
    <div className="app">
      <h1>TP2 · CMS y Frameworks Web</h1>
      <p>
        Backend (Express): <strong>{status}</strong>
      </p>
      <p className="hint">
        Este texto viene de <code>GET /api/health</code>, que a su vez
        consulta la base de datos Postgres.
      </p>
    </div>
  );
}

export default App;
