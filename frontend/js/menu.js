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
      document.body.appendChild(overlay);
    }
    
    // Función para cerrar menú
    function closeMenu() {
      nav.classList.remove('active');
      overlay.classList.remove('active');
      body.classList.remove('menu-open');
      body.style.overflow = '';
    }
    
    // Función para abrir menú
    function openMenu() {
      nav.classList.add('active');
      overlay.classList.add('active');
      body.classList.add('menu-open');
      body.style.overflow = 'hidden';
    }
    
    // Toggle menú
    menuToggle.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if (nav.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    };
    
    // Cerrar al tocar overlay
    overlay.onclick = function(e) {
      e.preventDefault();
      closeMenu();
    };
    
    // Cerrar al hacer clic en enlaces
    const links = nav.querySelectorAll('a');
    links.forEach(function(link) {
      link.onclick = function() {
        setTimeout(closeMenu, 100);
      };
    });
    
    // Cerrar con ESC
    document.onkeydown = function(e) {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        closeMenu();
      }
    };
    
    // Cerrar al redimensionar
    window.onresize = function() {
      if (window.innerWidth >= 768 && nav.classList.contains('active')) {
        closeMenu();
      }
    };
  }
  
  // Inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenu);
  } else {
    initMenu();
  }
})();