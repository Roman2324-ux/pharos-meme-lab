// ========== PHAROS MEME LAB - OPTIMIZED VERSION ==========

// CANVAS SETUP
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d', { alpha: false }); // Performance boost

let img = new Image();
let texts = [];
let currentText = null;
let isDragging = false;
let offsetX, offsetY;

// PERFORMANCE OPTIMIZATION FLAGS
let renderScheduled = false;
let canvasScale = { x: 1, y: 1 };

// ========== UTILITY FUNCTIONS ==========

// Optimized render scheduling with RAF
function scheduleRender() {
  if (!renderScheduled) {
    renderScheduled = true;
    requestAnimationFrame(() => {
      renderCanvas();
      renderScheduled = false;
    });
  }
}

// Get accurate canvas coordinates with scaling
function getCanvasCoordinates(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * canvasScale.x,
    y: (clientY - rect.top) * canvasScale.y
  };
}

// Update canvas scale ratio
function updateCanvasScale() {
  const rect = canvas.getBoundingClientRect();
  canvasScale.x = canvas.width / rect.width;
  canvasScale.y = canvas.height / rect.height;
}

// ========== IMAGE LOADING ==========
const params = new URLSearchParams(window.location.search);
const imgSrc = params.get('img');

if (imgSrc === "custom") {
  const base64 = localStorage.getItem("customImage");
  if (base64) {
    img.src = base64;
  } else {
    showPlaceholder();
  }
} else if (imgSrc) {
  img.crossOrigin = 'anonymous';
  img.src = imgSrc;
} else {
  showPlaceholder();
}

img.onload = () => {
  const containerWidth = canvas.parentElement?.clientWidth || 600;
  const maxSize = Math.min(800, containerWidth - 40);
  
  let width = img.naturalWidth;
  let height = img.naturalHeight;

  if (width > maxSize || height > maxSize) {
    if (width > height) {
      height = (height / width) * maxSize;
      width = maxSize;
    } else {
      width = (width / height) * maxSize;
      height = maxSize;
    }
  }

  canvas.width = width;
  canvas.height = height;
  
  // Set CSS size to match canvas size for proper coordinate mapping
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  
  updateCanvasScale();
  renderCanvas();
};

function showPlaceholder() {
  canvas.width = 600;
  canvas.height = 600;
  ctx.fillStyle = "#f3f4f6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#6b7280";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Choose template on home page", canvas.width / 2, canvas.height / 2);
  updateCanvasScale();
}

// ========== OPTIMIZED RENDER ==========
function renderCanvas() {
  // Clear and redraw image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  // Render all texts
  texts.forEach(t => {
    ctx.save();
    
    // Apply rotation transform
    ctx.translate(t.x, t.y);
    ctx.rotate((t.rotation * Math.PI) / 180);
    ctx.translate(-t.x, -t.y);

    // Build font style
    let fontStyle = '';
    if (t.bold) fontStyle += 'bold ';
    if (t.italic) fontStyle += 'italic ';
    ctx.font = `${fontStyle}${t.fontSize}px ${t.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = t.text.split('\n');
    const lineHeight = t.fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    const padding = t.fontSize * 0.3;

    // Apply shadow once if enabled
    if (t.shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
    }

    lines.forEach((line, i) => {
      const textWidth = ctx.measureText(line).width;
      const lineY = t.y - totalHeight / 2 + i * lineHeight + lineHeight / 2;

      // Background
      if (t.backgroundEnabled) {
        ctx.shadowColor = 'transparent'; // Disable shadow for background
        ctx.fillStyle = t.backgroundColor;
        ctx.fillRect(
          t.x - textWidth / 2 - padding,
          lineY - t.fontSize / 1.5,
          textWidth + padding * 2,
          lineHeight
        );
        // Re-enable shadow for text
        if (t.shadow) {
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
        }
      }

      // Stroke
      if (t.strokeWidth > 0) {
        ctx.lineJoin = 'round';
        ctx.strokeStyle = t.strokeColor;
        ctx.lineWidth = t.strokeWidth;
        ctx.strokeText(line, t.x, lineY);
      }

      // Text
      ctx.fillStyle = t.textColor;
      ctx.fillText(line, t.x, lineY);
    });

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.restore();
  });
}

// ========== TEXT MANAGEMENT ==========
document.getElementById('addTextBtn').addEventListener('click', () => {
  const newText = {
    text: 'NEW TEXT',
    x: canvas.width / 2,
    y: canvas.height / 2,
    fontSize: 40,
    fontFamily: 'Impact',
    textColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 3,
    bold: false,
    italic: false,
    shadow: false,
    backgroundEnabled: false,
    backgroundColor: '#000000',
    rotation: 0
  };

  texts.push(newText);
  currentText = newText;
  updateTextsList();
  syncControls(currentText);
  scheduleRender();
});

// ========== OPTIMIZED TEXT LIST UPDATE ==========
function updateTextsList() {
  const textsList = document.getElementById('textsList');
  textsList.innerHTML = '';

  if (texts.length === 0) {
    textsList.innerHTML = '<p style="text-align:center;color:#9ca3af;padding:1rem;">No texts yet. Add one!</p>';
    document.getElementById('editPanel').style.display = 'none';
    return;
  }

  texts.forEach((t) => {
    const item = document.createElement('div');
    item.className = 'text-item';
    if (t === currentText) item.classList.add('active');
    item.innerHTML = `<div class="text-preview">${t.text.slice(0, 30) || "(empty text)"}</div>`;
    item.onclick = () => {
      currentText = t;
      updateTextsList();
      syncControls(currentText);
      scheduleRender();
    };
    textsList.appendChild(item);
  });
}

// Update only preview text without full re-render
function updateTextPreview(text) {
  const activeItem = document.querySelector('.text-item.active .text-preview');
  if (activeItem && text) {
    activeItem.textContent = text.slice(0, 30) || "(empty text)";
  }
}

// ========== SYNC CONTROLS ==========
function syncControls(t) {
  if (!t) {
    document.getElementById('editPanel').style.display = 'none';
    return;
  }

  document.getElementById('editPanel').style.display = 'block';
  document.getElementById('textInput').value = t.text;
  document.getElementById('fontFamily').value = t.fontFamily;
  document.getElementById('fontSize').value = t.fontSize;
  document.getElementById('fontSizeValue').textContent = t.fontSize;
  document.getElementById('textColor').value = t.textColor;
  document.getElementById('strokeColor').value = t.strokeColor;
  document.getElementById('strokeWidth').value = t.strokeWidth;
  document.getElementById('strokeWidthValue').textContent = t.strokeWidth;
  document.getElementById('textShadow').checked = t.shadow;
  document.getElementById('textBold').checked = t.bold;
  document.getElementById('textItalic').checked = t.italic;
  document.getElementById('textBgColor').value = t.backgroundColor;
  document.getElementById('textBgEnable').checked = t.backgroundEnabled;
  document.getElementById('textRotation').value = t.rotation;
  document.getElementById('rotationValue').textContent = `${t.rotation}°`;

  // Update range backgrounds
  document.querySelectorAll('input[type="range"]').forEach(updateRangeBackground);
}

// ========== OPTIMIZED EVENT LISTENERS ==========

// Text input with debouncing
let textInputTimeout;
document.getElementById('textInput').addEventListener('input', (e) => {
  if (!currentText) return;
  currentText.text = e.target.value;
  updateTextPreview(e.target.value);
  
  clearTimeout(textInputTimeout);
  textInputTimeout = setTimeout(() => scheduleRender(), 100);
});

// Immediate updates for selects
document.getElementById('fontFamily').addEventListener('change', (e) => {
  if (!currentText) return;
  currentText.fontFamily = e.target.value;
  scheduleRender();
});

// Range sliders with RAF optimization
document.getElementById('fontSize').addEventListener('input', (e) => {
  if (!currentText) return;
  currentText.fontSize = parseInt(e.target.value);
  document.getElementById('fontSizeValue').textContent = currentText.fontSize;
  scheduleRender();
});

document.getElementById('textColor').addEventListener('input', (e) => {
  if (!currentText) return;
  currentText.textColor = e.target.value;
  scheduleRender();
});

document.getElementById('strokeColor').addEventListener('input', (e) => {
  if (!currentText) return;
  currentText.strokeColor = e.target.value;
  scheduleRender();
});

document.getElementById('strokeWidth').addEventListener('input', (e) => {
  if (!currentText) return;
  currentText.strokeWidth = parseInt(e.target.value);
  document.getElementById('strokeWidthValue').textContent = currentText.strokeWidth;
  scheduleRender();
});

document.getElementById('textBgColor').addEventListener('input', (e) => {
  if (!currentText) return;
  currentText.backgroundColor = e.target.value;
  scheduleRender();
});

document.getElementById('textRotation').addEventListener('input', (e) => {
  if (!currentText) return;
  currentText.rotation = parseInt(e.target.value);
  document.getElementById('rotationValue').textContent = `${currentText.rotation}°`;
  scheduleRender();
});

// Checkboxes - immediate render
document.getElementById('textShadow').addEventListener('change', (e) => {
  if (!currentText) return;
  currentText.shadow = e.target.checked;
  scheduleRender();
});

document.getElementById('textBold').addEventListener('change', (e) => {
  if (!currentText) return;
  currentText.bold = e.target.checked;
  scheduleRender();
});

document.getElementById('textItalic').addEventListener('change', (e) => {
  if (!currentText) return;
  currentText.italic = e.target.checked;
  scheduleRender();
});

document.getElementById('textBgEnable').addEventListener('change', (e) => {
  if (!currentText) return;
  currentText.backgroundEnabled = e.target.checked;
  scheduleRender();
});

// ========== DELETE TEXT ==========
document.getElementById('deleteTextBtn').addEventListener('click', () => {
  if (!currentText) return;
  const index = texts.indexOf(currentText);
  if (index > -1) {
    texts.splice(index, 1);
    currentText = texts.length > 0 ? texts[texts.length - 1] : null;
    updateTextsList();
    syncControls(currentText);
    scheduleRender();
    showToast('Text deleted');
  }
});

function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.remove('toast-hidden');
    toast.classList.add('toast-show');
    setTimeout(() => {
      toast.classList.remove('toast-show');
      toast.classList.add('toast-hidden');
    }, 2000);
  }
}

// ========== OPTIMIZED DRAG & DROP ==========

// Mouse events (desktop)
canvas.addEventListener('mousedown', (e) => {
  const coords = getCanvasCoordinates(e.clientX, e.clientY);
  currentText = getTextAtPos(coords.x, coords.y);
  
  if (currentText) {
    isDragging = true;
    offsetX = coords.x - currentText.x;
    offsetY = coords.y - currentText.y;
    canvas.style.cursor = 'grabbing';
    updateTextsList();
    syncControls(currentText);
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDragging || !currentText) return;
  const coords = getCanvasCoordinates(e.clientX, e.clientY);
  currentText.x = coords.x - offsetX;
  currentText.y = coords.y - offsetY;
  scheduleRender();
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  canvas.style.cursor = 'grab';
});

canvas.addEventListener('mouseleave', () => {
  if (isDragging) {
    isDragging = false;
    canvas.style.cursor = 'grab';
  }
});

// Touch events (mobile)
canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  const coords = getCanvasCoordinates(touch.clientX, touch.clientY);
  currentText = getTextAtPos(coords.x, coords.y);
  
  if (currentText) {
    isDragging = true;
    offsetX = coords.x - currentText.x;
    offsetY = coords.y - currentText.y;
    updateTextsList();
    syncControls(currentText);
  }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  if (!isDragging || !currentText) return;
  e.preventDefault();
  const touch = e.touches[0];
  const coords = getCanvasCoordinates(touch.clientX, touch.clientY);
  currentText.x = coords.x - offsetX;
  currentText.y = coords.y - offsetY;
  scheduleRender();
}, { passive: false });

canvas.addEventListener('touchend', () => {
  isDragging = false;
});

// ========== OPTIMIZED HIT DETECTION ==========
function getTextAtPos(x, y) {
  // Iterate from last (top) to first (bottom)
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    
    // Quick AABB check first
    const approxWidth = ctx.measureText(t.text).width + 20;
    const approxHeight = t.fontSize * 1.5;
    
    if (Math.abs(x - t.x) > approxWidth || Math.abs(y - t.y) > approxHeight) {
      continue; // Skip expensive calculations
    }
    
    // Detailed check with rotation
    const angle = (t.rotation * Math.PI) / 180;
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    const dx = x - t.x;
    const dy = y - t.y;
    const localX = t.x + (dx * cos - dy * sin);
    const localY = t.y + (dx * sin + dy * cos);

    ctx.font = `${t.bold ? 'bold ' : ''}${t.italic ? 'italic ' : ''}${t.fontSize}px ${t.fontFamily}`;
    const lines = t.text.split('\n');
    const lineHeight = t.fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    const hitPadding = 10;

    for (let j = 0; j < lines.length; j++) {
      const textWidth = ctx.measureText(lines[j]).width;
      const lineY = t.y - totalHeight / 2 + j * lineHeight;

      if (
        localX >= t.x - textWidth / 2 - hitPadding &&
        localX <= t.x + textWidth / 2 + hitPadding &&
        localY >= lineY - lineHeight / 2 - hitPadding &&
        localY <= lineY + lineHeight / 2 + hitPadding
      ) {
        return t;
      }
    }
  }
  return null;
}

// ========== DOWNLOAD & SHARE ==========
document.getElementById('downloadBtn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `pharos-meme-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

document.getElementById('shareBtn').addEventListener('click', () => {
  canvas.toBlob(async (blob) => {
    const twitterText = encodeURIComponent('Created with Pharos Meme Lab! 🎨');
    const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}`;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      }
      window.open(twitterUrl, '_blank');
    } catch (err) {
      console.error('Clipboard error:', err);
      window.open(twitterUrl, '_blank');
    }
  });
});

// ========== RANGE SLIDER STYLING ==========
function updateRangeBackground(slider) {
  if (!slider) return;
  const min = parseFloat(slider.min) || 0;
  const max = parseFloat(slider.max) || 100;
  const val = ((parseFloat(slider.value) - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(90deg, #0007B6 ${val}%, #e5e7eb ${val}%)`;
}

document.querySelectorAll('input[type="range"]').forEach(slider => {
  updateRangeBackground(slider);
  slider.addEventListener('input', () => updateRangeBackground(slider));
});

// ========== INITIAL SETUP ==========
canvas.style.cursor = 'grab';

// Update scale on window resize
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    updateCanvasScale();
  }, 250);
});

// ========== MOBILE CONTROLS (OPTIMIZED) ==========
let mobileControlsInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
  if (mobileControlsInitialized) return;
  mobileControlsInitialized = true;
  
  if (window.innerWidth <= 1024) {
    const toggleBtn = document.getElementById('mobileControlsToggle');
    const panel = document.getElementById('mobileControls');
    const closeBtn = document.getElementById('closeMobileControls');

    if (toggleBtn && panel && closeBtn) {
      toggleBtn.addEventListener('click', () => {
        panel.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
      
      closeBtn.addEventListener('click', () => {
        panel.classList.remove('open');
        document.body.style.overflow = '';
      });
      
      // Close on backdrop click
      panel.addEventListener('click', (e) => {
        if (e.target === panel) {
          panel.classList.remove('open');
          document.body.style.overflow = '';
        }
      });

      // Swipe down to close
      let startY = 0;
      panel.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
      }, { passive: true });
      
      panel.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        if (diff > 100 && panel.scrollTop === 0) {
          panel.classList.remove('open');
          document.body.style.overflow = '';
        }
      }, { passive: true });
    }
  }
});

// ========== DEBUG MODE (Optional) ==========
if (window.location.search.includes('debug=true')) {
  console.log('🐛 Debug mode enabled');
  window.debugCanvas = {
    texts: () => texts,
    currentText: () => currentText,
    canvasScale: () => canvasScale,
    forceRender: () => renderCanvas()
  };
}