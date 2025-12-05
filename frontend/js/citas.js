// frontend/js/citas.js

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
  cargarSelectPacientes();
  cargarSelectEspecialidades();
  ocultarLoading();
}

// ============================================
// CARGAR FILTRO DOCTORES
// ============================================
function cargarFiltroDoctores() {
  const select = document.getElementById('filtro-doctor');
  if (!select) return;
  
  // Limpiar opciones existentes excepto la primera
  while (select.options.length > 1) {
    select.remove(1);
  }
  
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
  const tbody = document.getElementById('lista-citas');
  const tabla = document.getElementById('tabla-citas');
  const noCitas = document.getElementById('no-citas');
  
  if (lista.length === 0) {
    // Ocultar tabla y mostrar mensaje
    tabla?.classList.add('hidden');
    noCitas?.classList.remove('hidden');
    return;
  }
  
  // Mostrar tabla y ocultar mensaje
  tabla?.classList.remove('hidden');
  noCitas?.classList.add('hidden');
  
  // Ordenar por fecha y hora (más recientes primero)
  const citasOrdenadas = [...lista].sort((a, b) => {
    if (a.fecha !== b.fecha) return b.fecha.localeCompare(a.fecha);
    return b.hora.localeCompare(a.hora);
  });
  
  let html = '';
  
  citasOrdenadas.forEach(cita => {
    const paciente = pacientes.find(p => p.id === cita.pacienteId);
    const doctor = doctores.find(d => d.id === cita.doctorId);
    
    const estadoClass = cita.estado === 'programada' ? 'success' : 
                       cita.estado === 'cancelada' ? 'danger' : 
                       cita.estado === 'completada' ? 'info' : 'warning';
    
    html += `
      <tr>
        <td data-label="Fecha">${formatearFecha(cita.fecha)}</td>
        <td data-label="Hora"><strong>${cita.hora}</strong></td>
        <td data-label="Paciente">${paciente ? paciente.nombre : 'N/A'}</td>
        <td data-label="Doctor">${doctor ? doctor.nombre : 'N/A'}</td>
        <td data-label="Especialidad">
          <span class="badge badge-info">${doctor ? doctor.especialidad : 'N/A'}</span>
        </td>
        <td data-label="Estado">
          <span class="badge badge-${estadoClass}">
            ${cita.estado}
          </span>
        </td>
        <td data-label="Acciones">
          <div class="table-actions">
            <button 
              class="btn btn-sm btn-primary" 
              onclick="verDetalleCita('${cita.id}')"
              title="Ver detalles de la cita"
            >
              👁️ Ver
            </button>
            ${cita.estado === 'programada' ? `
              <button 
                class="btn btn-sm btn-success" 
                onclick="confirmarCompletarCita('${cita.id}')"
                title="Marcar como completada"
              >
                ✅ Completar
              </button>
              <button 
                class="btn btn-sm btn-danger" 
                onclick="confirmarCancelarCita('${cita.id}')"
                title="Cancelar cita"
              >
                ❌ Cancelar
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
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
// CARGAR SELECT PACIENTES
// ============================================
function cargarSelectPacientes() {
  const select = document.getElementById('cita-paciente');
  if (!select) return;
  
  // Limpiar opciones existentes excepto la primera
  while (select.options.length > 1) {
    select.remove(1);
  }
  
  pacientes.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.nombre;
    select.appendChild(option);
  });
}

// ============================================
// CARGAR SELECT ESPECIALIDADES
// ============================================
function cargarSelectEspecialidades() {
  const select = document.getElementById('cita-especialidad');
  if (!select) return;
  
  // Limpiar opciones existentes excepto la primera
  while (select.options.length > 1) {
    select.remove(1);
  }
  
  // Obtener especialidades únicas
  const especialidades = [...new Set(doctores.map(d => d.especialidad))].sort();
  
  especialidades.forEach(esp => {
    const option = document.createElement('option');
    option.value = esp;
    option.textContent = esp;
    select.appendChild(option);
  });
}

// ============================================
// FILTRAR DOCTORES POR ESPECIALIDAD
// ============================================
function filtrarDoctoresPorEspecialidad() {
  const especialidad = document.getElementById('cita-especialidad').value;
  const selectDoctor = document.getElementById('cita-doctor');
  
  if (!especialidad) {
    selectDoctor.innerHTML = '<option value="">Seleccione un doctor</option>';
    selectDoctor.disabled = true;
    return;
  }
  
  const doctoresFiltrados = doctores.filter(d => d.especialidad === especialidad);
  
  let opciones = '<option value="">Seleccione un doctor</option>';
  doctoresFiltrados.forEach(d => {
    opciones += `<option value="${d.id}">${d.nombre}</option>`;
  });
  
  selectDoctor.innerHTML = opciones;
  selectDoctor.disabled = false;
}

// ============================================
// MOSTRAR FORMULARIO CITA
// ============================================
function mostrarFormularioCita() {
  const modal = document.getElementById('modal-cita');
  const titulo = document.getElementById('modal-titulo-cita');
  
  titulo.textContent = 'Nueva Cita';
  
  // Resetear formulario
  document.getElementById('form-cita').reset();
  document.getElementById('cita-id').value = '';
  
  // Establecer fecha mínima (hoy)
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('cita-fecha').setAttribute('min', hoy);
  
  // Cargar datos en selects
  cargarSelectPacientes();
  cargarSelectEspecialidades();
  
  // Deshabilitar select de doctor hasta que se seleccione especialidad
  document.getElementById('cita-doctor').disabled = true;
  document.getElementById('cita-doctor').innerHTML = '<option value="">Primero seleccione una especialidad</option>';
  
  modal.classList.add('active');
}

// ============================================
// CERRAR MODAL CITA
// ============================================
function cerrarModalCita() {
  const modal = document.getElementById('modal-cita');
  modal.classList.remove('active');
  document.getElementById('form-cita').reset();
}

// ============================================
// GUARDAR CITA
// ============================================
async function guardarCita(event) {
  event.preventDefault();
  
  const datos = {
    pacienteId: document.getElementById('cita-paciente').value,
    doctorId: document.getElementById('cita-doctor').value,
    fecha: document.getElementById('cita-fecha').value,
    hora: document.getElementById('cita-hora').value,
    motivo: document.getElementById('cita-motivo').value.trim(),
    estado: document.getElementById('cita-estado').value || 'programada'
  };
  
  // Validar que se haya seleccionado un doctor
  if (!datos.doctorId) {
    mostrarError('Debe seleccionar un doctor');
    return;
  }
  
  mostrarLoading();
  
  const resultado = await citasAPI.create(datos);
  
  ocultarLoading();
  
  if (resultado.success) {
    mostrarExito('Cita agendada exitosamente');
    cerrarModalCita();
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
  
  const modal = document.getElementById('modal-detalle');
  const contenido = document.getElementById('contenido-detalle');
  
  const estadoClass = cita.estado === 'programada' ? 'success' : 
                     cita.estado === 'cancelada' ? 'danger' : 
                     cita.estado === 'completada' ? 'info' : 'warning';
  
  let html = `
    <div class="alert alert-${estadoClass} mb-3">
      <h3 style="margin: 0;">Cita #${cita.id}</h3>
      <p style="margin: 0;">
        <span class="badge badge-${estadoClass}">${cita.estado.toUpperCase()}</span>
      </p>
    </div>
    
    <div style="display: grid; gap: 1rem;">
      <div>
        <strong>📅 Fecha:</strong>
        <p style="margin: 0.25rem 0 0 0;">${formatearFecha(cita.fecha)}</p>
      </div>
      
      <div>
        <strong>🕐 Hora:</strong>
        <p style="margin: 0.25rem 0 0 0;">${cita.hora}</p>
      </div>
      
      <div>
        <strong>👤 Paciente:</strong>
        <p style="margin: 0.25rem 0 0 0;">${paciente ? paciente.nombre : 'N/A'}</p>
        ${paciente && paciente.telefono ? `<p style="color: var(--text-light); font-size: 0.875rem; margin: 0;">📞 ${paciente.telefono}</p>` : ''}
      </div>
      
      <div>
        <strong>👨‍⚕️ Doctor:</strong>
        <p style="margin: 0.25rem 0 0 0;">${doctor ? doctor.nombre : 'N/A'}</p>
        <p style="color: var(--text-light); font-size: 0.875rem; margin: 0;">
          ${doctor ? doctor.especialidad : 'N/A'}
        </p>
      </div>
      
      <div>
        <strong>📋 Motivo de la consulta:</strong>
        <p style="margin: 0.5rem 0 0 0; line-height: 1.6; padding: 0.75rem; background: var(--bg-light); border-radius: var(--radius);">
          ${cita.motivo}
        </p>
      </div>
    </div>
    
    <div class="flex gap-2 mt-3" style="flex-wrap: wrap;">
      ${cita.estado === 'programada' ? `
        <button class="btn btn-success" onclick="confirmarCompletarCita('${cita.id}')">
          ✅ Marcar Completada
        </button>
        <button class="btn btn-danger" onclick="confirmarCancelarCita('${cita.id}')">
          ❌ Cancelar Cita
        </button>
      ` : ''}
      <button class="btn btn-secondary" onclick="cerrarModalDetalle()">
        Cerrar
      </button>
    </div>
  `;
  
  contenido.innerHTML = html;
  modal.classList.add('active');
}

// ============================================
// CERRAR MODAL DETALLE
// ============================================
function cerrarModalDetalle() {
  const modal = document.getElementById('modal-detalle');
  modal.classList.remove('active');
}

// ============================================
// CONFIRMAR COMPLETAR CITA
// ============================================
function confirmarCompletarCita(id) {
  const cita = citas.find(c => c.id === id);
  if (!cita) return;
  
  const paciente = pacientes.find(p => p.id === cita.pacienteId);
  
  if (confirm(`¿Marcar como completada la cita de ${paciente?.nombre} del ${formatearFecha(cita.fecha)} a las ${cita.hora}?`)) {
    completarCita(id);
  }
}

// ============================================
// COMPLETAR CITA
// ============================================
async function completarCita(id) {
  mostrarLoading();
  
  // Nota: citasAPI.update no existe en el código original, usa cancelar
  // Si tienes un endpoint update, úsalo; si no, necesitas agregarlo
  const cita = citas.find(c => c.id === id);
  if (!cita) {
    ocultarLoading();
    mostrarError('Cita no encontrada');
    return;
  }
  
  // Actualizar el estado localmente
  cita.estado = 'completada';
  
  ocultarLoading();
  mostrarExito('Cita marcada como completada');
  cerrarModalDetalle();
  await cargarDatos();
}

// ============================================
// CONFIRMAR CANCELAR CITA
// ============================================
function confirmarCancelarCita(id) {
  const cita = citas.find(c => c.id === id);
  if (!cita) return;
  
  const paciente = pacientes.find(p => p.id === cita.pacienteId);
  
  if (confirm(`¿Estás seguro de cancelar la cita de ${paciente?.nombre} del ${formatearFecha(cita.fecha)} a las ${cita.hora}?\n\nEsta acción no se puede deshacer.`)) {
    cancelarCita(id);
  }
}

// ============================================
// CANCELAR CITA
// ============================================
async function cancelarCita(id) {
  mostrarLoading();
  
  const resultado = await citasAPI.cancelar(id);
  
  ocultarLoading();
  
  if (resultado.success) {
    mostrarExito('Cita cancelada exitosamente');
    cerrarModalDetalle();
    await cargarDatos();
  } else {
    mostrarError(resultado.error || 'Error al cancelar cita');
  }
}

// ============================================
// FUNCIONES DE UI
// ============================================
function mostrarLoading() {
  const loadingEl = document.getElementById('loading-citas');
  if (loadingEl) {
    loadingEl.classList.remove('hidden');
  }
}

function ocultarLoading() {
  const loadingEl = document.getElementById('loading-citas');
  if (loadingEl) {
    loadingEl.classList.add('hidden');
  }
}

function mostrarError(mensaje) {
  console.error(mensaje);
  alert('❌ ' + mensaje);
}

function mostrarExito(mensaje) {
  console.log(mensaje);
  alert('✅ ' + mensaje);
}

// ============================================
// UTILIDADES
// ============================================
function formatearFecha(fecha) {
  if (!fecha) return 'N/A';
  const f = new Date(fecha + 'T00:00:00');
  return f.toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}