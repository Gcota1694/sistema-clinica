// frontend/js/menu.js
// Control del menú móvil responsivo

document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
});

function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  const body = document.body;
  
  // Crear overlay si no existe
  let overlay = document.querySelector('.menu-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    body.appendChild(overlay);
  }
  
  if (!menuToggle || !nav) {
    return;
  }
  
  // Toggle menú - usar touchstart para móviles
  menuToggle.addEventListener('touchstart', function(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });
  
  menuToggle.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });
  
  // Cerrar menú al tocar el overlay
  overlay.addEventListener('touchstart', function(e) {
    e.preventDefault();
    closeMenu();
  });
  
  overlay.addEventListener('click', function(e) {
    e.preventDefault();
    closeMenu();
  });
  
  // Cerrar menú al tocar un enlace
  const navLinks = nav.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('touchstart', function(e) {
      // No prevenir default para permitir navegación
      setTimeout(() => {
        closeMenu();
      }, 50);
    });
    
    link.addEventListener('click', function(e) {
      setTimeout(() => {
        closeMenu();
      }, 50);
    });
  });
  
  // Cerrar menú con la tecla ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && nav.classList.contains('active')) {
      closeMenu();
    }
  });
  
  // Función para abrir/cerrar el menú
  function toggleMenu() {
    const isActive = nav.classList.toggle('active');
    overlay.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', isActive);
    
    if (isActive) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = '';
    }
  }
  
  // Función para cerrar el menú
  function closeMenu() {
    nav.classList.remove('active');
    overlay.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
  }
  
  // Cerrar menú al cambiar de orientación o redimensionar
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth >= 768 && nav.classList.contains('active')) {
        closeMenu();
      }
    }, 250);
  });
}