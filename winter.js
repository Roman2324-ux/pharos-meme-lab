// ========== ЗИМОВА ТЕМА - PHAROS MEME LAB ==========

// ========== ПАДАЮЧИЙ СНІГ ==========
function createSnowfall() {
  const snowContainer = document.createElement('div');
  snowContainer.className = 'snow-container';
  document.body.appendChild(snowContainer);

  const snowflakeSymbols = ['❄', '❅', '❆'];
  const numberOfFlakes = window.innerWidth < 768 ? 30 : 50;

  for (let i = 0; i < numberOfFlakes; i++) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.textContent = snowflakeSymbols[Math.floor(Math.random() * snowflakeSymbols.length)];
    
    // Випадкова позиція по горизонталі
    snowflake.style.left = Math.random() * 100 + '%';
    
    // Випадкова швидкість анімації
    const duration = Math.random() * 10 + 10; // 10-20 секунд
    snowflake.style.animationDuration = duration + 's';
    
    // Випадкова затримка старту
    snowflake.style.animationDelay = Math.random() * 5 + 's';
    
    // Випадковий розмір
    const size = Math.random() * 0.8 + 0.6; // 0.6 - 1.4em
    snowflake.style.fontSize = size + 'em';
    
    // Випадкова прозорість
    snowflake.style.opacity = Math.random() * 0.5 + 0.5; // 0.5 - 1
    
    snowContainer.appendChild(snowflake);
  }
}

// ========== РІЗДВЯНІ ГІРЛЯНДИ ==========
function createChristmasLights() {
  const header = document.querySelector('header');
  if (!header) return;

  const lightsContainer = document.createElement('div');
  lightsContainer.className = 'christmas-lights';
  
  const wire = document.createElement('div');
  wire.className = 'lights-wire';
  lightsContainer.appendChild(wire);

  const colors = ['red', 'yellow', 'blue', 'green', 'purple', 'pink'];
  const numberOfLights = window.innerWidth < 768 ? 12 : 20;
  const spacing = 100 / (numberOfLights - 1);

  for (let i = 0; i < numberOfLights; i++) {
    const light = document.createElement('div');
    light.className = `light-bulb light-${colors[i % colors.length]}`;
    light.style.left = (spacing * i) + '%';
    
    // Випадкова затримка для мерехтіння
    light.style.animationDelay = `${Math.random() * 2}s, ${Math.random() * 3}s`;
    
    lightsContainer.appendChild(light);
  }

  header.style.position = 'relative';
  header.appendChild(lightsContainer);
  
  // Додаємо клас для зимового хедера
  header.classList.add('winter-header');
}

// ========== СНІГ НА КОНТЕЙНЕРАХ ==========
function addSnowToContainers() {
  const gallery = document.querySelector('.gallery');
  const editorContainer = document.querySelector('.editor-container');
  const footer = document.querySelector('.footer-enhanced');

  if (gallery) {
    gallery.classList.add('winter-snow-top');
  }

  if (editorContainer) {
    editorContainer.classList.add('winter-snow-top');
  }

  if (footer) {
    footer.classList.add('winter-footer');
  }

  // Додаємо зимовий ефект до кнопок
  document.querySelectorAll('.gradient-animate').forEach(btn => {
    btn.classList.add('winter-glow');
  });

  // Додаємо зимовий ефект до canvas
  const canvas = document.getElementById('memeCanvas');
  if (canvas) {
    canvas.classList.add('winter-canvas');
  }

  // Додаємо зимовий toast
  const toast = document.getElementById('toast');
  if (toast) {
    toast.classList.add('winter-toast');
  }
}

// ========== ІСКРИ (SPARKLES) ==========
function createSparkles() {
  const sparkleInterval = setInterval(() => {
    // Обмежуємо кількість іскор на екрані
    const existingSparkles = document.querySelectorAll('.sparkle');
    if (existingSparkles.length > 15) {
      existingSparkles[0].remove();
    }

    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    
    // Випадкова позиція
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    
    // Випадкова затримка анімації
    sparkle.style.animationDelay = Math.random() * 2 + 's';
    sparkle.style.animationDuration = (Math.random() * 2 + 1) + 's';
    
    document.body.appendChild(sparkle);
    
    // Видалити після завершення анімації
    setTimeout(() => {
      sparkle.remove();
    }, 3000);
  }, 2000); // Нова іскра кожні 2 секунди

  // Зберігаємо інтервал для можливості зупинки
  return sparkleInterval;
}

// ========== ЗИМОВИЙ КУРСОР ==========
function enableWinterCursor() {
  document.body.classList.add('winter-theme');
}

// ========== ЕФЕКТ ХОВЕРА ДЛЯ ШАБЛОНІВ ==========
function addWinterHoverEffects() {
  document.querySelectorAll('.templates a').forEach(template => {
    template.classList.add('winter-hover');
  });
}

// ========== ІНІЦІАЛІЗАЦІЯ ЗИМОВОЇ ТЕМИ ==========
function initWinterTheme() {
  console.log('🎄 Ініціалізація зимової теми...');
  
  // Перевірка на prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion) {
    createSnowfall();
    createSparkles();
  }
  
  createChristmasLights();
  addSnowToContainers();
  addWinterHoverEffects();
  
  // Опціонально: зимовий курсор (можна закоментувати якщо не потрібно)
  // enableWinterCursor();
  
  console.log('❄️ Зимова тема активована!');
}

// ========== ВИМКНЕННЯ ЗИМОВОЇ ТЕМИ ==========
function disableWinterTheme() {
  // Видалити сніг
  const snowContainer = document.querySelector('.snow-container');
  if (snowContainer) snowContainer.remove();
  
  // Видалити гірлянди
  const lights = document.querySelector('.christmas-lights');
  if (lights) lights.remove();
  
  // Видалити іскри
  document.querySelectorAll('.sparkle').forEach(s => s.remove());
  
  // Видалити класи
  document.querySelectorAll('.winter-snow-top, .winter-header, .winter-footer, .winter-glow, .winter-canvas, .winter-toast, .winter-hover').forEach(el => {
    el.classList.remove('winter-snow-top', 'winter-header', 'winter-footer', 'winter-glow', 'winter-canvas', 'winter-toast', 'winter-hover');
  });
  
  document.body.classList.remove('winter-theme');
  
  console.log('🌸 Зимова тема вимкнена');
}

// ========== АВТОЗАПУСК ПРИ ЗАВАНТАЖЕННІ ==========
document.addEventListener('DOMContentLoaded', () => {
  // Автоматично запустити зимову тему
  initWinterTheme();
  
  // Опціонально: додати кнопку для вмикання/вимикання
  // createToggleButton();
});

// ========== ОПЦІОНАЛЬНА КНОПКА TOGGLE (якщо потрібно) ==========
function createToggleButton() {
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = '❄️';
  toggleBtn.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #4a90e2, #7eb8ff);
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(74, 144, 226, 0.4);
    z-index: 10000;
    transition: transform 0.3s ease;
  `;
  
  let isWinterActive = true;
  
  toggleBtn.addEventListener('click', () => {
    if (isWinterActive) {
      disableWinterTheme();
      toggleBtn.textContent = '🌸';
      toggleBtn.style.background = 'linear-gradient(135deg, #ff6b9d, #ffa5c4)';
    } else {
      initWinterTheme();
      toggleBtn.textContent = '❄️';
      toggleBtn.style.background = 'linear-gradient(135deg, #4a90e2, #7eb8ff)';
    }
    isWinterActive = !isWinterActive;
  });
  
  toggleBtn.addEventListener('mouseenter', () => {
    toggleBtn.style.transform = 'scale(1.1) rotate(15deg)';
  });
  
  toggleBtn.addEventListener('mouseleave', () => {
    toggleBtn.style.transform = 'scale(1) rotate(0deg)';
  });
  
  document.body.appendChild(toggleBtn);
}

// ========== ЕКСПОРТ ФУНКЦІЙ (якщо потрібно використовувати окремо) ==========
window.winterTheme = {
  init: initWinterTheme,
  disable: disableWinterTheme,
  createToggle: createToggleButton
};