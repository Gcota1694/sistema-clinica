// server.js
// Importar módulos
const express = require('express');
const path = require('path');
const { leerJSON, escribirJSON } = require('./utils/fileManager');

// Crear aplicación
const app = express();
const PORT = 3000;

// Permitir que el servidor lea JSON y servir frontend
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Ruta principal → index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Función para validar campos obligatorios
function validarCampos(body, camposRequeridos) {
  return camposRequeridos.filter(campo => {
    // tratar arrays vacíos como faltantes
    if (Array.isArray(body[campo])) return body[campo].length === 0;
    return !body[campo] && body[campo] !== 0;
  });
}

// Normalizar ids: acepta "1" -> "P001" o "D001", pasa `P001` tal cual
function normalizarId(tipo, valor) {
  if (!valor && valor !== 0) return valor;
  const str = String(valor);
  // si ya inicia con P/D/C lo devolvemos tal cual (mayúscula)
  if (/^[PDC]\d+/i.test(str)) {
    return str.toUpperCase();
  }
  // si es numérico, lo rellenamos y añadimos prefijo
  const num = str.replace(/\D/g, '');
  return `${tipo}${String(num).padStart(3, '0')}`;
}

// Rutas de los archivos JSON
const rutaPacientes = path.join(__dirname, 'data', 'pacientes.json');
const rutaDoctores = path.join(__dirname, 'data', 'doctores.json');
const rutaCitas = path.join(__dirname, 'data', 'citas.json');

/* ============================
      RUTAS PACIENTES
============================ */

// Listar todos los pacientes
app.get("/pacientes", (req, res) => {
  return res.json(leerJSON(rutaPacientes));
});

// Obtener paciente por ID
app.get("/pacientes/:id", (req, res) => {
  const id = normalizarId('P', req.params.id);
  const pacientes = leerJSON(rutaPacientes);
  const paciente = pacientes.find(p => p.id === id);
  if (!paciente) return res.status(404).json({ error: "Paciente no encontrado" });
  res.json(paciente);
});

// Registrar nuevo paciente
app.post("/pacientes", (req, res) => {
  const camposRequeridos = ["nombre", "edad", "telefono", "email"];
  const faltantes = validarCampos(req.body, camposRequeridos);

  if (faltantes.length > 0) {
    return res.status(400).json({ error: "Faltan campos obligatorios", faltantes });
  }

  const { nombre, edad, telefono, email } = req.body;
  const pacientes = leerJSON(rutaPacientes);

  if (pacientes.find(p => p.email.toLowerCase() === String(email).toLowerCase()))
    return res.status(400).json({ error: "El email ya está registrado" });

  const nuevo = {
    id: `P${String(pacientes.length + 1).padStart(3, "0")}`,
    nombre,
    edad,
    telefono,
    email,
    fechaRegistro: new Date().toISOString().split("T")[0]
  };

  pacientes.push(nuevo);
  escribirJSON(rutaPacientes, pacientes);

  res.status(201).json({ mensaje: "Paciente agregado", paciente: nuevo });
});

// Actualizar paciente
app.put("/pacientes/:id", (req, res) => {
  const camposRequeridos = ["nombre", "edad", "telefono", "email"];
  const faltantes = validarCampos(req.body, camposRequeridos);

  if (faltantes.length > 0) {
    return res.status(400).json({ error: "Faltan campos obligatorios", faltantes });
  }

  const pacientes = leerJSON(rutaPacientes);
  const id = normalizarId('P', req.params.id);
  const i = pacientes.findIndex(p => p.id === id);
  if (i === -1) return res.status(404).json({ error: "Paciente no encontrado" });

  // proteger que no se duplique email con otro paciente
  const existeEmail = pacientes.find(p => p.email.toLowerCase() === String(req.body.email).toLowerCase() && p.id !== id);
  if (existeEmail) return res.status(400).json({ error: "El email ya está registrado por otro paciente" });

  pacientes[i] = { ...pacientes[i], ...req.body };
  escribirJSON(rutaPacientes, pacientes);
  res.json({ mensaje: "Paciente actualizado", paciente: pacientes[i] });
});

// Eliminar paciente (opcional)
app.delete("/pacientes/:id", (req, res) => {
  const pacientes = leerJSON(rutaPacientes);
  const id = normalizarId('P', req.params.id);
  const i = pacientes.findIndex(p => p.id === id);
  if (i === -1) return res.status(404).json({ error: "Paciente no encontrado" });
  const eliminado = pacientes.splice(i, 1)[0];
  escribirJSON(rutaPacientes, pacientes);
  res.json({ mensaje: "Paciente eliminado", paciente: eliminado });
});

// Historial de citas del paciente
app.get("/pacientes/:id/historial", (req, res) => {
  const id = normalizarId('P', req.params.id);
  const citas = leerJSON(rutaCitas).filter(c => c.pacienteId === id);
  if (citas.length === 0) return res.status(404).json({ error: "Sin historial de citas" });
  res.json(citas);
});

/* ============================
      RUTAS DOCTORES
============================ */

// Listar doctores 
app.get("/doctores", (req, res) => {
  return res.json(leerJSON(rutaDoctores));
});

// Obtener doctor por ID
app.get("/doctores/:id", (req, res) => {
  const id = normalizarId('D', req.params.id);
  const doctores = leerJSON(rutaDoctores);
  const doctor = doctores.find(d => d.id === id);
  if (!doctor) return res.status(404).json({ error: "Doctor no encontrado" });
  res.json(doctor);
});

// Registrar nuevo doctor
app.post("/doctores", (req, res) => {
  const camposRequeridos = ["nombre", "especialidad", "horarioInicio", "horarioFin", "diasDisponibles"];
  const faltantes = validarCampos(req.body, camposRequeridos);

  if (faltantes.length > 0) {
    return res.status(400).json({ error: "Faltan campos obligatorios", faltantes });
  }

  const { nombre, especialidad, horarioInicio, horarioFin, diasDisponibles } = req.body;
  const doctores = leerJSON(rutaDoctores);

  if (doctores.find(d => d.nombre === nombre && d.especialidad === especialidad))
    return res.status(400).json({ error: "Ya existe un doctor con ese nombre y especialidad" });

  const nuevo = {
    id: `D${String(doctores.length + 1).padStart(3, "0")}`,
    nombre,
    especialidad,
    horarioInicio,
    horarioFin,
    diasDisponibles
  };

  doctores.push(nuevo);
  escribirJSON(rutaDoctores, doctores);

  res.status(201).json({ mensaje: "Doctor agregado", doctor: nuevo });
});

// Actualizar doctor
app.put("/doctores/:id", (req, res) => {
  const camposRequeridos = ["nombre", "especialidad", "horarioInicio", "horarioFin", "diasDisponibles"];
  const faltantes = validarCampos(req.body, camposRequeridos);
  if (faltantes.length > 0) return res.status(400).json({ error: "Faltan campos obligatorios", faltantes });

  const doctores = leerJSON(rutaDoctores);
  const id = normalizarId('D', req.params.id);
  const i = doctores.findIndex(d => d.id === id);
  if (i === -1) return res.status(404).json({ error: "Doctor no encontrado" });

  // evitar duplicados por nombre+especialidad
  const exists = doctores.find(d => d.nombre === req.body.nombre && d.especialidad === req.body.especialidad && d.id !== id);
  if (exists) return res.status(400).json({ error: "Ya existe otro doctor con ese nombre y especialidad" });

  doctores[i] = { ...doctores[i], ...req.body };
  escribirJSON(rutaDoctores, doctores);
  res.json({ mensaje: "Doctor actualizado", doctor: doctores[i] });
});

// Eliminar doctor (opcional)
app.delete("/doctores/:id", (req, res) => {
  const doctores = leerJSON(rutaDoctores);
  const id = normalizarId('D', req.params.id);
  const i = doctores.findIndex(d => d.id === id);
  if (i === -1) return res.status(404).json({ error: "Doctor no encontrado" });
  const eliminado = doctores.splice(i, 1)[0];
  escribirJSON(rutaDoctores, doctores);
  res.json({ mensaje: "Doctor eliminado", doctor: eliminado });
});

// Buscar doctores por especialidad
app.get("/doctores/especialidad/:especialidad", (req, res) => {
  const doctores = leerJSON(rutaDoctores);
  const filtro = doctores.filter(d =>
    d.especialidad.toLowerCase() === req.params.especialidad.toLowerCase()
  );
  res.json(filtro);
});

/* ============================
          RUTAS CITAS
============================ */

// Listar citas
app.get("/citas", (req, res) => {
  const citas = leerJSON(rutaCitas);
  const { fecha, estado } = req.query;

  let filtradas = citas;
  if (fecha) filtradas = filtradas.filter(c => c.fecha === fecha);
  if (estado) filtradas = filtradas.filter(c => c.estado === estado);

  res.json(filtradas);
});

// Obtener cita por ID
app.get("/citas/:id", (req, res) => {
  const id = normalizarId('C', req.params.id);
  const cita = leerJSON(rutaCitas).find(c => c.id === id);
  if (!cita) return res.status(404).json({ error: "Cita no encontrada" });
  res.json(cita);
});

// Agendar nueva cita
app.post("/citas", (req, res) => {
  const camposRequeridos = ["pacienteId", "doctorId", "fecha", "hora", "motivo"];
  const faltantes = validarCampos(req.body, camposRequeridos);

  if (faltantes.length > 0) {
    return res.status(400).json({ error: "Faltan campos obligatorios", faltantes });
  }

  let { pacienteId, doctorId, fecha, hora, motivo } = req.body;

  // Normalizar IDs si vienen como números
  pacienteId = normalizarId('P', pacienteId);
  doctorId = normalizarId('D', doctorId);

  const pacientes = leerJSON(rutaPacientes);
  const doctores = leerJSON(rutaDoctores);
  const citas = leerJSON(rutaCitas);

  const paciente = pacientes.find(p => p.id === pacienteId);
  const doctor = doctores.find(d => d.id === doctorId);

  if (!paciente) return res.status(400).json({ error: "Paciente no existe" });
  if (!doctor) return res.status(400).json({ error: "Doctor no existe" });

  // Validar día disponible
  const diaSemana = new Date(fecha).toLocaleDateString("es-ES", { weekday: "long" });
  const diaFormateado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

  if (!doctor.diasDisponibles.includes(diaFormateado))
    return res.status(400).json({ error: "Doctor no atiende ese día" });

  // Validar hora dentro de rango
  const hi = parseInt(doctor.horarioInicio.replace(":", ""));
  const hf = parseInt(doctor.horarioFin.replace(":", ""));
  const horaNum = parseInt(hora.replace(":", ""));
  if (horaNum < hi || horaNum > hf)
    return res.status(400).json({ error: "Hora fuera del horario del doctor" });

  // Validar conflicto de citas
  if (citas.find(c => c.doctorId === doctorId && c.fecha === fecha && c.hora === hora))
    return res.status(400).json({ error: "El doctor ya tiene una cita en ese horario" });

  const nueva = {
    id: `C${String(citas.length + 1).padStart(3, "0")}`,
    pacienteId,
    doctorId,
    fecha,
    hora,
    motivo,
    estado: "programada"
  };

  citas.push(nueva);
  escribirJSON(rutaCitas, citas);

  res.status(201).json({ mensaje: "Cita agendada", cita: nueva });
});

// Cancelar cita
app.put("/citas/:id/cancelar", (req, res) => {
  const citas = leerJSON(rutaCitas);
  const id = normalizarId('C', req.params.id);
  const i = citas.findIndex(c => c.id === id);

  if (i === -1) return res.status(404).json({ error: "Cita no encontrada" });
  if (citas[i].estado !== "programada")
    return res.status(400).json({ error: "Solo se pueden cancelar citas programadas" });

  citas[i].estado = "cancelada";
  escribirJSON(rutaCitas, citas);

  res.json({ mensaje: "Cita cancelada", cita: citas[i] });
});

// Agenda de un doctor
app.get("/citas/doctor/:doctorId", (req, res) => {
  const doctorId = normalizarId('D', req.params.doctorId);
  const citas = leerJSON(rutaCitas).filter(c => c.doctorId === doctorId);
  res.json(citas);
});

/* ============================
       RUTAS ADICIONALES / STATS
============================ */

app.get('/estadisticas/doctores', (req, res) => {
  const doctores = leerJSON(rutaDoctores);
  // ejemplo simple: cantidad por especialidad
  const porEspecialidad = doctores.reduce((acc, d) => {
    acc[d.especialidad] = (acc[d.especialidad] || 0) + 1;
    return acc;
  }, {});
  res.json({ total: doctores.length, porEspecialidad });
});

// Iniciar servidor 
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});