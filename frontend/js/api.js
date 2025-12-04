// frontend/js/api.js
const API_URL = 'http://localhost:3000';

// ============================================
// FUNCIONES GENERALES
// ============================================

// Función base para hacer peticiones
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error en API:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// API DE PACIENTES
// ============================================

const pacientesAPI = {
  // Obtener todos los pacientes
  getAll: () => fetchAPI('/pacientes'),

  // Obtener un paciente por ID
  getById: (id) => fetchAPI(`/pacientes/${id}`),

  // Crear nuevo paciente
  create: (paciente) => fetchAPI('/pacientes', {
    method: 'POST',
    body: JSON.stringify(paciente)
  }),

  // Actualizar paciente
  update: (id, paciente) => fetchAPI(`/pacientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(paciente)
  }),

  // Obtener historial de citas
  getHistorial: (id) => fetchAPI(`/pacientes/${id}/historial`)
};

// ============================================
// API DE DOCTORES
// ============================================

const doctoresAPI = {
  // Obtener todos los doctores
  getAll: () => fetchAPI('/doctores'),

  // Obtener un doctor por ID
  getById: (id) => fetchAPI(`/doctores/${id}`),

  // Crear nuevo doctor
  create: (doctor) => fetchAPI('/doctores', {
    method: 'POST',
    body: JSON.stringify(doctor)
  }),

  // Buscar por especialidad
  getByEspecialidad: (especialidad) => 
    fetchAPI(`/doctores/especialidad/${especialidad}`)
};

// ============================================
// API DE CITAS
// ============================================

const citasAPI = {
  // Obtener todas las citas (con filtros opcionales)
  getAll: (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.fecha) params.append('fecha', filtros.fecha);
    if (filtros.estado) params.append('estado', filtros.estado);
    
    const query = params.toString();
    return fetchAPI(`/citas${query ? '?' + query : ''}`);
  },

  // Obtener una cita por ID
  getById: (id) => fetchAPI(`/citas/${id}`),

  // Crear nueva cita
  create: (cita) => fetchAPI('/citas', {
    method: 'POST',
    body: JSON.stringify(cita)
  }),

  // Cancelar cita
  cancelar: (id) => fetchAPI(`/citas/${id}/cancelar`, {
    method: 'PUT'
  }),

  // Obtener citas de un doctor
  getByDoctor: (doctorId) => fetchAPI(`/citas/doctor/${doctorId}`)
};

// ============================================
// FUNCIONES HELPER
// ============================================

// Mostrar mensaje de error al usuario
function mostrarError(mensaje, contenedor = 'body') {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'mensaje-error';
  errorDiv.innerHTML = `
    <span>❌ ${mensaje}</span>
    <button onclick="this.parentElement.remove()">✕</button>
  `;
  
  const target = document.querySelector(contenedor);
  target.insertBefore(errorDiv, target.firstChild);
  
  setTimeout(() => errorDiv.remove(), 5000);
}

// Mostrar mensaje de éxito
function mostrarExito(mensaje, contenedor = 'body') {
  const exitoDiv = document.createElement('div');
  exitoDiv.className = 'mensaje-exito';
  exitoDiv.innerHTML = `
    <span>✅ ${mensaje}</span>
    <button onclick="this.parentElement.remove()">✕</button>
  `;
  
  const target = document.querySelector(contenedor);
  target.insertBefore(exitoDiv, target.firstChild);
  
  setTimeout(() => exitoDiv.remove(), 3000);
}

// Mostrar loading
function mostrarLoading(contenedor = 'body') {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading-overlay';
  loadingDiv.id = 'loading';
  loadingDiv.innerHTML = `
    <div class="spinner"></div>
    <p>Cargando...</p>
  `;
  document.querySelector(contenedor).appendChild(loadingDiv);
}

// Ocultar loading
function ocultarLoading() {
  const loading = document.getElementById('loading');
  if (loading) loading.remove();
}

// Formatear fecha para mostrar
function formatearFecha(fecha) {
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(fecha).toLocaleDateString('es-MX', opciones);
}

// Obtener fecha de hoy en formato YYYY-MM-DD
function getFechaHoy() {
  return new Date().toISOString().split('T')[0];
}