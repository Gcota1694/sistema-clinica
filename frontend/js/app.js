// frontend/js/app.js

// ============================================
// CARGAR DATOS AL INICIAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  cargarDashboard();
});

// ============================================
// FUNCIÓN PRINCIPAL DEL DASHBOARD
// ============================================
async function cargarDashboard() {
  mostrarLoading();
  
  try {
    // Cargar estadísticas
    await cargarEstadisticas();
    
    // Cargar citas de hoy
    await cargarCitasHoy();
    
  } catch (error) {
    mostrarError('Error al cargar el dashboard: ' + error.message);
  } finally {
    ocultarLoading();
  }
}

// ============================================
// CARGAR ESTADÍSTICAS
// ============================================
async function cargarEstadisticas() {
  // Total pacientes
  const resPacientes = await pacientesAPI.getAll();
  if (resPacientes.success) {
    document.getElementById('total-pacientes').textContent = 
      resPacientes.data.length;
  }
  
  // Total doctores
  const resDoctores = await doctoresAPI.getAll();
  if (resDoctores.success) {
    document.getElementById('total-doctores').textContent = 
      resDoctores.data.length;
  }
  
  // Citas de hoy y programadas
  const fechaHoy = getFechaHoy();
  const resCitas = await citasAPI.getAll({ fecha: fechaHoy });
  
  if (resCitas.success) {
    document.getElementById('citas-hoy').textContent = 
      resCitas.data.length;
  }
  
  // Total citas programadas
  const resTodasCitas = await citasAPI.getAll();
  if (resTodasCitas.success) {
    const programadas = resTodasCitas.data.filter(
      c => c.estado === 'programada'
    );
    document.getElementById('citas-programadas').textContent = 
      programadas.length;
  }
}

// ============================================
// CARGAR CITAS DE HOY
// ============================================
async function cargarCitasHoy() {
  const fechaHoy = getFechaHoy();
  const resCitas = await citasAPI.getAll({ fecha: fechaHoy });
  
  const container = document.getElementById('citas-hoy-container');
  const loadingEl = document.getElementById('loading-citas');
  const noCitasEl = document.getElementById('no-citas');
  
  if (!resCitas.success) {
    container.innerHTML = `
      <tr>
        <td colspan="5" class="text-center" style="padding: 2rem;">
          <div class="alert alert-error">
            ❌ Error al cargar las citas
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  const citas = resCitas.data;
  
  if (citas.length === 0) {
    // Ocultar tabla y mostrar mensaje
    document.getElementById('citas-hoy-table').classList.add('hidden');
    if (noCitasEl) noCitasEl.classList.remove('hidden');
    return;
  }
  
  // Mostrar tabla y ocultar mensaje
  document.getElementById('citas-hoy-table').classList.remove('hidden');
  if (noCitasEl) noCitasEl.classList.add('hidden');
  
  // Cargar nombres de pacientes y doctores
  const resPacientes = await pacientesAPI.getAll();
  const resDoctores = await doctoresAPI.getAll();
  
  const pacientes = resPacientes.success ? resPacientes.data : [];
  const doctores = resDoctores.success ? resDoctores.data : [];
  
  // Crear filas de la tabla con data-labels para responsive
  let html = '';
  
  citas.forEach(cita => {
    const paciente = pacientes.find(p => p.id === cita.pacienteId);
    const doctor = doctores.find(d => d.id === cita.doctorId);
    
    const estadoClass = cita.estado === 'programada' ? 'success' : 
                       cita.estado === 'cancelada' ? 'danger' : 
                       cita.estado === 'completada' ? 'info' : 'warning';
    
    html += `
      <tr>
        <td data-label="Hora"><strong>${cita.hora}</strong></td>
        <td data-label="Paciente">${paciente ? paciente.nombre : 'N/A'}</td>
        <td data-label="Doctor">${doctor ? doctor.nombre : 'N/A'}</td>
        <td data-label="Especialidad">${doctor ? doctor.especialidad : 'N/A'}</td>
        <td data-label="Estado">
          <span class="badge badge-${estadoClass}">
            ${cita.estado}
          </span>
        </td>
      </tr>
    `;
  });
  
  container.innerHTML = html;
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
  // Podrías agregar un sistema de notificaciones toast aquí
  alert(mensaje);
}