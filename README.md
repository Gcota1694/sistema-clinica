# 🏥 Sistema de Gestión de Clínica

Sistema web completo para gestionar pacientes, doctores y citas médicas.

## 🚀 Características

- ✅ Gestión de pacientes (CRUD completo)
- ✅ Gestión de doctores (CRUD completo)
- ✅ Sistema de agendamiento de citas
- ✅ Validaciones del lado del cliente y servidor
- ✅ Dashboard con estadísticas
- ✅ Interfaz responsiva (móvil, tablet, desktop)
- ✅ API REST documentada

## 🛠️ Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- Almacenamiento en JSON

### Frontend
- HTML5
- CSS3 (Variables CSS, Flexbox, Grid)
- JavaScript Vanilla
- Fetch API

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/Gcota1694/sistema-clinica.git
cd sistema-clinica
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor:
```bash
npm start
```

4. Abre tu navegador en:
```
http://localhost:3000
```

## 📚 Documentación de la API

Consulta la documentación completa de la API en [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## 📁 Estructura del Proyecto
```
proyecto/
├── server.js                # Servidor Express
├── utils/
│   └── fileManager.js      # Gestión de archivos JSON
├── data/                   # Datos almacenados
│   ├── pacientes.json
│   ├── doctores.json
│   └── citas.json
├── frontend/
│   ├── index.html          # Dashboard
│   ├── pages/
│   │   ├── pacientes.html
│   │   ├── doctores.html
│   │   └── citas.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── api.js          # Cliente de la API
│       ├── app.js          # Dashboard
│       ├── pacientes.js
│       ├── doctores.js
│       └── citas.js
└── package.json
```

## 🎯 Uso

### Pacientes
1. Navega a la sección "Pacientes"
2. Haz clic en "Nuevo Paciente"
3. Completa el formulario
4. Puedes ver el historial de citas de cada paciente

### Doctores
1. Navega a la sección "Doctores"
2. Agrega doctores con sus especialidades y horarios
3. Consulta la agenda de cada doctor

### Citas
1. Navega a la sección "Citas"
2. Haz clic en "Nueva Cita"
3. Selecciona especialidad, luego doctor
4. Elige fecha y hora
5. El sistema valida disponibilidad automáticamente

## 🔒 Seguridad

⚠️ Este proyecto es educativo y NO incluye:
- Autenticación
- Autorización
- Cifrado de datos
- Protección CSRF

Para uso en producción, implementa estas medidas de seguridad.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la Licencia MIT.

## 👥 Autor

Gcota1694 - [GitHub](https://github.com/Gcota1694)

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en GitHub.