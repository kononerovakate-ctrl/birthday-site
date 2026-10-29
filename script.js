document.addEventListener('DOMContentLoaded', () => {

  /* ========== УНИВЕРСАЛЬНАЯ ФУНКЦИЯ КАРУСЕЛИ ========== */
  function initCarousel(trackId, prevBtnId, nextBtnId, dotsId) {
    const track = document.getElementById(trackId);
    const slides = track.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    const dotsContainer = document.getElementById(dotsId);

    let currentIndex = 0;

    // Создаём точки
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.dot');

    function goTo(index) {
      if (index < 0) index = 0;
      if (index >= slides.length) index = slides.length - 1;
      currentIndex = index;

      const slide = slides[index];
      track.scrollTo({
        left: slide.offsetLeft - track.offsetLeft,
        behavior: 'smooth'
      });

      updateDots();
      pauseOtherVideos(slides, index);
    }

    function updateDots() {
      dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    // Ставим на паузу все видео, кроме текущего
    function pauseOtherVideos(allSlides, activeIndex) {
      allSlides.forEach((slide, i) => {
        const video = slide.querySelector('video');
        if (video && i !== activeIndex && !video.paused) {
          video.pause();
        }
      });
    }

    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));
    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));

    // Синхронизация точек при ручной прокрутке
    let scrollTimeout;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const trackCenter = track.scrollLeft + track.offsetWidth / 2;
        let closestIndex = 0;
        let closestDistance = Infinity;

        slides.forEach((slide, i) => {
          const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
          const distance = Math.abs(trackCenter - slideCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
          }
        });

        if (closestIndex !== currentIndex) {
          currentIndex = closestIndex;
          updateDots();
        }
      }, 80);
    });

    // Свайп на телефоне
    let startX = 0;
    track.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goTo(currentIndex + (diff > 0 ? 1 : -1));
      }
    });
  }

  /* ========== ЗАПУСКАЕМ ОБЕ КАРУСЕЛИ ========== */
  // Карусель с фото
  initCarousel('track', 'prevBtn', 'nextBtn', 'dots');

  // Карусель с видео
  initCarousel('videoTrack', 'videoPrevBtn', 'videoNextBtn', 'videoDots');

  /* ========== САЛЮТ ========== */
  const canvas = document.getElementById('fireworks');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const particles = [];
  const colors = [
    '#ff006e', '#ffbe0b', '#fb5607', '#8338ec',
    '#3a86ff', '#06d6a0', '#ffd60a', '#e63946',
    '#a0e7e5', '#b4f8c8', '#ffaebc', '#fbe7c6'
  ];

  function createFirework(x, y) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const count = 60 + Math.floor(Math.random() * 40);

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.012 + Math.random() * 0.008,
        color,
        size: 2 + Math.random() * 2
      });
    }
  }

  function animateFireworks() {
    ctx.fillStyle = 'rgba(214, 236, 255, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(animateFireworks);
  }
  animateFireworks();

  function launchShow() {
    createFirework(canvas.width * 0.25, canvas.height * 0.35);
    createFirework(canvas.width * 0.75, canvas.height * 0.35);

    const times = [400, 800, 1200, 1700, 2300, 3000];
    times.forEach(t => {
      setTimeout(() => {
        createFirework(
          canvas.width * (0.15 + Math.random() * 0.7),
          canvas.height * (0.2 + Math.random() * 0.3)
        );
      }, t);
    });
  }

  setTimeout(launchShow, 200);

  /* ========== КОНФЕТТИ ========== */
  function launchConfetti() {
    const confColors = [
      '#e63946', '#f4a261', '#e9c46a', '#2a9d8f',
      '#457b9d', '#ff6ec7', '#ffb703', '#fb8500',
      '#9d4edd', '#ffd60a', '#ff006e', '#06d6a0',
      '#00b4d8', '#90e0ef', '#ffb3c6', '#c77dff'
    ];

    for (let i = 0; i < 300; i++) {
      const conf = document.createElement('div');
      const size = 6 + Math.random() * 10;
      const color = confColors[Math.floor(Math.random() * confColors.length)];
      const startX = Math.random() * 100;
      const rotate = Math.random() * 1080 - 540;
      const duration = 5 + Math.random() * 4;
      const isCircle = Math.random() > 0.5;
      const delay = Math.random() * 1.5;

      conf.style.cssText = `
        position: fixed;
        top: -30px;
        left: ${startX}vw;
        width: ${size}px;
        height: ${size * (isCircle ? 1 : 0.4)}px;
        background: ${color};
        border-radius: ${isCircle ? '50%' : '2px'};
        pointer-events: none;
        z-index: 9999;
        opacity: 1;
        transform: translateY(0) rotate(0deg);
        transition: transform ${duration}s linear ${delay}s,
                    opacity ${duration}s ease-in ${delay}s;
      `;

      document.body.appendChild(conf);

      requestAnimationFrame(() => {
        conf.style.transform = `translateY(110vh) rotate(${rotate}deg)`;
        conf.style.opacity = 0;
      });

      setTimeout(() => conf.remove(), (duration + delay) * 1000 + 200);
    }
  }

  setTimeout(launchConfetti, 300);
  setTimeout(launchConfetti, 1500);
  setTimeout(launchConfetti, 3000);

  /* ========== ПЕЧАТАЮЩАЯСЯ ПОДПИСЬ ========== */
  const signatureText = 'С любовью, твоя Китти ❤️';
  const typedEl = document.getElementById('typed-text');
  let charIndex = 0;

  function typeChar() {
    if (charIndex < signatureText.length) {
      typedEl.textContent += signatureText[charIndex];
      charIndex++;
      const delay = charIndex === signatureText.length ? 400 : 80;
      setTimeout(typeChar, delay);
    } else {
      setTimeout(() => {
        const cursor = document.querySelector('.cursor');
        if (cursor) cursor.style.display = 'none';
      }, 1500);
    }
  }

  // Запускаем музыку при первом действии пользователя:
  // клик мышкой, тап по экрану, нажатие клавиши, прокрутка
  ['click', 'touchstart', 'keydown', 'scroll'].forEach(eventName => {
    document.addEventListener(eventName, startMusic, { once: true });
  });

  // Также пробуем сразу — сработает, если браузер разрешит
  startMusic();
});
