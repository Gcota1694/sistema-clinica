// frontend/js/doctores.js

let doctores = [];
let doctorEditando = null;

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  cargarDoctores();
  
  // Buscador
  document.getElementById('buscar-doctor')?.addEventListener('input', (e) => {
    filtrarDoctores();
  });
  
  // Filtro especialidad
  document.getElementById('filtro-especialidad')?.addEventListener('change', () => {
    filtrarDoctores();
  });
});

// ============================================
// CARGAR DOCTORES
// ============================================
async function cargarDoctores() {
  mostrarLoading();
  
  const res = await doctoresAPI.getAll();
  
  if (!res.success) {
    mostrarError('Error al cargar doctores: ' + res.error);
    ocultarLoading();
    return;
  }
  
  doctores = res.data;
  mostrarDoctores(doctores);
  cargarFiltroEspecialidades();
  ocultarLoading();
}

// ============================================
// CARGAR FILTRO DE ESPECIALIDADES
// ============================================
function cargarFiltroEspecialidades() {
  const select = document.getElementById('filtro-especialidad');
  if (!select) return;
  
  // Limpiar opciones existentes excepto la primera
  select.innerHTML = '<option value="">Todas las especialidades</option>';
  
  // Obtener especialidades únicas
  const especialidades = [...new Set(doctores.map(d => d.especialidad))];
  
  especialidades.forEach(esp => {
    const option = document.createElement('option');
    option.value = esp;
    option.textContent = esp;
    select.appendChild(option);
  });
}

// ============================================
// MOSTRAR DOCTORES EN TARJETAS
// ============================================
function mostrarDoctores(lista) {
  const container = document.getElementById('lista-doctores');
  
  if (!container) {
    console.error('No se encontró el contenedor lista-doctores');
    return;
  }
  
  if (lista.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👨‍⚕️</div>
        <h3 class="empty-state-title">No hay doctores</h3>
        <p class="empty-state-description">
          Comienza agregando tu primer doctor
        </p>
      </div>
    `;
    return;
  }
  
  // Crear grid de tarjetas
  let html = '<div class="cards-grid">';
  
  lista.forEach(doctor => {
    const horario = `${doctor.horarioInicio} - ${doctor.horarioFin}`;
    const dias = doctor.diasDisponibles ? doctor.diasDisponibles.join(', ') : 'N/A';
    
    html += `
      <div class="item-card">
        <div class="item-card-header">
          <span class="item-card-id">${doctor.id || 'N/A'}</span>
        </div>
        
        <div class="item-card-body">
          <div class="item-card-name">${doctor.nombre}</div>
          
          <div class="item-card-row">
            <span class="item-card-label">Especialidad</span>
            <span class="badge badge-primary">${doctor.especialidad}</span>
          </div>
          
          ${doctor.telefono ? `
          <div class="item-card-row">
            <span class="item-card-label">Teléfono</span>
            <span class="item-card-value">${doctor.telefono}</span>
          </div>
          ` : ''}
          
          ${doctor.email ? `
          <div class="item-card-row">
            <span class="item-card-label">Email</span>
            <span class="item-card-value" style="font-size: 0.875rem;">${doctor.email}</span>
          </div>
          ` : ''}
          
          <div class="item-card-row">
            <span class="item-card-label">Horario</span>
            <span class="item-card-value">${horario}</span>
          </div>
          
          <div class="item-card-row">
            <span class="item-card-label">Días</span>
            <span class="item-card-value" style="font-size: 0.875rem;">${dias}</span>
          </div>
        </div>
        
        <div class="item-card-actions">
          <button 
            class="btn btn-primary btn-sm" 
            onclick="verAgenda('${doctor.id}')"
            title="Ver agenda"
          >
            📋 Agenda
          </button>
          <button 
            class="btn btn-warning btn-sm" 
            onclick="editarDoctor('${doctor.id}')"
            title="Editar"
          >
            ✏️ Editar
          </button>
          <button 
            class="btn btn-danger btn-sm" 
            onclick="confirmarEliminarDoctor('${doctor.id}')"
            title="Eliminar"
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// ============================================
// FILTRAR DOCTORES
// ============================================
function filtrarDoctores() {
  const termino = document.getElementById('buscar-doctor')?.value.toLowerCase() || '';
  const especialidad = document.getElementById('filtro-especialidad')?.value || '';
  
  let filtrados = doctores;
  
  if (termino) {
    filtrados = filtrados.filter(d => 
      d.nombre.toLowerCase().includes(termino) ||
      d.especialidad.toLowerCase().includes(termino)
    );
  }
  
  if (especialidad) {
    filtrados = filtrados.filter(d => d.especialidad === especialidad);
  }
  
  mostrarDoctores(filtrados);
}

// ============================================
// MOSTRAR FORMULARIO
// ============================================
function mostrarFormularioDoctor(doctor = null) {
  doctorEditando = doctor;
  const modal = document.getElementById('modal-doctor');
  
  const titulo = doctor ? 'Editar Doctor' : 'Nuevo Doctor';
  
  // Checkboxes de días
  let checkboxesDias = '';
  diasSemana.forEach(dia => {
    const checked = doctor && doctor.diasDisponibles && doctor.diasDisponibles.includes(dia) ? 'checked' : '';
    checkboxesDias += `
      <label class="checkbox-label">
        <input type="checkbox" name="dias" value="${dia}" ${checked}>
        ${dia}
      </label>
    `;
  });
  
  modal.innerHTML = `
    <div class="loading-overlay" style="background: rgba(0,0,0,0.7);">
      <div class="card" style="width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto;">
        <div class="card-header flex-between">
          <h2 class="card-title">${titulo}</h2>
          <button class="btn btn-sm btn-secondary" onclick="cerrarModal()">✕</button>
        </div>
        
        <div class="card-body">
          <form id="form-doctor" onsubmit="guardarDoctor(event)">
            
            <div class="form-group">
              <label class="form-label required">Nombre Completo</label>
              <input 
                type="text" 
                id="nombre" 
                class="form-input"
                value="${doctor ? doctor.nombre : ''}"
                required
              >
              <div class="form-error">El nombre es obligatorio</div>
            </div>
            
            <div class="form-group">
              <label class="form-label required">Especialidad</label>
              <input 
                type="text" 
                id="especialidad" 
                class="form-input"
                value="${doctor ? doctor.especialidad : ''}"
                required
                list="especialidades-list"
              >
              <datalist id="especialidades-list">
                <option value="Cardiología">
                <option value="Neurología">
                <option value="Pediatría">
                <option value="Dermatología">
                <option value="Oftalmología">
                <option value="Traumatología">
                <option value="Ginecología">
                <option value="Medicina General">
              </datalist>
              <div class="form-error">La especialidad es obligatoria</div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <input 
                type="tel" 
                id="telefono" 
                class="form-input"
                value="${doctor && doctor.telefono ? doctor.telefono : ''}"
              >
            </div>
            
            <div class="form-group">
              <label class="form-label">Email</label>
              <input 
                type="email" 
                id="email" 
                class="form-input"
                value="${doctor && doctor.email ? doctor.email : ''}"
              >
            </div>
            
            <div class="form-group">
              <label class="form-label required">Horario de Inicio</label>
              <input 
                type="time" 
                id="horarioInicio" 
                class="form-input"
                value="${doctor ? doctor.horarioInicio : '08:00'}"
                required
              >
              <div class="form-error">Selecciona la hora de inicio</div>
            </div>
            
            <div class="form-group">
              <label class="form-label required">Horario de Fin</label>
              <input 
                type="time" 
                id="horarioFin" 
                class="form-input"
                value="${doctor ? doctor.horarioFin : '17:00'}"
                required
              >
              <div class="form-error">Selecciona la hora de fin</div>
            </div>
            
            <div class="form-group">
              <label class="form-label required">Días Disponibles</label>
              <div class="checkbox-group" id="dias-disponibles">
                ${checkboxesDias}
              </div>
              <div class="form-error" id="error-dias" style="display: none;">
                Selecciona al menos un día
              </div>
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
  
  // Validación de horarios
  const inicio = document.getElementById('horarioInicio');
  const fin = document.getElementById('horarioFin');
  
  fin.addEventListener('change', () => {
    if (inicio.value && fin.value && fin.value <= inicio.value) {
      fin.setCustomValidity('El horario de fin debe ser mayor al de inicio');
      fin.classList.add('error');
    } else {
      fin.setCustomValidity('');
      fin.classList.remove('error');
    }
  });
}

// ============================================
// GUARDAR DOCTOR
// ============================================
async function guardarDoctor(event) {
  event.preventDefault();
  
  const form = event.target;
  
  // Validar días seleccionados
  const diasChecked = Array.from(form.querySelectorAll('input[name="dias"]:checked'));
  const errorDias = document.getElementById('error-dias');
  
  if (diasChecked.length === 0) {
    errorDias.style.display = 'block';
    return;
  } else {
    errorDias.style.display = 'none';
  }
  
  // Validar formulario
  if (!form.checkValidity()) {
    form.querySelectorAll('.form-input').forEach(input => {
      if (!input.checkValidity()) {
        input.classList.add('error');
      }
    });
    return;
  }
  
  const datos = {
    nombre: document.getElementById('nombre').value.trim(),
    especialidad: document.getElementById('especialidad').value.trim(),
    telefono: document.getElementById('telefono')?.value.trim() || '',
    email: document.getElementById('email')?.value.trim() || '',
    horarioInicio: document.getElementById('horarioInicio').value,
    horarioFin: document.getElementById('horarioFin').value,
    diasDisponibles: diasChecked.map(cb => cb.value)
  };
  
  mostrarLoading();
  
  let res;
  if (doctorEditando) {
    // Actualizar
    res = await doctoresAPI.update(doctorEditando.id, datos);
  } else {
    // Crear
    res = await doctoresAPI.create(datos);
  }
  
  ocultarLoading();
  
  if (!res.success) {
    mostrarError(res.error);
    return;
  }
  
  mostrarExito(doctorEditando ? 'Doctor actualizado' : 'Doctor registrado correctamente');
  cerrarModal();
  cargarDoctores();
}

// ============================================
// EDITAR DOCTOR
// ============================================
function editarDoctor(id) {
  const doctor = doctores.find(d => d.id === id);
  if (doctor) {
    mostrarFormularioDoctor(doctor);
  }
}

// ============================================
// CONFIRMAR ELIMINAR DOCTOR
// ============================================
function confirmarEliminarDoctor(id) {
  const doctor = doctores.find(d => d.id === id);
  if (!doctor) return;
  
  if (confirm(`⚠️ ¿Estás seguro de eliminar al Dr(a). ${doctor.nombre}?\n\nEspecialidad: ${doctor.especialidad}\n\nEsta acción NO se puede deshacer.`)) {
    eliminarDoctor(id);
  }
}

// ============================================
// ELIMINAR DOCTOR
// ============================================
async function eliminarDoctor(id) {
  mostrarLoading();
  
  const res = await doctoresAPI.delete(id);
  
  ocultarLoading();
  
  if (!res.success) {
    mostrarError(res.error || 'Error al eliminar doctor');
    return;
  }
  
  mostrarExito('Doctor eliminado correctamente');
  cargarDoctores();
}

// ============================================
// VER AGENDA
// ============================================
async function verAgenda(doctorId) {
  const doctor = doctores.find(d => d.id === doctorId);
  if (!doctor) return;
  
  mostrarLoading();
  
  const res = await citasAPI.getByDoctor(doctorId);
  
  ocultarLoading();
  
  const modal = document.getElementById('modal-agenda');
  
  let html = `
    <div class="loading-overlay" style="background: rgba(0,0,0,0.7);">
      <div class="card" style="width: 90%; max-width: 900px; max-height: 90vh; overflow-y: auto;">
        <div class="card-header flex-between">
          <div>
            <h2 class="card-title">Agenda de ${doctor.nombre}</h2>
            <p style="color: var(--text-light);">${doctor.especialidad}</p>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="cerrarModalAgenda()">✕</button>
        </div>
        
        <div class="card-body">
          <div style="margin-bottom: 1rem; padding: 1rem; background: var(--bg-light); border-radius: var(--radius);">
            <p><strong>Horario:</strong> ${doctor.horarioInicio} - ${doctor.horarioFin}</p>
            <p><strong>Días:</strong> ${doctor.diasDisponibles ? doctor.diasDisponibles.join(', ') : 'N/A'}</p>
          </div>
  `;
  
  if (!res.success || res.data.length === 0) {
    html += `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <h3 class="empty-state-title">Sin citas</h3>
        <p class="empty-state-description">
          Este doctor no tiene citas agendadas
        </p>
      </div>
    `;
  } else {
    // Cargar pacientes
    const resPacientes = await pacientesAPI.getAll();
    const pacientes = resPacientes.success ? resPacientes.data : [];
    
    // Agrupar por estado
    const programadas = res.data.filter(c => c.estado === 'programada');
    const canceladas = res.data.filter(c => c.estado === 'cancelada');
    
    html += `
      <div style="margin-bottom: 1rem;">
        <span class="badge badge-success" style="margin-right: 0.5rem;">
          ${programadas.length} Programadas
        </span>
        <span class="badge badge-danger">
          ${canceladas.length} Canceladas
        </span>
      </div>
      
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Motivo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Ordenar por fecha y hora
    const citasOrdenadas = res.data.sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
      return a.hora.localeCompare(b.hora);
    });
    
    citasOrdenadas.forEach(cita => {
      const paciente = pacientes.find(p => p.id === cita.pacienteId);
      const estadoClass = cita.estado === 'programada' ? 'success' : 'danger';
      
      html += `
        <tr>
          <td>${formatearFecha(cita.fecha)}</td>
          <td><strong>${cita.hora}</strong></td>
          <td>${paciente ? paciente.nombre : 'N/A'}</td>
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
  document.getElementById('modal-doctor').style.display = 'none';
  doctorEditando = null;
}

function cerrarModalAgenda() {
  document.getElementById('modal-agenda').style.display = 'none';
}