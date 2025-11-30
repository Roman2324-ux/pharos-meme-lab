// CANVAS SETUP
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');

let img = new Image();
let texts = [];
let currentText = null;
let isDragging = false;
let offsetX, offsetY;

// LOAD IMAGE FROM URL
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
  const maxSize = 800;
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
}

// RENDER CANVAS
function renderCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  texts.forEach(t => {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate((t.rotation * Math.PI) / 180);
    ctx.translate(-t.x, -t.y);

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

    lines.forEach((line, i) => {
      const textWidth = ctx.measureText(line).width;
      const lineY = t.y - totalHeight / 2 + i * lineHeight + lineHeight / 2;

      // Background
      if (t.backgroundEnabled) {
        ctx.fillStyle = t.backgroundColor;
        ctx.fillRect(
          t.x - textWidth / 2 - padding,
          lineY - t.fontSize / 1.5,
          textWidth + padding * 2,
          lineHeight
        );
      }

      // Stroke
      if (t.strokeWidth > 0) {
        ctx.lineJoin = 'round';
        ctx.strokeStyle = t.strokeColor;
        ctx.lineWidth = t.strokeWidth;
        ctx.strokeText(line, t.x, lineY);
      }

      // Shadow
      if (t.shadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
      } else {
        ctx.shadowColor = 'transparent';
      }

      // Text
      ctx.fillStyle = t.textColor;
      ctx.fillText(line, t.x, lineY);
    });

    ctx.restore();
  });
}

// ADD NEW TEXT
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
  renderCanvas();
});

// UPDATE TEXTS LIST
function updateTextsList() {
  const textsList = document.getElementById('textsList');
  textsList.innerHTML = '';

  if (texts.length === 0) {
    textsList.innerHTML = '<p style="text-align:center;color:#9ca3af;padding:1rem;">No texts yet. Add one!</p>';
    document.getElementById('editPanel').style.display = 'none';
    return;
  }

  texts.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'text-item';
    if (t === currentText) item.classList.add('active');
    item.innerHTML = `<div class="text-preview">${t.text.slice(0, 30) || "(empty text)"}</div>`;
    item.onclick = () => {
      currentText = t;
      updateTextsList();
      syncControls(currentText);
      renderCanvas();
    };
    textsList.appendChild(item);
  });
}

// SYNC CONTROLS
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
}

// EDIT CONTROLS LISTENERS
document.getElementById('textInput').addEventListener('input', (e) => {
  if (!currentText) return;
  currentText.text = e.target.value;
  updateTextsList();
  renderCanvas();
});

document.getElementById('fontFamily').addEventListener('input', (e) => {
  if (!currentText) return;
  currentText.fontFamily = e.target.value;
  renderCanvas();
});

document.getElementById('fontSize').addEventListener('input', (e) => {
  if (!currentText) return;
  currentText.fontSize = parseInt(e.target.value);
  document.getElementById('fontSizeValue').textContent = currentText.fontSize;
  renderCanvas();
});

document.getElementById('textColor').addEventListener('input', (e) => {
  if (!currentText) return;
  currentText.textColor = e.target.value;
  renderCanvas();
});

document.getElementById('strokeColor').addEventListener('input', (e) => {
  if (!currentText) return;
  currentText.strokeColor = e.target.value;
  renderCanvas();
});

document.getElementById('strokeWidth').addEventListener('input', (e) => {
  if (!currentText) return;
  currentText.strokeWidth = parseInt(e.target.value);
  document.getElementById('strokeWidthValue').textContent = currentText.strokeWidth;
  renderCanvas();
});

document.getElementById('textBgColor').addEventListener('input', (e) => {
  if (!currentText) return;
  currentText.backgroundColor = e.target.value;
  renderCanvas();
});

document.getElementById('textRotation').addEventListener('input', (e) => {
  if (!currentText) return;
  currentText.rotation = parseInt(e.target.value);
  document.getElementById('rotationValue').textContent = `${currentText.rotation}°`;
  renderCanvas();
});

document.getElementById('textShadow').addEventListener('change', (e) => {
  if (!currentText) return;
  currentText.shadow = e.target.checked;
  renderCanvas();
});

document.getElementById('textBold').addEventListener('change', (e) => {
  if (!currentText) return;
  currentText.bold = e.target.checked;
  renderCanvas();
});

document.getElementById('textItalic').addEventListener('change', (e) => {
  if (!currentText) return;
  currentText.italic = e.target.checked;
  renderCanvas();
});

document.getElementById('textBgEnable').addEventListener('change', (e) => {
  if (!currentText) return;
  currentText.backgroundEnabled = e.target.checked;
  renderCanvas();
});

// DELETE TEXT
document.getElementById('deleteTextBtn').addEventListener('click', () => {
  if (!currentText) return;
  const index = texts.indexOf(currentText);
  if (index > -1) {
    texts.splice(index, 1);
    currentText = null;
    updateTextsList();
    syncControls(null);
    renderCanvas();
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

// MOUSE DRAG (DESKTOP)
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  currentText = getTextAtPos(mouseX, mouseY);
  if (currentText) {
    isDragging = true;
    offsetX = mouseX - currentText.x;
    offsetY = mouseY - currentText.y;
    canvas.style.cursor = 'grabbing';
    updateTextsList();
    syncControls(currentText);
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDragging || !currentText) return;
  const rect = canvas.getBoundingClientRect();
  currentText.x = e.clientX - rect.left - offsetX;
  currentText.y = e.clientY - rect.top - offsetY;
  renderCanvas();
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  canvas.style.cursor = 'grab';
});

canvas.addEventListener('mouseleave', () => {
  isDragging = false;
  canvas.style.cursor = 'grab';
});

// TOUCH DRAG (MOBILE)
canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const touchX = touch.clientX - rect.left;
  const touchY = touch.clientY - rect.top;

  currentText = getTextAtPos(touchX, touchY);
  if (currentText) {
    isDragging = true;
    offsetX = touchX - currentText.x;
    offsetY = touchY - currentText.y;
    updateTextsList();
    syncControls(currentText);
  }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  if (!isDragging || !currentText) return;
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  currentText.x = touch.clientX - rect.left - offsetX;
  currentText.y = touch.clientY - rect.top - offsetY;
  renderCanvas();
}, { passive: false });

canvas.addEventListener('touchend', () => {
  isDragging = false;
});

// GET TEXT AT POSITION (WITH ROTATION SUPPORT)
function getTextAtPos(x, y) {
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    
    // Transform mouse coordinates to text local space
    const angle = (t.rotation * Math.PI) / 180;
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    const dx = x - t.x;
    const dy = y - t.y;
    const localX = t.x + (dx * cos - dy * sin);
    const localY = t.y + (dx * sin + dy * cos);

    ctx.font = `${t.fontSize}px ${t.fontFamily}`;
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

// DOWNLOAD MEME
document.getElementById('downloadBtn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `pharos-meme-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// SHARE TO X (TWITTER)
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

// SLIDER GRADIENT UPDATE
document.querySelectorAll('input[type="range"]').forEach(slider => {
  const updateSlider = () => {
    const val = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(90deg, #0007B6 ${val}%, #e5e7eb ${val}%)`;
  };
  updateSlider();
  slider.addEventListener('input', updateSlider);
});

// INITIAL CURSOR
canvas.style.cursor = 'grab';

// МОБІЛЬНА ПАНЕЛЬ КЕРУВАННЯ — ВАЖЛИВО!
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 1024) {
    const toggleBtn = document.getElementById('mobileControlsToggle');
    const panel = document.getElementById('mobileControls');
    const closeBtn = document.getElementById('closeMobileControls');

    if (toggleBtn && panel && closeBtn) {
      toggleBtn.addEventListener('click', () => panel.classList.add('open'));
      closeBtn.addEventListener('click', () => panel.classList.remove('open'));
      
      // Закриття по кліку поза панеллю
      panel.addEventListener('click', (e) => {
        if (e.target === panel) panel.classList.remove('open');
      });

      // (опціонально) Закриття по свайпу вниз
      let startY = 0;
      panel.addEventListener('touchstart', (e) => startY = e.touches[0].clientY);
      panel.addEventListener('touchmove', (e) => {
        if (e.touches[0].clientY - startY > 80) panel.classList.remove('open');
      });
    }
  }
});
