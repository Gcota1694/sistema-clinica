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
  if (!document.querySelector('.menu-overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    body.appendChild(overlay);
  }
  
  const overlay = document.querySelector('.menu-overlay');
  
  if (menuToggle && nav) {
    // Toggle menú al hacer click en el botón hamburguesa
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMenu();
    });
    
    // Cerrar menú al hacer click en el overlay
    overlay.addEventListener('click', function() {
      closeMenu();
    });
    
    // Cerrar menú al hacer click en un enlace
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        closeMenu();
      });
    });
    
    // Cerrar menú con la tecla ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        closeMenu();
      }
    });
    
    // Prevenir scroll del body cuando el menú está abierto
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.target.classList.contains('active')) {
          body.style.overflow = 'hidden';
        } else {
          body.style.overflow = '';
        }
      });
    });
    
    observer.observe(nav, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
  
  // Función para abrir/cerrar el menú
  function toggleMenu() {
    nav.classList.toggle('active');
    overlay.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', 
      nav.classList.contains('active'));
  }
  
  // Función para cerrar el menú
  function closeMenu() {
    nav.classList.remove('active');
    overlay.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  
  // Cerrar menú al cambiar de orientación o redimensionar
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 768 && nav.classList.contains('active')) {
      closeMenu();
    }
  });
}