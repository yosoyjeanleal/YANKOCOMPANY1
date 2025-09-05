
    // Año dinámico
    document.getElementById('year').textContent = new Date().getFullYear();

    // Menú móvil
    const burger = document.getElementById('burger');
    const panel = document.getElementById('panel-movil');
    burger.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(isOpen));
    });

    // Cerrar al navegar
    panel.addEventListener('click', (e)=>{
      if(e.target.tagName === 'A') panel.classList.remove('open');
    });

    // Suavizar scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e)=>{
        const href = a.getAttribute('href');
        if(href.length > 1){
          e.preventDefault();
          document.querySelector(href)?.scrollIntoView({behavior:'smooth', block:'start'});
        }
      });
    });

    // Aparición al hacer scroll
    const reveal = () => {
      document.querySelectorAll('[data-animate]').forEach(el => {
        const rect = el.getBoundingClientRect();
        if(rect.top < window.innerHeight - 80) el.classList.add('visible');
      });
    }
    document.addEventListener('scroll', reveal, {passive:true});
    window.addEventListener('load', reveal);

    // Validación simple del formulario
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      const nombre = fd.get('nombre')?.toString().trim();
      const email = fd.get('email')?.toString().trim();
      const tema = fd.get('tema')?.toString().trim();
      const msg = fd.get('msg')?.toString().trim();
      if(!nombre || !email || !tema || !msg){
        status.textContent = 'Por favor, completa todos los campos.';
        status.style.color = '#fca5a5';
        return;
      }
      const emailOk = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
      if(!emailOk){
        status.textContent = 'Ingresa un email válido.';
        status.style.color = '#fca5a5';
        return;
      }
      // Aquí podrías hacer fetch hacia tu backend
      status.textContent = '¡Gracias! Te responderemos muy pronto.';
      status.style.color = '#86efac';
      form.reset();
    });
