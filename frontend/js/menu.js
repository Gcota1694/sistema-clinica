// frontend/js/menu.js
(function() {
  'use strict';
  
  function initMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const body = document.body;
    
    if (!menuToggle || !nav) {
      console.error('Menu elements not found');
      return;
    }
    
    // Crear overlay
    let overlay = document.querySelector('.menu-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'menu-overlay';
      body.insertBefore(overlay, body.firstChild);
    }
    
    // Función para cerrar menú
    function closeMenu() {
      nav.classList.remove('active');
      overlay.classList.remove('active');
      body.style.overflow = '';
    }
    
    // Función para abrir menú
    function openMenu() {
      nav.classList.add('active');
      overlay.classList.add('active');
      body.style.overflow = 'hidden';
    }
    
    // Toggle menú
    function toggleMenu(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if (nav.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    }
    
    // Eventos del botón hamburguesa
    menuToggle.addEventListener('click', toggleMenu, false);
    menuToggle.addEventListener('touchend', function(e) {
      e.preventDefault();
      toggleMenu(e);
    }, false);
    
    // Cerrar al hacer clic en overlay
    overlay.addEventListener('click', closeMenu, false);
    overlay.addEventListener('touchend', function(e) {
      e.preventDefault();
      closeMenu();
    }, false);
    
    // Cerrar al hacer clic en enlaces
    const links = nav.querySelectorAll('a');
    links.forEach(function(link) {
      link.addEventListener('click', function() {
        setTimeout(closeMenu, 100);
      }, false);
    });
    
    // Cerrar con ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeMenu();
      }
    });
    
    // Cerrar al redimensionar
    window.addEventListener('resize', function() {
      if (window.innerWidth >= 768) {
        closeMenu();
      }
    });
  }
  
  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenu);
  } else {
    initMenu();
  }
})();