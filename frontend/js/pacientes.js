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
  const container = document.getElementById('lista-pacientes');
  
  if (lista.length === 0) {
    container.innerHTML = `
      <div class="card">
        <div class="empty-state">
          <div class="empty-state-icon">👥</div>
          <h3 class="empty-state-title">No hay pacientes</h3>
          <p class="empty-state-description">
            Comienza agregando tu primer paciente
          </p>
          <button class="btn btn-primary" onclick="mostrarFormularioPaciente()">
            ➕ Agregar Paciente
          </button>
        </div>
      </div>
    `;
    return;
  }
  
  let html = `
    <div class="card">
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Edad</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  lista.forEach(paciente => {
    html += `
      <tr>
        <td><strong>${paciente.id}</strong></td>
        <td>${paciente.nombre}</td>
        <td>${paciente.edad} años</td>
        <td>${paciente.telefono}</td>
        <td>${paciente.email}</td>
        <td>${formatearFecha(paciente.fechaRegistro)}</td>
        <td>
          <div class="flex gap-1">
            <button 
              class="btn btn-sm btn-primary" 
              onclick="verHistorial('${paciente.id}')"
              title="Ver historial"
            >
              📋
            </button>
            <button 
              class="btn btn-sm btn-secondary" 
              onclick="editarPaciente('${paciente.id}')"
              title="Editar"
            >
              ✏️
            </button>
            <button 
              class="btn btn-sm btn-danger" 
              onclick="confirmarEliminarPaciente('${paciente.id}')"
              title="Eliminar"
            >
              🗑️
            </button>
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
// FILTRAR PACIENTES
// ============================================
function filtrarPacientes(termino) {
  const filtrados = pacientes.filter(p => 
    p.nombre.toLowerCase().includes(termino.toLowerCase()) ||
    p.id.toLowerCase().includes(termino.toLowerCase()) ||
    p.email.toLowerCase().includes(termino.toLowerCase())
  );
  
  mostrarPacientes(filtrados);
}

// ============================================
// MOSTRAR FORMULARIO
// ============================================
function mostrarFormularioPaciente(paciente = null) {
  pacienteEditando = paciente;
  const modal = document.getElementById('modal-paciente');
  
  const titulo = paciente ? 'Editar Paciente' : 'Nuevo Paciente';
  
  modal.innerHTML = `
    <div class="loading-overlay" style="background: rgba(0,0,0,0.7);">
      <div class="card" style="width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto;">
        <div class="card-header flex-between">
          <h2 class="card-title">${titulo}</h2>
          <button class="btn btn-sm btn-secondary" onclick="cerrarModal()">✕</button>
        </div>
        
        <div class="card-body">
          <form id="form-paciente" onsubmit="guardarPaciente(event)">
            
            <div class="form-group">
              <label class="form-label required">Nombre Completo</label>
              <input 
                type="text" 
                id="nombre" 
                class="form-input"
                value="${paciente ? paciente.nombre : ''}"
                required
              >
              <div class="form-error">El nombre es obligatorio</div>
            </div>
            
            <div class="form-group">
              <label class="form-label required">Edad</label>
              <input 
                type="number" 
                id="edad" 
                class="form-input"
                value="${paciente ? paciente.edad : ''}"
                min="1"
                max="120"
                required
              >
              <div class="form-error">Ingresa una edad válida (1-120)</div>
            </div>
            
            <div class="form-group">
              <label class="form-label required">Teléfono</label>
              <input 
                type="tel" 
                id="telefono" 
                class="form-input"
                value="${paciente ? paciente.telefono : ''}"
                pattern="[0-9]{10,15}"
                required
              >
              <div class="form-error">El teléfono debe tener 10-15 dígitos</div>
            </div>
            
            <div class="form-group">
              <label class="form-label required">Email</label>
              <input 
                type="email" 
                id="email" 
                class="form-input"
                value="${paciente ? paciente.email : ''}"
                required
              >
              <div class="form-error">Ingresa un email válido</div>
            </div>
            
            <div class="flex gap-1 mt-2">
              <button type="submit" class="btn btn-primary">
                💾 Guardar
              </button>
              <button type="button" class="btn btn-secondary" onclick="cerrarModal()">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  
  modal.style.display = 'block';
  
  // Validación en tiempo real
  agregarValidacionTiempoReal();
}

// ============================================
// VALIDACIÓN EN TIEMPO REAL
// ============================================
function agregarValidacionTiempoReal() {
  const inputs = document.querySelectorAll('.form-input');
  
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (!this.checkValidity()) {
        this.classList.add('error');
      } else {
        this.classList.remove('error');
      }
    });
    
    input.addEventListener('input', function() {
      if (this.classList.contains('error') && this.checkValidity()) {
        this.classList.remove('error');
      }
    });
  });
}

// ============================================
// GUARDAR PACIENTE
// ============================================
async function guardarPaciente(event) {
  event.preventDefault();
  
  const form = event.target;
  
  // Validar formulario
  if (!form.checkValidity()) {
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
      if (!input.checkValidity()) {
        input.classList.add('error');
      }
    });
    return;
  }
  
  const datos = {
    nombre: document.getElementById('nombre').value.trim(),
    edad: parseInt(document.getElementById('edad').value),
    telefono: document.getElementById('telefono').value.trim(),
    email: document.getElementById('email').value.trim().toLowerCase()
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
  
  mostrarExito(pacienteEditando ? 'Paciente actualizado' : 'Paciente registrado');
  cerrarModal();
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
  
  if (confirm(`⚠️ ¿Estás seguro de eliminar a ${paciente.nombre}?\n\nEsta acción NO se puede deshacer.`)) {
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
    mostrarError(res.error || 'Error al eliminar paciente');
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
  
  let html = `
    <div class="loading-overlay" style="background: rgba(0,0,0,0.7);">
      <div class="card" style="width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto;">
        <div class="card-header flex-between">
          <div>
            <h2 class="card-title">Historial de ${paciente.nombre}</h2>
            <p class="text-muted">${paciente.email}</p>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="cerrarModalHistorial()">✕</button>
        </div>
        
        <div class="card-body">
  `;
  
  if (!res.success || res.data.length === 0) {
    html += `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3 class="empty-state-title">Sin historial</h3>
        <p class="empty-state-description">
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
        <table class="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Doctor</th>
              <th>Motivo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    res.data.forEach(cita => {
      const doctor = doctores.find(d => d.id === cita.doctorId);
      const estadoClass = cita.estado === 'programada' ? 'success' : 
                         cita.estado === 'cancelada' ? 'danger' : 'info';
      
      html += `
        <tr>
          <td>${formatearFecha(cita.fecha)}</td>
          <td><strong>${cita.hora}</strong></td>
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
  }
  
  html += `
        </div>
      </div>
    </div>
  `;
  
  modal.innerHTML = html;
  modal.style.display = 'block';
}

// ============================================
// CERRAR MODALES
// ============================================
function cerrarModal() {
  document.getElementById('modal-paciente').style.display = 'none';
  pacienteEditando = null;
}

function cerrarModalHistorial() {
  document.getElementById('modal-historial').style.display = 'none';
}