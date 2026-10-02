import { Router } from 'express';
import { pool } from '../db.js'; 
const router = Router();

router.get('/', async (req, res) => {
  try {
    const { profesorId, fecha } = req.query;
    if (!profesorId) {
      return res.status(400).json({ 
        error: 'Faltan parámetros requeridos: profesorId' 
      });
    }
    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
    let strapiUrl = `${STRAPI_URL}/api/disponibilidades?populate=*`;
    if (fecha) {
      strapiUrl += `&filters[fecha][$eq]=${fecha}`;
    }
    const strapiResponse = await fetch(strapiUrl);
    if (!strapiResponse.ok) {
      throw new Error(`Error al consultar Strapi: ${strapiResponse.statusText}`);
    }
    const strapiData = await strapiResponse.json();
    const disponibilidadesCargadas = strapiData.data || [];

    const clasesOcupadas = [];
    const horariosDisponibles = disponibilidadesCargadas.filter(dispo => {
      const inicioDispo = dispo.hora_inicio; 
      const finDispo = dispo.hora_fin;

      const estaOcupado = clasesOcupadas.some(clase => {
        return clase.hora_inicio === inicioDispo && clase.hora_fin === finDispo;
      });
      return !estaOcupado; 
    });

    const resultadoFinal = horariosDisponibles.map(dispo => ({
      id: dispo.id,
      documentId: dispo.documentId,
      fecha: dispo.fecha,
      hora_inicio: dispo.hora_inicio,
      hora_fin: dispo.hora_fin
    }));

    return res.json({
      profesorId,
      fecha: fecha || 'todas',
      horariosDisponibles: resultadoFinal
    });

  } catch (error) {
    console.error('Error en el endpoint de disponibilidad:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { profesorId, fecha, hora_inicio, hora_fin } = req.body;
    if (!profesorId || !fecha || !hora_inicio || !hora_fin) {
      return res.status(400).json({ error: 'Faltan campos requeridos en el body' });
    }
    const query = `
      INSERT INTO disponibilidades (fecha, hora_inicio, hora_fin, created_at, updated_at, published_at)
      VALUES ($1, $2, $3, NOW(), NOW(), NOW())
      RETURNING id;
    `;
    const { rows } = await pool.query(query, [fecha, hora_inicio, hora_fin]);
    return res.status(201).json({
      mensaje: 'Disponibilidad creada con éxito en Docker',
      id: rows[0].id
    });

  } catch (error) {
    console.error('Error al guardar en Express:', error);
    return res.status(500).json({ error: 'Error interno al insertar los datos' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `DELETE FROM disponibilidades WHERE id = $1`;
    await pool.query(query, [id]);
    return res.json({ mensaje: 'Horario reservado y removido de las disponibilidades' });
  } catch (error) {
    console.error('Error al eliminar disponibilidad:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;