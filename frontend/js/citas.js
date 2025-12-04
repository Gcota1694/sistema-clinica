let citas = [];
let pacientes = [];
let doctores = [];

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  await cargarDatos();
  cargarFiltroDoctores();
  
  // Filtros
  document.getElementById('filtro-fecha')?.addEventListener('change', filtrarCitas);
  document.getElementById('filtro-estado')?.addEventListener('change', filtrarCitas);
  document.getElementById('filtro-doctor')?.addEventListener('change', filtrarCitas);
});

// ============================================
// CARGAR DATOS
// ============================================
async function cargarDatos() {
  mostrarLoading();
  
  // Cargar todo en paralelo
  const [resCitas, resPacientes, resDoctores] = await Promise.all([
    citasAPI.getAll(),
    pacientesAPI.getAll(),
    doctoresAPI.getAll()
  ]);
  
  if (resCitas.success) citas = resCitas.data;
  if (resPacientes.success) pacientes = resPacientes.data;
  if (resDoctores.success) doctores = resDoctores.data;
  
  mostrarCitas(citas);
  ocultarLoading();
}

// ============================================
// CARGAR FILTRO DOCTORES
// ============================================
function cargarFiltroDoctores() {
  const select = document.getElementById('filtro-doctor');
  if (!select) return;
  
  doctores.forEach(doctor => {
    const option = document.createElement('option');
    option.value = doctor.id;
    option.textContent = `${doctor.nombre} - ${doctor.especialidad}`;
    select.appendChild(option);
  });
}

// ============================================
// MOSTRAR CITAS
// ============================================
function mostrarCitas(lista) {
  const container = document.getElementById('lista-citas');
  
  if (lista.length === 0) {
    container.innerHTML = `
      <div class="card">
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <h3 class="empty-state-title">No hay citas</h3>
          <p class="empty-state-description">
            Comienza agendando la primera cita
          </p>
          <button class="btn btn-primary" onclick="mostrarFormularioCita()">
            ➕ Agendar Cita
          </button>
        </div>
      </div>
    `;
    return;
  }
  
  // Ordenar por fecha y hora (más recientes primero)
  const citasOrdenadas = [...lista].sort((a, b) => {
    if (a.fecha !== b.fecha) return b.fecha.localeCompare(a.fecha);
    return b.hora.localeCompare(a.hora);
  });
  
  let html = `
    <div class="card">
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Doctor</th>
              <th>Especialidad</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  citasOrdenadas.forEach(cita => {
    const paciente = pacientes.find(p => p.id === cita.pacienteId);
    const doctor = doctores.find(d => d.id === cita.doctorId);
    
    const estadoClass = cita.estado === 'programada' ? 'success' : 'danger';
    
    html += `
      <tr>
        <td><strong>${cita.id}</strong></td>
        <td>${formatearFecha(cita.fecha)}</td>
        <td><strong>${cita.hora}</strong></td>
        <td>${paciente ? paciente.nombre : 'N/A'}</td>
        <td>${doctor ? doctor.nombre : 'N/A'}</td>
        <td>${doctor ? doctor.especialidad : 'N/A'}</td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${cita.motivo}
        </td>
        <td>
          <span class="badge badge-${estadoClass}">
            ${cita.estado}
          </span>
        </td>
        <td>
          <div class="flex gap-1">
            <button 
              class="btn btn-sm btn-primary" 
              onclick="verDetalleCita('${cita.id}')"
              title="Ver detalles"
            >
              👁️
            </button>
            ${cita.estado === 'programada' ? `
              <button 
                class="btn btn-sm btn-danger" 
                onclick="confirmarCancelarCita('${cita.id}')"
                title="Cancelar"
              >
                ❌
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  });
  
  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

// ============================================
// FILTRAR CITAS
// ============================================
function filtrarCitas() {
  const fecha = document.getElementById('filtro-fecha')?.value || '';
  const estado = document.getElementById('filtro-estado')?.value || '';
  const doctorId = document.getElementById('filtro-doctor')?.value || '';
  
  let filtradas = citas;
  
  if (fecha) {
    filtradas = filtradas.filter(c => c.fecha === fecha);
  }
  
  if (estado) {
    filtradas = filtradas.filter(c => c.estado === estado);
  }
  
  if (doctorId) {
    filtradas = filtradas.filter(c => c.doctorId === doctorId);
  }
  
  mostrarCitas(filtradas);
}

// ============================================
// MOSTRAR FORMULARIO CITA
// ============================================
function mostrarFormularioCita() {
  const modal = document.getElementById('modal-cita');
  
  // Opciones de pacientes
  let opcionesPacientes = '<option value="">Selecciona un paciente</option>';
  pacientes.forEach(p => {
    opcionesPacientes += `<option value="${p.id}">${p.nombre}</option>`;
  });
  
  // Especialidades únicas
  const especialidades = [...new Set(doctores.map(d => d.especialidad))];
  let opcionesEspecialidades = '<option value="">Selecciona especialidad</option>';
  especialidades.forEach(esp => {
    opcionesEspecialidades += `<option value="${esp}">${esp}</option>`;
  });
  
  modal.innerHTML = `
    <div class="loading-overlay" style="background: rgba(0,0,0,0.7);">
      <div class="card" style="width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto;">
        <div class="card-header flex-between">
          <h2 class="card-title">Agendar Nueva Cita</h2>
          <button class="btn btn-sm btn-secondary" onclick="cerrarModal()">✕</button>
        </div>
        
        <div class="card-body">
          <form id="form-cita" onsubmit="guardarCita(event)">
            
            <div class="form-group">
              <label class="form-label required">Paciente</label>
              <select id="pacienteId" class="form-control" required>
                ${opcionesPacientes}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label required">Especialidad</label>
              <select id="especialidad" class="form-control" required onchange="filtrarDoctoresPorEspecialidad()">
                ${opcionesEspecialidades}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label required">Doctor</label>
              <select id="doctorId" class="form-control" required disabled>
                <option value="">Primero selecciona especialidad</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label required">Fecha</label>
              <input 
                type="date" 
                id="fecha" 
                class="form-control" 
                required
                min="${new Date().toISOString().split('T')[0]}"
              >
            </div>

            <div class="form-group">
              <label class="form-label required">Hora</label>
              <input 
                type="time" 
                id="hora" 
                class="form-control" 
                required
                min="08:00"
                max="20:00"
              >
              <small class="form-text">Horario de atención: 8:00 AM - 8:00 PM</small>
            </div>

            <div class="form-group">
              <label class="form-label required">Motivo de consulta</label>
              <textarea 
                id="motivo" 
                class="form-control" 
                rows="3" 
                required
                placeholder="Describe brevemente el motivo de la consulta"
              ></textarea>
            </div>

            <div class="flex gap-2 justify-end">
              <button type="button" class="btn btn-secondary" onclick="cerrarModal()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                ✅ Agendar Cita
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  
  modal.style.display = 'flex';
}

// ============================================
// FILTRAR DOCTORES POR ESPECIALIDAD
// ============================================
function filtrarDoctoresPorEspecialidad() {
  const especialidad = document.getElementById('especialidad').value;
  const selectDoctor = document.getElementById('doctorId');
  
  if (!especialidad) {
    selectDoctor.innerHTML = '<option value="">Primero selecciona especialidad</option>';
    selectDoctor.disabled = true;
    return;
  }
  
  const doctoresFiltrados = doctores.filter(d => d.especialidad === especialidad);
  
  let opciones = '<option value="">Selecciona un doctor</option>';
  doctoresFiltrados.forEach(d => {
    opciones += `<option value="${d.id}">${d.nombre}</option>`;
  });
  
  selectDoctor.innerHTML = opciones;
  selectDoctor.disabled = false;
}

// ============================================
// GUARDAR CITA
// ============================================
async function guardarCita(event) {
  event.preventDefault();
  
  const datos = {
    pacienteId: document.getElementById('pacienteId').value,
    doctorId: document.getElementById('doctorId').value,
    fecha: document.getElementById('fecha').value,
    hora: document.getElementById('hora').value,
    motivo: document.getElementById('motivo').value,
    estado: 'programada'
  };
  
  mostrarLoading();
  
  const resultado = await citasAPI.create(datos);
  
  ocultarLoading();
  
  if (resultado.success) {
    mostrarExito('Cita agendada exitosamente');
    cerrarModal();
    await cargarDatos();
  } else {
    mostrarError(resultado.error || 'Error al agendar cita');
  }
}

// ============================================
// VER DETALLE CITA
// ============================================
function verDetalleCita(id) {
  const cita = citas.find(c => c.id === id);
  if (!cita) return;
  
  const paciente = pacientes.find(p => p.id === cita.pacienteId);
  const doctor = doctores.find(d => d.id === cita.doctorId);
  
  const modal = document.getElementById('modal-cita');
  
  modal.innerHTML = `
    <div class="loading-overlay" style="background: rgba(0,0,0,0.7);">
      <div class="card" style="width: 90%; max-width: 600px;">
        <div class="card-header flex-between">
          <h2 class="card-title">Detalle de Cita #${cita.id}</h2>
          <button class="btn btn-sm btn-secondary" onclick="cerrarModal()">✕</button>
        </div>
        
        <div class="card-body">
          <div class="detail-grid">
            <div class="detail-item">
              <strong>📅 Fecha:</strong>
              <span>${formatearFecha(cita.fecha)}</span>
            </div>
            
            <div class="detail-item">
              <strong>🕐 Hora:</strong>
              <span>${cita.hora}</span>
            </div>
            
            <div class="detail-item">
              <strong>👤 Paciente:</strong>
              <span>${paciente ? paciente.nombre : 'N/A'}</span>
            </div>
            
            <div class="detail-item">
              <strong>👨‍⚕️ Doctor:</strong>
              <span>${doctor ? doctor.nombre : 'N/A'}</span>
            </div>
            
            <div class="detail-item">
              <strong>🏥 Especialidad:</strong>
              <span>${doctor ? doctor.especialidad : 'N/A'}</span>
            </div>
            
            <div class="detail-item">
              <strong>📝 Estado:</strong>
              <span class="badge badge-${cita.estado === 'programada' ? 'success' : 'danger'}">
                ${cita.estado}
              </span>
            </div>
            
            <div class="detail-item" style="grid-column: 1 / -1;">
              <strong>📋 Motivo:</strong>
              <p style="margin-top: 0.5rem; line-height: 1.6;">${cita.motivo}</p>
            </div>
          </div>
          
          <div class="flex gap-2 justify-end" style="margin-top: 1.5rem;">
            ${cita.estado === 'programada' ? `
              <button class="btn btn-danger" onclick="confirmarCancelarCita('${cita.id}')">
                ❌ Cancelar Cita
              </button>
            ` : ''}
            <button class="btn btn-secondary" onclick="cerrarModal()">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  modal.style.display = 'flex';
}

// ============================================
// CONFIRMAR CANCELAR CITA
// ============================================
function confirmarCancelarCita(id) {
  const cita = citas.find(c => c.id === id);
  if (!cita) return;
  
  const paciente = pacientes.find(p => p.id === cita.pacienteId);
  
  if (confirm(`¿Estás seguro de cancelar la cita de ${paciente?.nombre} el ${formatearFecha(cita.fecha)} a las ${cita.hora}?`)) {
    cancelarCita(id);
  }
}

// ============================================
// CANCELAR CITA - ✅ CORREGIDO
// ============================================
async function cancelarCita(id) {
  mostrarLoading();
  
  // ✅ CORRECCIÓN: Usar citasAPI.cancelar() en lugar de citasAPI.update()
  const resultado = await citasAPI.cancelar(id);
  
  ocultarLoading();
  
  if (resultado.success) {
    mostrarExito('Cita cancelada exitosamente');
    cerrarModal();
    await cargarDatos();
  } else {
    mostrarError(resultado.error || 'Error al cancelar cita');
  }
}

// ============================================
// CERRAR MODAL
// ============================================
function cerrarModal() {
  const modal = document.getElementById('modal-cita');
  modal.style.display = 'none';
  modal.innerHTML = '';
}

// ============================================
// FORMATEAR FECHA
// ============================================
function formatearFecha(fecha) {
  const [year, month, day] = fecha.split('-');
  return `${day}/${month}/${year}`;
}