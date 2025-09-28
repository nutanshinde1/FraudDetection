/* =========================
   script.js - site behavior
   ========================= */

/* Wait until DOM loaded */
document.addEventListener('DOMContentLoaded', () => {

  /* THEME */
 /* THEME TOGGLE */
const toggleButtons = document.querySelectorAll('.toggleTheme');

const applyTheme = () => {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
};

// Apply theme on page load
applyTheme();

// Add click listener to all toggle buttons
toggleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    applyTheme();
  });
});



  /* FLYING ICONS (dynamic background bubbles/icons) */
  const flyingContainer = document.getElementById('flying-icons');
  if (flyingContainer) {
    const shapes = ['●', '●', '●', '○', '◦'];
    for (let i = 0; i < 16; i++) {
      const el = document.createElement('div');
      el.className = 'fi';
      el.innerText = shapes[i % shapes.length];
      const size = 10 + Math.random() * 42;
      el.style.left = (Math.random() * 100) + '%';
      el.style.top = (Math.random() * 100) + '%';
      el.style.fontSize = `${size}px`;
      el.style.opacity = 0.06 + Math.random() * 0.22;
      el.style.animation = `floaty ${6 + Math.random() * 8}s ease-in-out ${Math.random() * 6}s infinite`;
      flyingContainer.appendChild(el);
    }
  }

  /* COUNTERS */
  const runCounters = (root = document) => {
    const counters = root.querySelectorAll('.counter, .stat-value, .big');
    counters.forEach(c => {
      if (c.dataset.run === '1') return;
      const target = Number(c.dataset.target || c.innerText || 0);
      if (!target) return;
      c.dataset.run = '1';
      let cur = 0;
      const step = Math.ceil(target / 200);
      const update = () => {
        cur += step;
        if (cur < target) {
          c.innerText = cur;
          requestAnimationFrame(update);
        } else {
          c.innerText = target;
        }
      };
      update();
    });
  };
  runCounters();

  /* ANIMATE ON SCROLL - simple intersection */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('animate');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.card, .chart-card, .section-title').forEach(n => io.observe(n));

  /* CHARTS (only if canvas present) */
  // Fraud chart (doughnut)
  const fraudCanvas = document.getElementById('fraudChart');
  if (fraudCanvas) {
    new Chart(fraudCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Fraudulent', 'Safe'],
        datasets: [{
          data: [230, 14770],
          backgroundColor: ['#ff4d4d', '#4dffb6'],
          hoverOffset: 6
        }]
      },
      options: { responsive: true, animation: {animateRotate:true}, plugins: {legend:{position:'bottom'}}}
    });
  }

  // Transaction line
  const txCanvas = document.getElementById('transactionChart');
  if (txCanvas) {
    new Chart(txCanvas, {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun'],
        datasets:[{
          label:'Transactions',
          data:[2000,2200,2500,2300,2700,3000],
          tension:0.35,
          borderColor:'#ff7a7a',
          backgroundColor:'rgba(255,122,122,0.12)',
          fill:true,
        }]
      },
      options:{responsive:true,plugins:{legend:{display:false}}}
    });
  }

  // Analytics charts
  const fraudType = document.getElementById('fraudTypeChart');
  if (fraudType) {
    new Chart(fraudType, {
      type: 'bar',
      data: {
        labels:['Card','Online','Transfer','Account takeover'],
        datasets:[{label:'Fraud Cases', data:[110,80,50,40], backgroundColor:'#ff4d4d'}]
      },
      options:{responsive:true,plugins:{legend:{display:false}}}
    });
  }

  const txVol = document.getElementById('transactionVolumeChart');
  if (txVol) {
    new Chart(txVol, {
      type: 'line',
      data:{
        labels:['Week1','Week2','Week3','Week4'],
        datasets:[{label:'Transactions',data:[500,700,600,800],tension:0.4,borderColor:'#4dffb6',backgroundColor:'rgba(77,255,182,0.12)',fill:true}]
      },
      options:{responsive:true,plugins:{legend:{display:false}}}
    });
  }

  /* UPLOAD PREVIEW (CSV simple preview using FileReader) */
  const fileInput = document.getElementById('fileInput');
  const fileDrop = document.getElementById('fileDrop');
  const previewArea = document.getElementById('previewArea');
  const previewTable = document.getElementById('previewTable');
  const uploadForm = document.getElementById('uploadForm');
  const previewBtn = document.getElementById('previewBtn');

  if (fileDrop && fileInput) {
    fileDrop.addEventListener('dragover', e => { e.preventDefault(); fileDrop.classList.add('dragover') });
    fileDrop.addEventListener('dragleave', e => { fileDrop.classList.remove('dragover') });
    fileDrop.addEventListener('drop', e => {
      e.preventDefault(); fileDrop.classList.remove('dragover');
      if (e.dataTransfer.files[0]) fileInput.files = e.dataTransfer.files;
    });
  }

  if (previewBtn) previewBtn.addEventListener('click', e => {
    e.preventDefault();
    if (!fileInput.files.length) {
      alert('Select a CSV file to preview.');
      return;
    }
    const f = fileInput.files[0];
    if (f.size > 10*1024*1024) { alert('File too large (>10MB)'); return; }
    if (!f.name.match(/\.(csv)$/i)) { alert('Only CSV preview supported in demo.'); return; }

    const reader = new FileReader();
    reader.onload = evt => {
      const txt = evt.target.result;
      const rows = txt.trim().split(/\r?\n/).slice(0, 10); // preview first 10 rows
      const table = document.createElement('table');
      table.className = 'preview-table-inner';
      rows.forEach((r, i) => {
        const tr = document.createElement('tr');
        r.split(',').forEach(cell => {
          const cellEl = i === 0 ? document.createElement('th') : document.createElement('td');
          cellEl.innerText = cell.trim();
          tr.appendChild(cellEl);
        });
        table.appendChild(tr);
      });
      previewTable.innerHTML = '';
      previewTable.appendChild(table);
      previewArea?.classList.remove('hidden');
      runCounters(previewTable);
    };
    reader.readAsText(f);
  });

  if (uploadForm) uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Demo: show a toast / simple UX. Real: send the file with fetch to backend endpoint.
    alert('Upload simulated (frontend). Connect to backend to perform real analysis.');
  });

  /* CONTACT SEND (demo) */
  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) {
    sendBtn.addEventListener('click', e => {
      e.preventDefault();
      const toast = document.getElementById('contactToast');
      toast.classList.remove('hidden');
      setTimeout(()=>toast.classList.add('hidden'), 2600);
    });
  }

  /* small helper to expose the counter runner */
  window.runCounters = runCounters;
});
