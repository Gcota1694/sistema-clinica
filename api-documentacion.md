# 🏥 Documentación API REST - Sistema de Gestión de Clínica

## 📋 Información General

**Base URL:** `http://localhost:3000`  
**Versión:** 1.0.0  
**Formato de respuesta:** JSON  
**Puerto por defecto:** 3000  
**Autor:** Gcota1694

---

## 📁 Estructura de Datos

### Paciente
```json
{
  "id": "P001",
  "nombre": "Juan Pérez García",
  "edad": 35,
  "telefono": "6441234567",
  "email": "juan.perez@example.com",
  "fechaRegistro": "2025-03-12"
}
```

**Campos:**
- `id` (string): Identificador único con formato P### (ej: P001, P002)
- `nombre` (string): Nombre completo del paciente
- `edad` (number): Edad en años (1-120)
- `telefono` (string): Número telefónico (10-15 dígitos)
- `email` (string): Correo electrónico único
- `fechaRegistro` (string): Fecha de registro en formato YYYY-MM-DD

---

### Doctor
```json
{
  "id": "D001",
  "nombre": "Dra. María López Hernández",
  "especialidad": "Cardiología",
  "horarioInicio": "08:00",
  "horarioFin": "17:00",
  "diasDisponibles": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
}
```

**Campos:**
- `id` (string): Identificador único con formato D### (ej: D001, D002)
- `nombre` (string): Nombre completo del doctor
- `especialidad` (string): Especialidad médica
- `horarioInicio` (string): Hora de inicio en formato HH:MM
- `horarioFin` (string): Hora de fin en formato HH:MM
- `diasDisponibles` (array): Lista de días de la semana disponibles

---

### Cita
```json
{
  "id": "C001",
  "pacienteId": "P001",
  "doctorId": "D001",
  "fecha": "2025-03-15",
  "hora": "10:00",
  "motivo": "Consulta general de control",
  "estado": "programada"
}
```

**Campos:**
- `id` (string): Identificador único con formato C### (ej: C001, C002)
- `pacienteId` (string): ID del paciente
- `doctorId` (string): ID del doctor
- `fecha` (string): Fecha de la cita en formato YYYY-MM-DD
- `hora` (string): Hora de la cita en formato HH:MM
- `motivo` (string): Motivo de la consulta
- `estado` (string): Estado de la cita (`programada` | `cancelada`)

---

## 🔗 Endpoints de la API

## 👥 PACIENTES

### **GET /pacientes**
Obtiene la lista completa de todos los pacientes registrados.

**Request:**
```http
GET /pacientes HTTP/1.1
Host: localhost:3000
```

**Response exitosa (200):**
```json
[
  {
    "id": "P001",
    "nombre": "Juan Pérez García",
    "edad": 35,
    "telefono": "6441234567",
    "email": "juan.perez@example.com",
    "fechaRegistro": "2025-03-12"
  },
  {
    "id": "P002",
    "nombre": "María González López",
    "edad": 28,
    "telefono": "6449876543",
    "email": "maria.gonzalez@example.com",
    "fechaRegistro": "2025-03-13"
  }
]
```

---

### **GET /pacientes/:id**
Obtiene la información detallada de un paciente específico por su ID.

**Parámetros URL:**
- `id` (string): ID del paciente (acepta "P001" o "1")

**Request:**
```http
GET /pacientes/P001 HTTP/1.1
Host: localhost:3000
```

**Response exitosa (200):**
```json
{
  "id": "P001",
  "nombre": "Juan Pérez García",
  "edad": 35,
  "telefono": "6441234567",
  "email": "juan.perez@example.com",
  "fechaRegistro": "2025-03-12"
}
```

**Error (404):**
```json
{
  "error": "Paciente no encontrado"
}
```

---

### **POST /pacientes**
Registra un nuevo paciente en el sistema.

**Request:**
```http
POST /pacientes HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "nombre": "Juan Pérez García",
  "edad": 35,
  "telefono": "6441234567",
  "email": "juan.perez@example.com"
}
```

**Campos obligatorios:**
- `nombre` (string): Nombre completo
- `edad` (number): Edad del paciente (1-120)
- `telefono` (string): Número telefónico
- `email` (string): Correo electrónico (debe ser único)

**Response exitosa (201):**
```json
{
  "mensaje": "Paciente agregado",
  "paciente": {
    "id": "P011",
    "nombre": "Juan Pérez García",
    "edad": 35,
    "telefono": "6441234567",
    "email": "juan.perez@example.com",
    "fechaRegistro": "2025-03-12"
  }
}
```

**Errores comunes:**

**400 - Campos faltantes:**
```json
{
  "error": "Faltan campos obligatorios",
  "faltantes": ["nombre", "edad"]
}
```

**400 - Email duplicado:**
```json
{
  "error": "El email ya está registrado"
}
```

---

### **PUT /pacientes/:id**
Actualiza la información de un paciente existente.

**Parámetros URL:**
- `id` (string): ID del paciente

**Request:**
```http
PUT /pacientes/P001 HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "nombre": "Juan Pérez García",
  "edad": 36,
  "telefono": "6441234567",
  "email": "juan.nuevo@example.com"
}
```

**Response exitosa (200):**
```json
{
  "mensaje": "Paciente actualizado",
  "paciente": {
    "id": "P001",
    "nombre": "Juan Pérez García",
    "edad": 36,
    "telefono": "6441234567",
    "email": "juan.nuevo@example.com",
    "fechaRegistro": "2025-03-12"
  }
}
```

**Errores:**
```json
// 404
{ "error": "Paciente no encontrado" }

// 400 - Email ya usado por otro paciente
{ "error": "El email ya está registrado por otro paciente" }
```

---

### **DELETE /pacientes/:id**
Elimina un paciente del sistema.

**Parámetros URL:**
- `id` (string): ID del paciente

**Request:**
```http
DELETE /pacientes/P001 HTTP/1.1
Host: localhost:3000
```

**Response exitosa (200):**
```json
{
  "mensaje": "Paciente eliminado",
  "paciente": {
    "id": "P001",
    "nombre": "Juan Pérez García"
  }
}
```

**Error (404):**
```json
{
  "error": "Paciente no encontrado"
}
```

---

### **GET /pacientes/:id/historial**
Obtiene el historial completo de citas de un paciente.

**Parámetros URL:**
- `id` (string): ID del paciente

**Request:**
```http
GET /pacientes/P001/historial HTTP/1.1
Host: localhost:3000
```

**Response exitosa (200):**
```json
[
  {
    "id": "C001",
    "pacienteId": "P001",
    "doctorId": "D001",
    "fecha": "2025-03-15",
    "hora": "10:00",
    "motivo": "Consulta general",
    "estado": "programada"
  },
  {
    "id": "C005",
    "pacienteId": "P001",
    "doctorId": "D002",
    "fecha": "2025-02-20",
    "hora": "14:00",
    "motivo": "Revisión anual",
    "estado": "cancelada"
  }
]
```

**Error (404):**
```json
{
  "error": "Sin historial de citas"
}
```

---

## 👨‍⚕️ DOCTORES

### **GET /doctores**
Obtiene la lista completa de todos los doctores registrados.

**Request:**
```http
GET /doctores HTTP/1.1
Host: localhost:3000
```

**Response exitosa (200):**
```json
[
  {
    "id": "D001",
    "nombre": "Dra. María López",
    "especialidad": "Cardiología",
    "horarioInicio": "08:00",
    "horarioFin": "17:00",
    "diasDisponibles": ["Lunes", "Martes", "Miércoles"]
  },
  {
    "id": "D002",
    "nombre": "Dr. Carlos Ramírez",
    "especialidad": "Pediatría",
    "horarioInicio": "09:00",
    "horarioFin": "18:00",
    "diasDisponibles": ["Lunes", "Miércoles", "Viernes"]
  }
]
```

---

### **GET /doctores/:id**
Obtiene la información detallada de un doctor específico.

**Parámetros URL:**
- `id` (string): ID del doctor (acepta "D001" o "1")

**Request:**
```http
GET /doctores/D001 HTTP/1.1
Host: localhost:3000
```

**Response exitosa (200):**
```json
{
  "id": "D001",
  "nombre": "Dra. María López",
  "especialidad": "Cardiología",
  "horarioInicio": "08:00",
  "horarioFin": "17:00",
  "diasDisponibles": ["Lunes", "Martes", "Miércoles"]
}
```

**Error (404):**
```json
{
  "error": "Doctor no encontrado"
}
```

---

### **POST /doctores**
Registra un nuevo doctor en el sistema.

**Request:**
```http
POST /doctores HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "nombre": "Dr. Carlos Ramírez",
  "especialidad": "Pediatría",
  "horarioInicio": "09:00",
  "horarioFin": "18:00",
  "diasDisponibles": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
}
```

**Campos obligatorios:**
- `nombre` (string): Nombre completo del doctor
- `especialidad` (string): Especialidad médica
- `horarioInicio` (string): Hora de inicio (formato HH:MM)
- `horarioFin` (string): Hora de fin (formato HH:MM)
- `diasDisponibles` (array): Lista de días disponibles

**Días válidos:**
- Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo

**Response exitosa (201):**
```json
{
  "mensaje": "Doctor agregado",
  "doctor": {
    "id": "D007",
    "nombre": "Dr. Carlos Ramírez",
    "especialidad": "Pediatría",
    "horarioInicio": "09:00",
    "horarioFin": "18:00",
    "diasDisponibles": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
  }
}
```

**Errores:**
```json
// 400 - Campos faltantes
{
  "error": "Faltan campos obligatorios",
  "faltantes": ["nombre", "especialidad"]
}

// 400 - Doctor duplicado
{
  "error": "Ya existe un doctor con ese nombre y especialidad"
}
```

---

### **PUT /doctores/:id**
Actualiza la información de un doctor existente.

**Parámetros URL:**
- `id` (string): ID del doctor

**Request:**
```http
PUT /doctores/D001 HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "nombre": "Dra. María López Hernández",
  "especialidad": "Cardiología",
  "horarioInicio": "08:00",
  "horarioFin": "16:00",
  "diasDisponibles": ["Lunes", "Miércoles", "Viernes"]
}
```

**Response exitosa (200):**
```json
{
  "mensaje": "Doctor actualizado",
  "doctor": {
    "id": "D001",
    "nombre": "Dra. María López Hernández",
    "especialidad": "Cardiología",
    "horarioInicio": "08:00",
    "horarioFin": "16:00",
    "diasDisponibles": ["Lunes", "Miércoles", "Viernes"]
  }
}
```

---

### **DELETE /doctores/:id**
Elimina un doctor del sistema.

**Request:**
```http
DELETE /doctores/D001 HTTP/1.1
Host: localhost:3000
```

**Response exitosa (200):**
```json
{
  "mensaje": "Doctor eliminado",
  "doctor": {
    "id": "D001",
    "nombre": "Dra. María López"
  }
}
```

---

### **GET /doctores/especialidad/:especialidad**
Busca doctores por especialidad médica.

**Parámetros URL:**
- `especialidad` (string): Nombre de la especialidad

**Request:**
```http
GET /doctores/especialidad/Cardiología HTTP/1.1
Host: localhost:3000
```

**Response exitosa (200):**
```json
[
  {
    "id": "D001",
    "nombre": "Dra. María López",
    "especialidad": "Cardiología",
    "horarioInicio": "08:00",
    "horarioFin": "17:00",
    "diasDisponibles": ["Lunes", "Martes", "Miércoles"]
  },
  {
    "id": "D004",
    "nombre": "Dr. Roberto Sánchez",
    "especialidad": "Cardiología",
    "horarioInicio": "10:00",
    "horarioFin": "19:00",
    "diasDisponibles": ["Martes", "Jueves", "Sábado"]
  }
]
```

**Especialidades comunes:**
- Cardiología
- Neurología
- Pediatría
- Dermatología
- Oftalmología
- Traumatología
- Ginecología
- Medicina General

---

## 📅 CITAS

### **GET /citas**
Obtiene todas las citas con filtros opcionales.

**Query Parameters (opcionales):**
- `fecha` (string): Filtrar por fecha (YYYY-MM-DD)
- `estado` (string): Filtrar por estado (programada | cancelada)

**Ejemplos de Request:**

**Todas las citas:**
```http
GET /citas HTTP/1.1
Host: localhost:3000
```

**Filtrar por fecha:**
```http
GET /citas?fecha=2025-03-15 HTTP/1.1
Host: localhost:3000
```

**Filtrar por estado:**
```http
GET /citas?estado=programada HTTP/1.1
Host: localhost:3000
```

**Múltiples filtros:**
```http
GET /citas?fecha=2025-03-15&estado=programada HTTP/1.1
Host: localhost:3000
```

**Response exitosa (200):**
```json
[
  {
    "id": "C001",
    "pacienteId": "P001",
    "doctorId": "D001",
    "fecha": "2025-03-15",
    "hora": "10:00",
    "motivo": "Consulta general",
    "estado": "programada"
  },
  {
    "id": "C002",
    "pacienteId": "P003",
    "doctorId": "D001",
    "fecha": "2025-03-15",
    "hora": "11:00",
    "motivo": "Revisión de resultados",
    "estado": "programada"
  }
]
```

---

### **GET /citas/:id**
Obtiene la información detallada de una cita específica.

**Parámetros URL:**
- `id` (string): ID de la cita (acepta "C001" o "1")

**Request:**
```http
GET /citas/C001 HTTP/1.1
Host: localhost:3000
```

**Response exitosa (200):**
```json
{
  "id": "C001",
  "pacienteId": "P001",
  "doctorId": "D001",
  "fecha": "2025-03-15",
  "hora": "10:00",
  "motivo": "Consulta general",
  "estado": "programada"
}
```

**Error (404):**
```json
{
  "error": "Cita no encontrada"
}
```

---

### **POST /citas**
Agenda una nueva cita médica.

**Request:**
```http
POST /citas HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "pacienteId": "P001",
  "doctorId": "D001",
  "fecha": "2025-03-15",
  "hora": "10:00",
  "motivo": "Consulta de control"
}
```

**Campos obligatorios:**
- `pacienteId` (string): ID del paciente (debe existir)
- `doctorId` (string): ID del doctor (debe existir)
- `fecha` (string): Fecha en formato YYYY-MM-DD
- `hora` (string): Hora en formato HH:MM
- `motivo` (string): Motivo de la consulta

**Validaciones automáticas:**
1. ✅ El paciente debe existir
2. ✅ El doctor debe existir
3. ✅ El doctor debe atender ese día de la semana
4. ✅ La hora debe estar dentro del horario del doctor
5. ✅ No debe existir otra cita del doctor a esa hora/fecha

**Response exitosa (201):**
```json
{
  "mensaje": "Cita agendada",
  "cita": {
    "id": "C012",
    "pacienteId": "P001",
    "doctorId": "D001",
    "fecha": "2025-03-15",
    "hora": "10:00",
    "motivo": "Consulta de control",
    "estado": "programada"
  }
}
```

**Errores posibles:**

**400 - Paciente no existe:**
```json
{
  "error": "Paciente no existe"
}
```

**400 - Doctor no existe:**
```json
{
  "error": "Doctor no existe"
}
```

**400 - Doctor no atiende ese día:**
```json
{
  "error": "Doctor no atiende ese día"
}
```

**400 - Hora fuera del horario:**
```json
{
  "error": "Hora fuera del horario del doctor"
}
```

**400 - Conflicto de horario:**
```json
{
  "error": "El doctor ya tiene una cita en ese horario"
}
```

---

### **PUT /citas/:id/cancelar**
Cancela una cita programada.

**Parámetros URL:**
- `id` (string): ID de la cita

**Request:**
```http
PUT /citas/C001/cancelar HTTP/1.1
Host: localhost:3000
```

**Response exitosa (200):**
```json
{
  "mensaje": "Cita cancelada",
  "cita": {
    "id": "C001",
    "pacienteId": "P001",
    "doctorId": "D001",
    "fecha": "2025-03-15",
    "hora": "10:00",
    "motivo": "Consulta general",
    "estado": "cancelada"
  }
}
```

**Errores:**
```json
// 404
{ "error": "Cita no encontrada" }

// 400
{ "error": "Solo se pueden cancelar citas programadas" }
```

---

### **GET /citas/doctor/:doctorId**
Obtiene todas las citas de un doctor específico.

**Parámetros URL:**
- `doctorId` (string): ID del doctor

**Request:**
```http
GET /citas/doctor/D001 HTTP/1.1
Host: localhost:3000
```

**Response exitosa (200):**
```json
[
  {
    "id": "C001",
    "pacienteId": "P001",
    "doctorId": "D001",
    "fecha": "2025-03-15",
    "hora": "10:00",
    "motivo": "Consulta general",
    "estado": "programada"
  },
  {
    "id": "C003",
    "pacienteId": "P005",
    "doctorId": "D001",
    "fecha": "2025-03-16",
    "hora": "14:00",
    "motivo": "Revisión de análisis",
    "estado": "programada"
  }
]
```

---

## 📊 ESTADÍSTICAS

### **GET /estadisticas/doctores**
Obtiene estadísticas generales sobre los doctores registrados.

**Request:**
```http
GET /estadisticas/doctores HTTP/1.1
Host: localhost:3000
```

**Response exitosa (200):**
```json
{
  "total": 6,
  "porEspecialidad": {
    "Cardiología": 2,
    "Pediatría": 1,
    "Dermatología": 1,
    "Neurología": 2
  }
}
```

---

## 🔄 Normalización de IDs

La API acepta IDs tanto con prefijo como numéricos:

| Formato Entrada | Se convierte a | Válido |
|----------------|----------------|--------|
| `P001` | `P001` | ✅ |
| `1` | `P001` | ✅ |
| `p001` | `P001` | ✅ |
| `D005` | `D005` | ✅ |
| `5` | `D005` | ✅ |
| `C010` | `C010` | ✅ |
| `10` | `C010` | ✅ |

**Ejemplos:**
```http
GET /pacientes/P001  ✅
GET /pacientes/1     ✅ (se convierte a P001)
GET /doctores/D005   ✅
GET /doctores/5      ✅ (se convierte a D005)
```

---

## ⚠️ Códigos de Estado HTTP

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| **200** | OK | Petición exitosa |
| **201** | Created | Recurso creado exitosamente |
| **400** | Bad Request | Datos inválidos o faltantes |
| **404** | Not Found | Recurso no encontrado |
| **500** | Internal Server Error | Error del servidor |

---

## 📝 Ejemplos de Uso Completos

### **Ejemplo 1: Registrar un paciente y agendar una cita**

```javascript
// 1. Registrar paciente
const paciente = await fetch('http://localhost:3000/pacientes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: "Ana Martínez",
    edad: 30,
    telefono: "6441112233",
    email: "ana.martinez@example.com"
  })
});
const { paciente: nuevoPaciente } = await paciente.json();

// 2. Buscar doctores por especialidad
const doctores = await fetch('http://localhost:3000/doctores/especialidad/Cardiología');
const listaDoctores = await doctores.json();

// 3. Agendar cita
const cita = await fetch('http://localhost:3000/citas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pacienteId: nuevoPaciente.id,
    doctorId: listaDoctores[0].id,
    fecha: "2025-03-20",
    hora: "10:00",
    motivo: "Primera consulta"
  })
});
const citaAgendada = await cita.json();
```

### **Ejemplo 2: Obtener citas del día y cancelar una**

```javascript
// 1. Obtener citas de hoy
const hoy = new Date().toISOString().split('T')[0];
const citasHoy = await fetch(`http://localhost:3000/citas?fecha=${hoy}&estado=programada`);
const listaCitas = await citasHoy.json();

// 2. Cancelar primera cita
if (listaCitas.length > 0) {
  const cancelar = await fetch(`http://localhost:3000/citas/${listaCitas[0].id}/cancelar`, {
    method: 'PUT'
  });
  const resultado = await cancelar.json();
  console.log(resultado.mensaje); // "Cita cancelada"
}
```

### **Ejemplo 3: Ver historial de un paciente**

```javascript
// 1. Buscar paciente
const pacientes = await fetch('http://localhost:3000/pacientes');
const lista = await pacientes.json();

// 2. Ver historial del primer paciente
const historial = await fetch(`http://localhost:3000/pacientes/${lista[0].id}/historial`);
const citas = await historial.json();

console.log(`${lista[0].nombre} tiene ${citas.length} citas registradas`);
```

---

## 🔒 Notas de Seguridad

### ⚠️ **Advertencias importantes**

Esta API es **educativa** y **NO** incluye:

- ❌ Autenticación (sin tokens JWT)
- ❌ Autorización (sin roles de usuario)
- ❌ Cifrado de datos sensibles
- ❌ Protección CSRF
- ❌ Rate limiting
- ❌ CORS configurado apropiadamente
- ❌ Validación exhaustiva de inputs
- ❌ Sanitización de datos

### 🛡️ **Para uso en producción se recomienda:**

1. **Autenticación:** Implementar JWT o OAuth2
2. **Autorización:** Sistema de roles (admin, doctor, recepcionista)
3. **HTTPS:** Siempre usar conexión segura
4. **Validación:** Validar y sanitizar todos los inputs
5. **Rate Limiting:** Limitar peticiones por IP
6. **Logging:** Registrar todas las operaciones
7. **Backups:** Copias automáticas de la base de datos
8. **CORS:** Configurar orígenes permitidos

---

## 📦 Archivos de Datos

Los datos se almacenan en archivos JSON en la carpeta `data/`:

```
data/
├── pacientes.json    # Lista de pacientes
├── doctores.json     # Lista de doctores
└── citas.json        # Lista de citas
```

### ⚠️ **Importante:**
- Los IDs se generan automáticamente de forma secuencial
- Los archivos se sobrescriben en cada operación de escritura
- **Se recomienda hacer backup periódico** de estos archivos
- No editar manualmente los archivos JSON mientras el servidor está corriendo

---

## 🚀 Iniciar el Servidor

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start

# Salida esperada:
# Servidor escuchando en http://localhost:3000
```

---

## 🐛 Troubleshooting

### **Error: "Cannot GET /"**
**Causa:** El servidor no está corriendo  
**Solución:** Ejecuta `npm start`

### **Error: "ENOENT: no such file or directory"**
**Causa:** Falta la carpeta `data/` o archivos JSON  
**Solución:** Crea la carpeta y archivos vacíos:
```bash
mkdir data
echo "[]" > data/pacientes.json
echo "[]" > data/doctores.json
echo "[]" > data/citas.json
```

### **Error: "Email ya está registrado"**
**Causa:** Intentas crear un paciente con email duplicado  
**Solución:** Usa otro email o actualiza el paciente existente

### **Error: "El doctor ya tiene una cita en ese horario"**
**Causa:** Conflicto de horario  
**Solución:** Elige otra hora o fecha

---

## 📞 Soporte

Para reportar bugs o solicitar funcionalidades:
- **Repositorio:** [github.com/Gcota1694/sistema-clinica](https://github.com/Gcota1694/sistema-clinica)
- **Issues:** Crear un issue en GitHub

---

## 📄 Licencia

Este proyecto es de código abierto bajo la Licencia MIT.

---

**Versión de la API:** 1.0.0  
**Última actualización:** Diciembre 2025  
**Mantenedor:** Gcota1694