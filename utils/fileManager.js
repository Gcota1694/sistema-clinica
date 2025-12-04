const fs = require('fs');

// Leer un archivo JSON
function leerJSON(ruta) {
  try {
    const data = fs.readFileSync(ruta, 'utf8');
    return JSON.parse(data || '[]'); 
  } catch (error) {
    console.error("Error al leer el archivo:", error);
    return [];
  }
}

// Escribir un archivo JSON
function escribirJSON(ruta, data) {
  try {
    fs.writeFileSync(ruta, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error al escribir el archivo:", error);
  }
}

module.exports = { leerJSON, escribirJSON };