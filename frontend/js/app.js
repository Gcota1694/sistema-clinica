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
  
  if (!resCitas.success) {
    container.innerHTML = `
      <div class="empty-state">
        <p>❌ Error al cargar las citas</p>
      </div>
    `;
    return;
  }
  
  const citas = resCitas.data;
  
  if (citas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <h3 class="empty-state-title">No hay citas para hoy</h3>
        <p class="empty-state-description">
          No tienes citas programadas para el día de hoy
        </p>
      </div>
    `;
    return;
  }
  
  // Cargar nombres de pacientes y doctores
  const resPacientes = await pacientesAPI.getAll();
  const resDoctores = await doctoresAPI.getAll();
  
  const pacientes = resPacientes.success ? resPacientes.data : [];
  const doctores = resDoctores.success ? resDoctores.data : [];
  
  // Crear tabla
  let html = `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Paciente</th>
            <th>Doctor</th>
            <th>Motivo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  citas.forEach(cita => {
    const paciente = pacientes.find(p => p.id === cita.pacienteId);
    const doctor = doctores.find(d => d.id === cita.doctorId);
    
    const estadoClass = cita.estado === 'programada' ? 'success' : 
                       cita.estado === 'cancelada' ? 'danger' : 'info';
    
    html += `
      <tr>
        <td><strong>${cita.hora}</strong></td>
        <td>${paciente ? paciente.nombre : 'N/A'}</td>
        <td>${doctor ? doctor.nombre : 'N/A'}</td>
        <td>${cita.motivo}</td>
        <td>
          <span class="badge badge-${estadoClass}">
            ${cita.estado}
          </span>
        </td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = html;
}
