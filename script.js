// ══════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════
const API_BASE_URL = (() => {
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      return "http://127.0.0.1:8000";
    if (window.location.protocol === "file:")
      return "http://127.0.0.1:8000";
  }
  return "https://nyc-airbnb-room-type-predictor.onrender.com";
})();
const PREDICT_ENDPOINT = `${API_BASE_URL}/predict`;
const HEALTH_ENDPOINT  = `${API_BASE_URL}/`;
const REDUCE_MOTION    = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Room type metadata
const ROOM_CLASSES = [
  { key: "Entire home/apt",  label: "Entire Home",   emoji: "🏠", rows: 6, cols: 2, width: 60, color: "#FFB454" },
  { key: "Private room",     label: "Private Room",  emoji: "🛏️", rows: 4, cols: 2, width: 50, color: "#4FD1C5" },
  { key: "Shared room",      label: "Shared Room",   emoji: "👥", rows: 2, cols: 2, width: 40, color: "#9F7AEA" },
];

const EXAMPLES = [
  {
    latitude: 40.7484, longitude: -73.9857, price: 120, minimum_nights: 2,
    number_of_reviews: 84, reviews_per_month: 2.3,
    calculated_host_listings_count: 1, availability_365: 210,
    neighbourhood_group: "Manhattan", neighbourhood: "Midtown",
  },
  {
    latitude: 40.6782, longitude: -73.9442, price: 55, minimum_nights: 1,
    number_of_reviews: 210, reviews_per_month: 4.1,
    calculated_host_listings_count: 3, availability_365: 300,
    neighbourhood_group: "Brooklyn", neighbourhood: "Bedford-Stuyvesant",
  },
  {
    latitude: 40.7282, longitude: -73.7949, price: 38, minimum_nights: 3,
    number_of_reviews: 12, reviews_per_month: 0.6,
    calculated_host_listings_count: 1, availability_365: 90,
    neighbourhood_group: "Queens", neighbourhood: "Flushing",
  },
];
let exampleIndex = 0;

// ══════════════════════════════════════════════════════════════
// PARTICLE CANVAS — floating dots in the background
// ══════════════════════════════════════════════════════════════
function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas || REDUCE_MOTION) return;
  const ctx = canvas.getContext("2d");

  let W, H;
  const particles = [];
  const COUNT = 70;
  let mouseX = -9999, mouseY = -9999;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Track mouse for subtle repel effect
  window.addEventListener("mousemove", e => { mouseX = e.clientX; mouseY = e.clientY; });

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * (W || 1200),
      y: Math.random() * (H || 800),
      r: 0.5 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -0.06 - Math.random() * 0.16,
      opacity: 0.08 + Math.random() * 0.45,
      baseOpacity: 0.08 + Math.random() * 0.45,
      hue: Math.random() < 0.5 ? "#FFB454" : "#4FD1C5",
      pulse: Math.random() * Math.PI * 2,
    });
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    const t = Date.now() * 0.001;
    for (const p of particles) {
      // Subtle mouse repel
      const dx = p.x - mouseX, dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        p.x += (dx / dist) * 0.6;
        p.y += (dy / dist) * 0.6;
      }

      p.x += p.vx; p.y += p.vy;
      p.pulse += 0.02;
      p.opacity = p.baseOpacity * (0.7 + 0.3 * Math.sin(p.pulse));

      if (p.y < -8)    { p.y = H + 8; p.x = Math.random() * W; }
      if (p.x < -8)    p.x = W + 8;
      if (p.x > W + 8) p.x = -8;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.hue;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  tick();
}

// ══════════════════════════════════════════════════════════════
// SKYLINE WINDOW LIGHTS
// ══════════════════════════════════════════════════════════════
function buildSkylineLights() {
  const container = document.getElementById("skylineBg");
  if (!container || REDUCE_MOTION) return;
  const count = 70;
  for (let i = 0; i < count; i++) {
    const light = document.createElement("div");
    light.className = "window-light";
    const size = Math.random() < 0.5 ? 2 : 3;
    const colors = ["#FFB454", "#4FD1C5", "#9F7AEA", "#FC8181"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    light.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      bottom:${4 + Math.random() * 38}vh;
      animation-delay:${Math.random() * 8}s;
      animation-duration:${2 + Math.random() * 5}s;
      background: ${color};
      box-shadow: 0 0 6px 2px ${color}88;
    `;
    container.appendChild(light);
  }
}

// ══════════════════════════════════════════════════════════════
// ANIMATED HERO COUNTERS
// ══════════════════════════════════════════════════════════════
function animateCounters() {
  if (REDUCE_MOTION) return;
  const statCards = document.querySelectorAll(".stat-card");
  const targets = [
    { el: statCards[0]?.querySelector(".stat-value"), start: 0, end: 48, suffix: "K+", duration: 1600 },
    { el: statCards[1]?.querySelector(".stat-value"), start: 0, end: 3, suffix: "", duration: 800 },
  ];

  targets.forEach(({ el, start, end, suffix, duration }) => {
    if (!el) return;
    const startTime = performance.now();
    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const val = Math.round(start + (end - start) * ease);
      el.textContent = val + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  });
}

// ══════════════════════════════════════════════════════════════
// MOUSE PARALLAX ON HERO
// ══════════════════════════════════════════════════════════════
function initParallax() {
  if (REDUCE_MOTION) return;
  const aurora = document.querySelector(".aurora");
  let tX = 0, tY = 0, cX = 0, cY = 0;

  window.addEventListener("mousemove", e => {
    tX = (e.clientX / window.innerWidth - 0.5) * 20;
    tY = (e.clientY / window.innerHeight - 0.5) * 12;
  });

  function frame() {
    cX += (tX - cX) * 0.05;
    cY += (tY - cY) * 0.05;
    if (aurora) {
      aurora.style.transform = `translate(${cX}px, ${cY}px)`;
    }
    requestAnimationFrame(frame);
  }
  frame();
}

// ══════════════════════════════════════════════════════════════
// RANGE SLIDER — live gradient fill
// ══════════════════════════════════════════════════════════════
const availabilityInput = document.getElementById("availability_365");
const availabilityValue = document.getElementById("availabilityValue");

function updateRange() {
  const pct = (availabilityInput.value / 365) * 100;
  availabilityInput.style.setProperty("--pct", `${pct}%`);
  availabilityValue.textContent = availabilityInput.value;
}

availabilityInput.addEventListener("input", updateRange);
updateRange();

// ══════════════════════════════════════════════════════════════
// STEP INDICATORS — activate based on field interaction
// ══════════════════════════════════════════════════════════════
const step1 = document.getElementById("step1pill");
const step2 = document.getElementById("step2pill");
const step3 = document.getElementById("step3pill");

function updateSteps() {
  const s1done = ["latitude","longitude","neighbourhood_group","neighbourhood"]
    .every(id => document.getElementById(id)?.value.trim());
  const s2done = ["price","minimum_nights"]
    .every(id => document.getElementById(id)?.value.trim());
  const s3done = ["number_of_reviews","reviews_per_month","calculated_host_listings_count"]
    .every(id => document.getElementById(id)?.value.trim());

  setStep(step1, s1done ? "done" : "active");
  setStep(step2, s2done ? "done" : s1done ? "active" : "");
  setStep(step3, s3done ? "done" : s2done ? "active" : "");
}

function setStep(el, state) {
  if (!el) return;
  el.classList.toggle("done",   state === "done");
  el.classList.toggle("active", state === "active");
}

document.getElementById("predictForm").querySelectorAll("input, select")
  .forEach(el => el.addEventListener("input", updateSteps));

// ══════════════════════════════════════════════════════════════
// EXAMPLE FILLER
// ══════════════════════════════════════════════════════════════
const exampleBtn = document.getElementById("exampleBtn");
const form       = document.getElementById("predictForm");
const formError  = document.getElementById("formError");

exampleBtn.addEventListener("click", () => {
  const data = EXAMPLES[exampleIndex % EXAMPLES.length];
  exampleIndex++;

  // Ripple effect on button
  exampleBtn.classList.add("btn-ripple");
  setTimeout(() => exampleBtn.classList.remove("btn-ripple"), 400);

  Object.entries(data).forEach(([key, value], i) => {
    const el = form.elements[key];
    if (!el) return;
    // Staggered fill animation
    setTimeout(() => {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.style.transition = "border-color 0.3s, transform 0.2s, background 0.3s";
      el.style.borderColor = "rgba(255,180,84,0.8)";
      el.style.background  = "rgba(255,180,84,0.05)";
      el.style.transform   = "scale(1.01)";
      setTimeout(() => {
        el.style.borderColor = "";
        el.style.background  = "";
        el.style.transform   = "";
      }, 600);
    }, i * 40);
  });

  updateRange();
  formError.textContent = "";
  updateSteps();
});

// ══════════════════════════════════════════════════════════════
// FORM SUBMISSION
// ══════════════════════════════════════════════════════════════
const predictBtn = document.getElementById("predictBtn");
const resetBtn   = document.getElementById("resetBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.textContent = "";
  if (!form.reportValidity()) {
    // Shake the form on validation fail
    form.classList.add("form-shake");
    setTimeout(() => form.classList.remove("form-shake"), 500);
    return;
  }

  const payload = collectPayload();
  setLoading(true);

  try {
    const res = await fetch(PREDICT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.detail ? formatDetail(body.detail) : `Request failed (${res.status}).`);
    }

    const result = await res.json();
    renderResult(result);
    updateSteps();
  } catch (err) {
    formError.textContent = err.message?.includes("fetch")
      ? "Can't reach the prediction API. Make sure the FastAPI server is running."
      : err.message || "Something went wrong. Check the values and try again.";
    // Shake error
    formError.classList.add("error-shake");
    setTimeout(() => formError.classList.remove("error-shake"), 400);
  } finally {
    setLoading(false);
  }
});

function collectPayload() {
  const fd = new FormData(form);
  return {
    latitude:                       parseFloat(fd.get("latitude")),
    longitude:                      parseFloat(fd.get("longitude")),
    price:                          parseFloat(fd.get("price")),
    minimum_nights:                 parseInt(fd.get("minimum_nights"), 10),
    number_of_reviews:              parseInt(fd.get("number_of_reviews"), 10),
    reviews_per_month:              parseFloat(fd.get("reviews_per_month")),
    calculated_host_listings_count: parseInt(fd.get("calculated_host_listings_count"), 10),
    availability_365:               parseInt(fd.get("availability_365"), 10),
    neighbourhood_group:            fd.get("neighbourhood_group"),
    neighbourhood:                  fd.get("neighbourhood"),
  };
}

function formatDetail(detail) {
  if (Array.isArray(detail)) return detail.map(d => d.msg || JSON.stringify(d)).join(" ");
  return String(detail);
}

function setLoading(on) {
  predictBtn.disabled = on;
  predictBtn.classList.toggle("loading", on);
}

// ══════════════════════════════════════════════════════════════
// RESULT RENDERING
// ══════════════════════════════════════════════════════════════
const resultEmpty   = document.getElementById("resultEmpty");
const resultContent = document.getElementById("resultContent");
const predictedName = document.getElementById("predictedName");
const buildingsRow  = document.getElementById("buildingsRow");
const probList      = document.getElementById("probList");
const resultBadge   = document.getElementById("resultBadge");
const badgeIcon     = document.getElementById("badgeIcon");
const badgeConf     = document.getElementById("badgeConfidence");

function renderResult(result) {
  const predicted = result.Predicted_room_type;
  const probs     = result.Probability;

  // Map probabilities to room classes (sklearn sorts classes alphabetically:
  // Entire home/apt, Private room, Shared room)
  const CLASS_ORDER = ["Entire home/apt", "Private room", "Shared room"];
  const paired = ROOM_CLASSES.map(cls => {
    const idx = CLASS_ORDER.indexOf(cls.key);
    return { ...cls, prob: idx >= 0 && probs[idx] != null ? probs[idx] : 0 };
  }).sort((a, b) => b.prob - a.prob);  // sort by prob desc

  // Find the predicted one
  const winner = ROOM_CLASSES.find(r => r.key === predicted) || ROOM_CLASSES[0];

  // Animate out empty state
  resultEmpty.style.transition = "opacity 0.3s, transform 0.3s";
  resultEmpty.style.opacity    = "0";
  resultEmpty.style.transform  = "translateY(-10px) scale(0.97)";

  setTimeout(() => {
    resultEmpty.hidden   = true;
    resultContent.hidden = false;
    resetBtn.hidden      = false;
    resultEmpty.style.opacity    = "";
    resultEmpty.style.transform  = "";

    // Force animation re-run
    resultContent.style.animation = "none";
    void resultContent.offsetHeight;
    resultContent.style.animation = "";

    // Badge
    predictedName.textContent = winner.label;
    badgeIcon.textContent      = winner.emoji;
    badgeIcon.style.background = winner.color + "22";
    badgeIcon.style.borderColor = winner.color;
    badgeIcon.style.boxShadow  = `0 0 32px ${winner.color}66`;
    resultBadge.style.borderColor = winner.color + "44";
    resultBadge.style.background  = `linear-gradient(135deg, ${winner.color}12, rgba(79,209,197,0.04))`;

    // Animated confidence counter
    const topProb = winner.prob;
    animateConfidence(badgeConf, topProb);

    // Buildings
    buildBuildings(paired, predicted);

    // Prob bars
    buildProbBars(paired, predicted);

    // Scroll result panel into view (mobile)
    if (window.innerWidth < 960) {
      resultContent.closest(".panel").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, REDUCE_MOTION ? 0 : 320);
}

// Animate confidence % counter
function animateConfidence(el, targetProb) {
  if (REDUCE_MOTION) {
    el.textContent = `${Math.round(targetProb * 100)}% confidence`;
    return;
  }
  const duration = 1200;
  const startTime = performance.now();
  const update = (now) => {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    const val      = Math.round(targetProb * 100 * ease);
    el.textContent = `${val}% confidence`;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// ── Buildings ───────────────────────────────────────────────
function buildBuildings(paired, predicted) {
  buildingsRow.innerHTML = "";

  paired.forEach((cls, i) => {
    const maxH = 135;
    const minH = 30;
    const h    = Math.round(minH + cls.prob * (maxH - minH));
    const isWinner = cls.key === predicted;

    const col = document.createElement("div");
    col.className = "building-col";
    col.style.flex = "1";

    const bld = document.createElement("div");
    bld.className = "building" + (isWinner ? " lit" : "");
    bld.style.width         = `${cls.width}px`;
    bld.style.borderRadius  = "5px 5px 0 0";

    // Start from minimum height
    bld.style.height = `${minH}px`;
    if (isWinner) {
      bld.style.borderColor = cls.color + "66";
      bld.style.boxShadow   = `0 0 40px -8px ${cls.color}55, 0 -4px 20px -4px ${cls.color}33`;
    }

    const rowCount = cls.rows;
    const colCount = cls.cols;
    for (let r = 0; r < rowCount; r++) {
      for (let c = 0; c < colCount; c++) {
        const win = document.createElement("div");
        win.className = "win";
        if (isWinner) {
          win.style.background = cls.color;
          win.style.boxShadow  = `0 0 6px 1px ${cls.color}88`;
          // Stagger window glow-in
          win.style.opacity    = "0";
          win.style.transition = `opacity 0.3s ${0.8 + (r * colCount + c) * 0.05}s`;
          setTimeout(() => { win.style.opacity = "1"; }, 100);
        }
        bld.appendChild(win);
      }
    }

    // Antenna on tallest building
    if (i === 0) {
      const ant = document.createElement("div");
      ant.className = "bld-antenna";
      bld.appendChild(ant);
    }

    const cap = document.createElement("div");
    cap.className   = "building-caption";
    cap.textContent = cls.label;
    if (isWinner) cap.style.color = cls.color;

    // Prob label above building
    const probLabel = document.createElement("div");
    probLabel.className = "building-prob";
    probLabel.textContent = `${Math.round(cls.prob * 100)}%`;
    probLabel.style.color = isWinner ? cls.color : "var(--text-faint)";

    col.appendChild(probLabel);
    col.appendChild(bld);
    col.appendChild(cap);
    buildingsRow.appendChild(col);

    // Animate height with stagger
    if (!REDUCE_MOTION) {
      setTimeout(() => {
        bld.style.transition = `height 1.1s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s, box-shadow 0.6s`;
        bld.style.height = `${h}px`;
      }, 30);
    } else {
      bld.style.height = `${h}px`;
    }
  });
}

// ── Prob bars ───────────────────────────────────────────────
function buildProbBars(paired, predicted) {
  probList.innerHTML = "";

  paired.forEach((cls, i) => {
    const isTop = cls.key === predicted;
    const pct   = Math.round(cls.prob * 100);

    const row = document.createElement("div");
    row.className = "prob-row" + (isTop ? " top" : "");
    // Color indicator strip
    if (!isTop) row.style.setProperty("--row-color", cls.color);

    const meta = document.createElement("div");
    meta.className = "prob-meta";

    const nameWrap = document.createElement("div");
    nameWrap.style.display = "flex";
    nameWrap.style.alignItems = "center";
    nameWrap.style.gap = "8px";

    const dot = document.createElement("span");
    dot.style.cssText = `
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
      background: ${cls.color}; box-shadow: 0 0 6px ${cls.color}88;
    `;

    const name = document.createElement("span");
    name.className   = "prob-name";
    name.textContent = cls.label;

    nameWrap.appendChild(dot);
    nameWrap.appendChild(name);

    const valEl = document.createElement("span");
    valEl.className = "prob-value";
    // Animate the number
    if (!REDUCE_MOTION) {
      const start = performance.now();
      const dur = 900 + i * 200;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        valEl.textContent = `${Math.round(pct * e)}%`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } else {
      valEl.textContent = `${pct}%`;
    }

    meta.appendChild(nameWrap);
    meta.appendChild(valEl);

    const track = document.createElement("div");
    track.className = "prob-track";

    const fill = document.createElement("div");
    fill.className = "prob-fill";
    if (isTop) {
      fill.style.background = `linear-gradient(90deg, ${cls.color}cc, ${cls.color})`;
    } else {
      fill.style.background = `linear-gradient(90deg, ${cls.color}55, ${cls.color}99)`;
    }
    track.appendChild(fill);

    row.appendChild(meta);
    row.appendChild(track);
    probList.appendChild(row);

    // Animate bar with stagger
    requestAnimationFrame(() => {
      setTimeout(() => { fill.style.width = `${pct}%`; }, REDUCE_MOTION ? 0 : 120 + i * 150);
    });
  });
}

// ══════════════════════════════════════════════════════════════
// RESET
// ══════════════════════════════════════════════════════════════
resetBtn.addEventListener("click", () => {
  // Animate out
  resultContent.style.transition = "opacity 0.25s, transform 0.25s";
  resultContent.style.opacity    = "0";
  resultContent.style.transform  = "translateY(10px) scale(0.98)";

  setTimeout(() => {
    resultContent.hidden  = true;
    resultContent.style.opacity   = "";
    resultContent.style.transform = "";
    resultEmpty.hidden   = false;
    resetBtn.hidden      = true;
    buildingsRow.innerHTML = "";
    probList.innerHTML   = "";

    resultEmpty.style.opacity   = "0";
    resultEmpty.style.transform = "translateY(10px)";
    requestAnimationFrame(() => {
      resultEmpty.style.transition = "opacity 0.4s, transform 0.4s";
      resultEmpty.style.opacity    = "1";
      resultEmpty.style.transform  = "";
    });
  }, 280);
});

// ══════════════════════════════════════════════════════════════
// API STATUS CHECK
// ══════════════════════════════════════════════════════════════
async function checkApiStatus() {
  const statusEl    = document.getElementById("apiStatus");
  const statusLabel = statusEl?.querySelector(".status-label");
  const statusDot   = statusEl?.querySelector(".status-dot");
  try {
    const res = await fetch(HEALTH_ENDPOINT, { method: "GET", signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      statusEl.classList.add("online");
      statusEl.classList.remove("offline");
      if (statusLabel) statusLabel.textContent = "API online";
    } else {
      throw new Error("bad status");
    }
  } catch {
    statusEl.classList.add("offline");
    statusEl.classList.remove("online");
    if (statusLabel) statusLabel.textContent = "API offline";
  }
}

// ══════════════════════════════════════════════════════════════
// SCROLL REVEAL — animate sections on scroll
// ══════════════════════════════════════════════════════════════
function initScrollReveal() {
  if (!("IntersectionObserver" in window) || REDUCE_MOTION) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.style.opacity   = "1";
        en.target.style.transform = "translateY(0)";
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".stat-card, .panel").forEach((el, i) => {
    el.style.opacity    = "0";
    el.style.transform  = "translateY(20px)";
    el.style.transition = `opacity 0.65s ease ${i * 0.08}s, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s`;
    obs.observe(el);
  });
}

// ══════════════════════════════════════════════════════════════
// INPUT MICRO-INTERACTIONS
// ══════════════════════════════════════════════════════════════
function initInputAnimations() {
  document.querySelectorAll(".input-wrapper input, .input-wrapper select").forEach(input => {
    const wrapper = input.closest(".input-wrapper");
    const field   = input.closest(".field");

    input.addEventListener("focus", () => {
      wrapper.style.transform  = "scale(1.015)";
      wrapper.style.transition = "transform 0.18s cubic-bezier(0.34,1.56,0.64,1)";
      if (field) {
        field.querySelector(".label-text")?.style && (field.querySelector(".label-text").style.color = "var(--teal)");
      }
    });
    input.addEventListener("blur", () => {
      wrapper.style.transform = "";
      if (field) {
        field.querySelector(".label-text")?.style && (field.querySelector(".label-text").style.color = "");
      }
    });
  });
}

// ══════════════════════════════════════════════════════════════
// TILT EFFECT ON PANELS
// ══════════════════════════════════════════════════════════════
function initPanelTilt() {
  if (REDUCE_MOTION || window.innerWidth < 960) return;
  document.querySelectorAll(".glass-panel").forEach(panel => {
    panel.addEventListener("mousemove", e => {
      const rect   = panel.getBoundingClientRect();
      const x      = (e.clientX - rect.left) / rect.width  - 0.5;
      const y      = (e.clientY - rect.top)  / rect.height - 0.5;
      const tiltX  = y * 3;
      const tiltY  = -x * 3;
      panel.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(2px)`;
      panel.style.transition = "transform 0.1s";
    });
    panel.addEventListener("mouseleave", () => {
      panel.style.transform  = "";
      panel.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1)";
    });
  });
}

// ══════════════════════════════════════════════════════════════
// TYPEWRITER EFFECT ON HEADLINE ACCENT
// ══════════════════════════════════════════════════════════════
function initTypewriter() {
  if (REDUCE_MOTION) return;
  const words  = ["stay", "space", "room", "home"];
  const accent = document.querySelector(".headline-accent");
  if (!accent) return;

  let wi = 0;
  let charI = 0;
  let deleting = false;
  let paused = false;

  function tick() {
    const word = words[wi % words.length];
    if (paused) {
      setTimeout(tick, 1800);
      paused = false;
      return;
    }
    if (!deleting) {
      accent.textContent = word.slice(0, charI + 1);
      charI++;
      if (charI === word.length) { paused = true; deleting = true; charI = word.length; }
      setTimeout(tick, 110);
    } else {
      accent.textContent = word.slice(0, charI - 1);
      charI--;
      if (charI === 0) { deleting = false; wi++; paused = false; charI = 0; }
      setTimeout(tick, 65);
    }
  }

  // Start after initial delay
  setTimeout(tick, 2000);
}

// ══════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  initParticles();
  buildSkylineLights();
  checkApiStatus();
  initScrollReveal();
  initInputAnimations();
  initParallax();
  initPanelTilt();
  initTypewriter();
  animateCounters();
});
