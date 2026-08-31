/* ── FinCalc Pro — Charts ── */
const FinCharts = (() => {

  // Apply global Chart.js defaults
  if (typeof Chart !== 'undefined') {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 11;
  }

  const C = {
    accent:  '#6366f1',
    accentA: 'rgba(99,102,241,0.15)',
    green:   '#22c55e',
    red:     '#ef4444',
    gold:    '#f59e0b',
    purple:  '#a78bfa',
    teal:    '#2dd4bf',
    orange:  '#fb923c',
    grid:    'rgba(255,255,255,0.04)',
    muted:   '#94a3b8'
  };

  const colorMap = { blue: C.accent, orange: C.orange, purple: C.purple, teal: C.teal };

  function colorFor(name) {
    return colorMap[name] || C.accent;
  }

  /* ─ Canvas Sparkline ─────────────────────── */
  function drawSparkline(canvas, data, color) {
    if (!canvas || !data || data.length < 2) return;
    color = color || C.accent;

    const dpr = window.devicePixelRatio || 1;
    const w   = canvas.offsetWidth  || canvas.width  || 100;
    const h   = canvas.offsetHeight || canvas.height || 40;

    canvas.width  = w * dpr;
    canvas.height = h * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const min  = Math.min(...data);
    const max  = Math.max(...data);
    const rng  = max - min || 1;
    const pad  = 3;

    const pts = data.map((v, i) => ({
      x: pad + (i / (data.length - 1)) * (w - pad * 2),
      y: h - pad - ((v - min) / rng) * (h - pad * 2)
    }));

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + '44');
    grad.addColorStop(1, color + '00');

    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    ctx.moveTo(pts[0].x, h);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cp = (pts[i - 1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cp, pts[i-1].y, cp, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.8;
    ctx.stroke();
  }

  /* ─ Destroy existing chart on canvas ─────── */
  function destroyChart(canvas) {
    if (canvas && canvas._fcChart) {
      canvas._fcChart.destroy();
      canvas._fcChart = null;
    }
  }

  /* ─ Donut — EMI Breakdown ─────────────────── */
  function createDonut(canvasId, principal, interest) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    destroyChart(canvas);

    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Principal', 'Total Interest'],
        datasets: [{
          data: [Math.round(principal), Math.round(interest)],
          backgroundColor: [C.accent, C.red + 'cc'],
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        cutout: '70%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ₹${Number(ctx.parsed).toLocaleString('en-IN')}`
            }
          }
        },
        animation: { animateScale: true, duration: 700 }
      }
    });

    canvas._fcChart = chart;
    return chart;
  }

  /* ─ FD/PPF Donut ──────────────────────────── */
  function createSavingsDonut(canvasId, principal, interest) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    destroyChart(canvas);

    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Principal', 'Interest'],
        datasets: [{
          data: [Math.round(principal), Math.round(interest)],
          backgroundColor: [C.accent, C.green + 'cc'],
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        cutout: '70%', responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ₹${Number(ctx.parsed).toLocaleString('en-IN')}` } }
        },
        animation: { animateScale: true, duration: 700 }
      }
    });

    canvas._fcChart = chart;
    return chart;
  }

  /* ─ Growth Line Chart — SIP / Lumpsum ─────── */
  function createGrowthChart(canvasId, labels, investedData, valueData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    destroyChart(canvas);

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Invested',
            data: investedData,
            borderColor: C.muted,
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderDash: [5, 4],
            pointRadius: 0,
            tension: 0.3
          },
          {
            label: 'Value',
            data: valueData,
            borderColor: C.accent,
            backgroundColor: C.accentA,
            borderWidth: 2.5,
            pointRadius: 0,
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ₹${Number(ctx.parsed.y).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
            }
          }
        },
        scales: {
          x: { grid: { color: C.grid }, ticks: { maxTicksLimit: 6, color: C.muted } },
          y: {
            grid: { color: C.grid },
            ticks: {
              color: C.muted,
              callback: v =>
                v >= 1e7 ? `₹${(v/1e7).toFixed(1)}Cr` :
                v >= 1e5 ? `₹${(v/1e5).toFixed(0)}L`  :
                v >= 1e3 ? `₹${(v/1e3).toFixed(0)}K`  : `₹${v}`
            }
          }
        }
      }
    });

    canvas._fcChart = chart;
    return chart;
  }

  /* ─ Amortization Chart — Principal Paid vs Remaining Balance ── */
  function createAmortizationChart(canvasId, labels, principalPaidData, balanceData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    destroyChart(canvas);

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Principal Paid',
            data: principalPaidData,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            borderWidth: 2.5,
            pointRadius: labels.length > 20 ? 0 : 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#2563eb',
            fill: true,
            tension: 0.25
          },
          {
            label: 'Remaining Balance',
            data: balanceData,
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22, 163, 74, 0.06)',
            borderWidth: 2.5,
            borderDash: [5, 4],
            pointRadius: labels.length > 20 ? 0 : 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#16a34a',
            fill: true,
            tension: 0.25
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ₹${Number(ctx.parsed.y).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { maxTicksLimit: 8, color: C.muted, font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: {
              color: C.muted,
              font: { size: 11 },
              callback: v =>
                v >= 1e7 ? `₹${(v/1e7).toFixed(1)}Cr` :
                v >= 1e5 ? `₹${(v/1e5).toFixed(0)}L`  :
                v >= 1e3 ? `₹${(v/1e3).toFixed(0)}K`  : `₹${v}`
            }
          }
        }
      }
    });

    canvas._fcChart = chart;
    return chart;
  }

  return { drawSparkline, createDonut, createSavingsDonut, createGrowthChart, createAmortizationChart, colorFor };
})();
