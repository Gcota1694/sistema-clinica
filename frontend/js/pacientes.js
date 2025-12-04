// frontend/js/pacientes.js

let pacientes = [];
let pacienteEditando = null;

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  cargarPacientes();
  
  // Buscador
  document.getElementById('buscar-paciente')?.addEventListener('input', (e) => {
    filtrarPacientes(e.target.value);
  });
});

// ============================================
// CARGAR PACIENTES
// ============================================
async function cargarPacientes() {
  mostrarLoading();
  
  const res = await pacientesAPI.getAll();
  
  if (!res.success) {
    mostrarError('Error al cargar pacientes: ' + res.error);
    ocultarLoading();
    return;
  }
  
  pacientes = res.data;
  mostrarPacientes(pacientes);
  ocultarLoading();
}

// ============================================
// MOSTRAR PACIENTES
// ============================================
function mostrarPacientes(lista) {
  const tbody = document.getElementById('lista-pacientes');
  const tabla = document.getElementById('tabla-pacientes');
  const noPacientes = document.getElementById('no-pacientes');
  
  if (lista.length === 0) {
    // Ocultar tabla y mostrar mensaje
    tabla?.classList.add('hidden');
    noPacientes?.classList.remove('hidden');
    return;
  }
  
  // Mostrar tabla y ocultar mensaje
  tabla?.classList.remove('hidden');
  noPacientes?.classList.add('hidden');
  
  let html = '';
  
  lista.forEach(paciente => {
    html += `
      <tr>
        <td data-label="ID"><strong>${paciente.id}</strong></td>
        <td data-label="Nombre">${paciente.nombre}</td>
        <td data-label="Edad">${paciente.edad} años</td>
        <td data-label="Teléfono">${paciente.telefono}</td>
        <td data-label="Email">${paciente.email || 'N/A'}</td>
        <td data-label="Acciones">
          <div class="table-actions">
            <button 
              class="btn btn-sm btn-primary" 
              onclick="verHistorial('${paciente.id}')"
              title="Ver historial de citas"
            >
              📋 Historial
            </button>
            <button 
              class="btn btn-sm btn-warning" 
              onclick="editarPaciente('${paciente.id}')"
              title="Editar paciente"
            >
              ✏️ Editar
            </button>
            <button 
              class="btn btn-sm btn-danger" 
              onclick="confirmarEliminarPaciente('${paciente.id}')"
              title="Eliminar paciente"
            >
              🗑️ Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
}

// ============================================
// FILTRAR PACIENTES
// ============================================
function filtrarPacientes(termino) {
  const filtrados = pacientes.filter(p => 
    p.nombre.toLowerCase().includes(termino.toLowerCase()) ||
    p.id.toLowerCase().includes(termino.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(termino.toLowerCase())) ||
    p.telefono.includes(termino)
  );
  
  mostrarPacientes(filtrados);
}

// ============================================
// MOSTRAR FORMULARIO
// ============================================
function mostrarFormularioPaciente(paciente = null) {
  pacienteEditando = paciente;
  const modal = document.getElementById('modal-paciente');
  const titulo = document.getElementById('modal-titulo');
  
  titulo.textContent = paciente ? 'Editar Paciente' : 'Nuevo Paciente';
  
  // Llenar el formulario si es edición
  if (paciente) {
    document.getElementById('paciente-id').value = paciente.id;
    document.getElementById('paciente-nombre').value = paciente.nombre;
    document.getElementById('paciente-edad').value = paciente.edad;
    document.getElementById('paciente-telefono').value = paciente.telefono;
    document.getElementById('paciente-email').value = paciente.email || '';
    document.getElementById('paciente-direccion').value = paciente.direccion || '';
    document.getElementById('paciente-historial').value = paciente.historialMedico || '';
  } else {
    document.getElementById('form-paciente').reset();
    document.getElementById('paciente-id').value = '';
  }
  
  modal.classList.add('active');
}

// ============================================
// CERRAR MODAL PACIENTE
// ============================================
function cerrarModalPaciente() {
  const modal = document.getElementById('modal-paciente');
  modal.classList.remove('active');
  document.getElementById('form-paciente').reset();
  pacienteEditando = null;
}

// ============================================
// GUARDAR PACIENTE
// ============================================
async function guardarPaciente(event) {
  event.preventDefault();
  
  const datos = {
    nombre: document.getElementById('paciente-nombre').value.trim(),
    edad: parseInt(document.getElementById('paciente-edad').value),
    telefono: document.getElementById('paciente-telefono').value.trim(),
    email: document.getElementById('paciente-email').value.trim() || null,
    direccion: document.getElementById('paciente-direccion').value.trim() || null,
    historialMedico: document.getElementById('paciente-historial').value.trim() || null
  };
  
  mostrarLoading();
  
  let res;
  if (pacienteEditando) {
    // Actualizar
    res = await pacientesAPI.update(pacienteEditando.id, datos);
  } else {
    // Crear
    res = await pacientesAPI.create(datos);
  }
  
  ocultarLoading();
  
  if (!res.success) {
    mostrarError(res.error);
    return;
  }
  
  mostrarExito(pacienteEditando ? 'Paciente actualizado correctamente' : 'Paciente registrado correctamente');
  cerrarModalPaciente();
  cargarPacientes();
}

// ============================================
// EDITAR PACIENTE
// ============================================
function editarPaciente(id) {
  const paciente = pacientes.find(p => p.id === id);
  if (paciente) {
    mostrarFormularioPaciente(paciente);
  }
}

// ============================================
// CONFIRMAR ELIMINAR PACIENTE
// ============================================
function confirmarEliminarPaciente(id) {
  const paciente = pacientes.find(p => p.id === id);
  if (!paciente) return;
  
  if (confirm(`¿Estás seguro de eliminar al paciente "${paciente.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
    eliminarPaciente(id);
  }
}

// ============================================
// ELIMINAR PACIENTE
// ============================================
async function eliminarPaciente(id) {
  mostrarLoading();
  
  const res = await pacientesAPI.delete(id);
  
  ocultarLoading();
  
  if (!res.success) {
    mostrarError('Error al eliminar paciente: ' + res.error);
    return;
  }
  
  mostrarExito('Paciente eliminado correctamente');
  cargarPacientes();
}

// ============================================
// VER HISTORIAL
// ============================================
async function verHistorial(pacienteId) {
  const paciente = pacientes.find(p => p.id === pacienteId);
  if (!paciente) return;
  
  mostrarLoading();
  
  const res = await pacientesAPI.getHistorial(pacienteId);
  
  ocultarLoading();
  
  const modal = document.getElementById('modal-historial');
  const contenido = document.getElementById('contenido-historial');
  
  let html = `
    <div class="mb-3">
      <h3>${paciente.nombre}</h3>
      <p class="text-muted">
        ${paciente.telefono} | ${paciente.email || 'Sin email'}
      </p>
    </div>
  `;
  
  if (!res.success || res.data.length === 0) {
    html += `
      <div class="text-center" style="padding: 2rem;">
        <div style="font-size: 3rem;">📋</div>
        <h3>Sin historial de citas</h3>
        <p class="text-muted">
          Este paciente no tiene citas registradas
        </p>
      </div>
    `;
  } else {
    // Cargar doctores para mostrar nombres
    const resDoctores = await doctoresAPI.getAll();
    const doctores = resDoctores.success ? resDoctores.data : [];
    
    html += `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Doctor</th>
              <th>Especialidad</th>
              <th>Motivo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    res.data.forEach(cita => {
      const doctor = doctores.find(d => d.id === cita.doctorId);
      const estadoClass = cita.estado === 'programada' ? 'success' : 
                         cita.estado === 'cancelada' ? 'danger' : 
                         cita.estado === 'completada' ? 'info' : 'warning';
      
      html += `
        <tr>
          <td data-label="Fecha">${formatearFecha(cita.fecha)}</td>
          <td data-label="Hora"><strong>${cita.hora}</strong></td>
          <td data-label="Doctor">${doctor ? doctor.nombre : 'N/A'}</td>
          <td data-label="Especialidad">${doctor ? doctor.especialidad : 'N/A'}</td>
          <td data-label="Motivo">${cita.motivo}</td>
          <td data-label="Estado">
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
  }
  
  contenido.innerHTML = html;
  modal.classList.add('active');
}

// ============================================
// CERRAR MODAL HISTORIAL
// ============================================
function cerrarModalHistorial() {
  const modal = document.getElementById('modal-historial');
  modal.classList.remove('active');
}

// ============================================
// FUNCIONES DE UI
// ============================================
function mostrarLoading() {
  const loadingEl = document.getElementById('loading-pacientes');
  if (loadingEl) {
    loadingEl.classList.remove('hidden');
  }
}

function ocultarLoading() {
  const loadingEl = document.getElementById('loading-pacientes');
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