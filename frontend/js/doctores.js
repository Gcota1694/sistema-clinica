// frontend/js/doctores.js

let doctores = [];
let doctorEditando = null;

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  cargarDoctores();
  
  // Buscador
  document.getElementById('buscar-doctor')?.addEventListener('input', () => {
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
// MOSTRAR DOCTORES
// ============================================
function mostrarDoctores(lista) {
  const tbody = document.getElementById('lista-doctores');
  const tabla = document.getElementById('tabla-doctores');
  const noDoctores = document.getElementById('no-doctores');
  
  if (lista.length === 0) {
    // Ocultar tabla y mostrar mensaje
    tabla?.classList.add('hidden');
    noDoctores?.classList.remove('hidden');
    return;
  }
  
  // Mostrar tabla y ocultar mensaje
  tabla?.classList.remove('hidden');
  noDoctores?.classList.add('hidden');
  
  let html = '';
  
  lista.forEach(doctor => {
    const horario = `${doctor.horarioInicio} - ${doctor.horarioFin}`;
    const dias = doctor.diasDisponibles ? doctor.diasDisponibles.join(', ') : 'N/A';
    
    html += `
      <tr>
        <td data-label="ID"><strong>${doctor.id}</strong></td>
        <td data-label="Nombre">${doctor.nombre}</td>
        <td data-label="Especialidad">
          <span class="badge badge-info">${doctor.especialidad}</span>
        </td>
        <td data-label="Teléfono">${doctor.telefono || 'N/A'}</td>
        <td data-label="Email">${doctor.email || 'N/A'}</td>
        <td data-label="Horario">
          <div style="font-size: 0.875rem;">
            <div>🕐 ${horario}</div>
            <div style="color: var(--text-light);">📅 ${dias}</div>
          </div>
        </td>
        <td data-label="Acciones">
          <div class="table-actions">
            <button 
              class="btn btn-sm btn-primary" 
              onclick="verAgenda('${doctor.id}')"
              title="Ver agenda del doctor"
            >
              📋 Agenda
            </button>
            <button 
              class="btn btn-sm btn-warning" 
              onclick="editarDoctor('${doctor.id}')"
              title="Editar doctor"
            >
              ✏️ Editar
            </button>
            <button 
              class="btn btn-sm btn-danger" 
              onclick="confirmarEliminarDoctor('${doctor.id}')"
              title="Eliminar doctor"
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
// FILTRAR DOCTORES
// ============================================
function filtrarDoctores() {
  const termino = document.getElementById('buscar-doctor')?.value.toLowerCase() || '';
  const especialidad = document.getElementById('filtro-especialidad')?.value || '';
  
  let filtrados = doctores;
  
  if (termino) {
    filtrados = filtrados.filter(d => 
      d.nombre.toLowerCase().includes(termino) ||
      d.especialidad.toLowerCase().includes(termino) ||
      (d.email && d.email.toLowerCase().includes(termino)) ||
      (d.telefono && d.telefono.includes(termino))
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
  const titulo = document.getElementById('modal-titulo-doctor');
  
  titulo.textContent = doctor ? 'Editar Doctor' : 'Nuevo Doctor';
  
  // Llenar el formulario si es edición
  if (doctor) {
    document.getElementById('doctor-id').value = doctor.id;
    document.getElementById('doctor-nombre').value = doctor.nombre;
    document.getElementById('doctor-especialidad').value = doctor.especialidad;
    document.getElementById('doctor-telefono').value = doctor.telefono || '';
    document.getElementById('doctor-email').value = doctor.email || '';
    document.getElementById('doctor-horario-inicio').value = doctor.horarioInicio || '08:00';
    document.getElementById('doctor-horario-fin').value = doctor.horarioFin || '17:00';
    document.getElementById('doctor-consultorio').value = doctor.consultorio || '';
  } else {
    document.getElementById('form-doctor').reset();
    document.getElementById('doctor-id').value = '';
  }
  
  modal.classList.add('active');
}

// ============================================
// CERRAR MODAL DOCTOR
// ============================================
function cerrarModalDoctor() {
  const modal = document.getElementById('modal-doctor');
  modal.classList.remove('active');
  document.getElementById('form-doctor').reset();
  doctorEditando = null;
}

// ============================================
// GUARDAR DOCTOR
// ============================================
async function guardarDoctor(event) {
  event.preventDefault();
  
  const datos = {
    nombre: document.getElementById('doctor-nombre').value.trim(),
    especialidad: document.getElementById('doctor-especialidad').value.trim(),
    telefono: document.getElementById('doctor-telefono').value.trim() || null,
    email: document.getElementById('doctor-email').value.trim() || null,
    horarioInicio: document.getElementById('doctor-horario-inicio').value,
    horarioFin: document.getElementById('doctor-horario-fin').value,
    consultorio: document.getElementById('doctor-consultorio').value.trim() || null,
    diasDisponibles: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] // Default
  };
  
  // Validar horarios
  if (datos.horarioFin <= datos.horarioInicio) {
    mostrarError('El horario de fin debe ser mayor al horario de inicio');
    return;
  }
  
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
  
  mostrarExito(doctorEditando ? 'Doctor actualizado correctamente' : 'Doctor registrado correctamente');
  cerrarModalDoctor();
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
  
  if (confirm(`¿Estás seguro de eliminar al doctor "${doctor.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
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
    mostrarError('Error al eliminar doctor: ' + res.error);
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
  const contenido = document.getElementById('contenido-agenda');
  
  let html = `
    <div class="mb-3">
      <h3>${doctor.nombre}</h3>
      <p class="text-muted">
        ${doctor.especialidad}
      </p>
      <div class="alert alert-info">
        <strong>🕐 Horario:</strong> ${doctor.horarioInicio} - ${doctor.horarioFin}<br>
        <strong>📅 Días:</strong> ${doctor.diasDisponibles ? doctor.diasDisponibles.join(', ') : 'N/A'}
      </div>
    </div>
  `;
  
  if (!res.success || res.data.length === 0) {
    html += `
      <div class="text-center" style="padding: 2rem;">
        <div style="font-size: 3rem;">📅</div>
        <h3>Sin citas programadas</h3>
        <p class="text-muted">
          Este doctor no tiene citas agendadas
        </p>
      </div>
    `;
  } else {
    // Cargar pacientes
    const resPacientes = await pacientesAPI.getAll();
    const pacientes = resPacientes.success ? resPacientes.data : [];
    
    // Estadísticas
    const programadas = res.data.filter(c => c.estado === 'programada').length;
    const completadas = res.data.filter(c => c.estado === 'completada').length;
    const canceladas = res.data.filter(c => c.estado === 'cancelada').length;
    
    html += `
      <div class="flex gap-2 mb-3" style="flex-wrap: wrap;">
        <span class="badge badge-success">${programadas} Programadas</span>
        <span class="badge badge-info">${completadas} Completadas</span>
        <span class="badge badge-danger">${canceladas} Canceladas</span>
      </div>
      
      <div class="table-container">
        <table>
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
      const estadoClass = cita.estado === 'programada' ? 'success' : 
                         cita.estado === 'cancelada' ? 'danger' : 
                         cita.estado === 'completada' ? 'info' : 'warning';
      
      html += `
        <tr>
          <td data-label="Fecha">${formatearFecha(cita.fecha)}</td>
          <td data-label="Hora"><strong>${cita.hora}</strong></td>
          <td data-label="Paciente">${paciente ? paciente.nombre : 'N/A'}</td>
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
// CERRAR MODAL AGENDA
// ============================================
function cerrarModalAgenda() {
  const modal = document.getElementById('modal-agenda');
  modal.classList.remove('active');
}

// ============================================
// FUNCIONES DE UI
// ============================================
function mostrarLoading() {
  const loadingEl = document.getElementById('loading-doctores');
  if (loadingEl) {
    loadingEl.classList.remove('hidden');
  }
}

function ocultarLoading() {
  const loadingEl = document.getElementById('loading-doctores');
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