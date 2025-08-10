// =========================
// Mobile menu toggle
// =========================
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });
}

// =========================
// Hide/show navbar on scroll
// =========================
let lastScrollTop = 0;
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;

  if (navbar) {
    if (scrollTop > lastScrollTop && scrollTop > 80) {
      navbar.classList.add("hide"); // Scrolling down
    } else {
      navbar.classList.remove("hide"); // Scrolling up
    }
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// =========================
// Close mobile menu on link click
// =========================
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger?.classList.remove("active");
    navMenu?.classList.remove("active");
  });
});

// =========================
/* Smooth scrolling for anchor links */
// =========================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (!href) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// =========================
// Dynamic gradient on title hover
// =========================
const title = document.querySelector(".title-space h1");

if (title) {
  title.addEventListener("mousemove", (e) => {
    const rect = title.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    title.style.background = `radial-gradient(circle at ${xPercent}% ${yPercent}%, 
      rgb(254, 234, 132) 0%, 
      #f7f7d5ff 10%, 
      var(--white) 30%)`;
    title.style.webkitBackgroundClip = "text";
    title.style.webkitTextFillColor = "transparent";
    title.style.backgroundClip = "text";
  });

  title.addEventListener("mouseleave", () => {
    title.style.background = "var(--white)";
    title.style.webkitBackgroundClip = "text";
    title.style.webkitTextFillColor = "transparent";
    title.style.backgroundClip = "text";
  });
}

// =========================
// Reveal on Scroll
// =========================
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // reveal only once
      }
    });
  },
  { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// =========================
// APOD
// =========================
(async function loadAPOD() {
  const container = document.getElementById("apod-container");
  if (!container) return;

  const media = container.querySelector(".apod-media");
  const captionEl = container.querySelector("#apod-title");
  const linkEl = container.querySelector("#apod-link");

  try {
    const res = await fetch(
      "https://api.nasa.gov/planetary/apod?api_key=cJUBnURSNlQ2ZnIsUcxAI2I08kJu3YzpX753J0Rl&thumbs=true"
    );
    if (!res.ok) throw new Error(`APOD HTTP ${res.status}`);
    const data = await res.json();

    // Choose the best image URL
    let url =
      data.media_type === "image" ? data.hdurl || data.url : data.thumbnail_url; // when it's a video

    if (!url) throw new Error("No image URL in APOD payload");

    // Avoid mixed content (http on https site)
    url = url.replace(/^http:\/\//i, "https://");

    // Build image
    const img = new Image();
    img.alt = data.title || "Astronomy Picture of the Day";
    img.referrerPolicy = "no-referrer";
    img.onload = () => container.classList.remove("loading");
    img.onerror = () => {
      container.classList.remove("loading");
      captionEl && (captionEl.textContent = "Failed to load APOD image.");
    };
    img.src = url;

    // Insert only into the media area
    if (media) {
      media.innerHTML = "";
      media.appendChild(img);
    }

    // Caption + link
    if (captionEl) captionEl.textContent = data.title || "";
    if (linkEl) linkEl.href = data.hdurl || data.url || url;
  } catch (err) {
    console.warn(err);
    container.classList.remove("loading");
    media && (media.innerHTML = "");
    captionEl &&
      (captionEl.textContent = "APOD unavailable right now. Try again later.");
    linkEl && linkEl.removeAttribute("href");
  }
})();

// =====================================================
// NeoWs (Near-Earth Object Web Service) + Units toggle
// =====================================================
const NASA_KEY = "cJUBnURSNlQ2ZnIsUcxAI2I08kJu3YzpX753J0Rl"; // your key

// --- Date helper
function yyyyMmDd(date = new Date()) {
  const tz = new Date(date.getTime() - date.getTimezoneOffset() * 60000); // local ISO yyyy-mm-dd
  return tz.toISOString().slice(0, 10);
}

// --- Units + persistence
const Units = { METRIC: "metric", IMPERIAL: "imperial" };
let currentUnit =
  localStorage.getItem("units") === Units.IMPERIAL
    ? Units.IMPERIAL
    : Units.METRIC;

// Cache last payload/date so we can re-render on unit switch without re-fetch
let lastNeoPayload = null;
let lastNeoDate = null;

// --- Conversions
const KM_TO_MI = 0.621371;
const M_TO_FT = 3.28084;

// --- Unit-aware formatters
function formatDistance(kmVal) {
  const v = Number(kmVal);
  if (!isFinite(v)) return "—";
  if (currentUnit === Units.IMPERIAL) {
    const mi = v * KM_TO_MI;
    return mi >= 1000
      ? `${(mi / 1000).toFixed(2)} kmi`
      : `${mi.toLocaleString(undefined, { maximumFractionDigits: 0 })} mi`;
  }
  return v >= 1000
    ? `${(v / 1000).toFixed(2)} Mkm`
    : `${v.toLocaleString()} km`;
}

function formatSpeed(kmPerSec) {
  const v = Number(kmPerSec);
  if (!isFinite(v)) return "—";
  if (currentUnit === Units.IMPERIAL) {
    // Convert km/s -> mph
    const mph = v * KM_TO_MI * 3600;
    return `${mph.toFixed(0)} mph`;
  }
  // Metric stays in km/s
  return `${v.toFixed(2)} km/s`;
}

function formatDiameter(meters) {
  const v = Number(meters);
  if (!isFinite(v)) return "—";
  if (currentUnit === Units.IMPERIAL) {
    const ft = v * M_TO_FT;
    return ft >= 1000 ? `${(ft / 1000).toFixed(1)} kft` : `${ft.toFixed(0)} ft`;
  }
  return v >= 1000 ? `${(v / 1000).toFixed(0)} km` : `${v.toFixed(0)} m`;
}

// --- API
async function fetchNEOs(dateStr) {
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${dateStr}&end_date=${dateStr}&api_key=${NASA_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NeoWs HTTP ${res.status}`);
  return res.json();
}

// --- Render
function renderNEOs(dateStr, payload) {
  lastNeoPayload = payload;
  lastNeoDate = dateStr;

  const grid = document.getElementById("neo-grid");
  const statsCount = document.getElementById("neo-count");
  const statsHaz = document.getElementById("neo-hazard");

  if (!grid) return;
  grid.innerHTML = "";

  const list = payload.near_earth_objects?.[dateStr] || [];
  const hazardous = list.filter(
    (n) => n.is_potentially_hazardous_asteroid
  ).length;

  if (statsCount)
    statsCount.textContent = `${list.length} object${
      list.length === 1 ? "" : "s"
    }`;
  if (statsHaz) statsHaz.textContent = `${hazardous} potentially hazardous`;

  // sort by closest miss distance (first close-approach entry for that date)
  const sorted = [...list]
    .sort((a, b) => {
      const da = Number(
        a.close_approach_data?.[0]?.miss_distance?.kilometers ?? Infinity
      );
      const db = Number(
        b.close_approach_data?.[0]?.miss_distance?.kilometers ?? Infinity
      );
      return da - db;
    })
    .slice(0, 8);

  if (!sorted.length) {
    grid.innerHTML = `<div class="neo-card">No NEOs listed for ${dateStr}.</div>`;
    return;
  }

  for (const neo of sorted) {
    const ca = neo.close_approach_data?.[0];
    const missKm = ca?.miss_distance?.kilometers;
    const velKmS = ca?.relative_velocity?.kilometers_per_second;
    const estMin = neo.estimated_diameter?.meters?.estimated_diameter_min;
    const estMax = neo.estimated_diameter?.meters?.estimated_diameter_max;

    const card = document.createElement("article");
    card.className = "neo-card reveal";

    card.innerHTML = `
      <h3>${neo.name} ${
      neo.is_potentially_hazardous_asteroid
        ? '<span class="badge badge-danger">PHO</span>'
        : ""
    }</h3>
      <div class="neo-meta">
        <div><span class="badge">Closest approach:</span> ${
          ca?.close_approach_date_full || ca?.close_approach_date || "—"
        }</div>
        <div><span class="badge">Miss distance:</span> ${formatDistance(
          missKm
        )}</div>
        <div><span class="badge">Speed:</span> ${formatSpeed(velKmS)}</div>
        <div><span class="badge">Est. diameter:</span> ${formatDiameter(
          estMin
        )} – ${formatDiameter(estMax)}</div>
        <div><span class="badge">Abs. magnitude (H):</span> ${Number(
          neo.absolute_magnitude_h
        ).toFixed(1)}</div>
      </div>
      <div class="neo-footer">
        <a class="card-link" href="${
          neo.nasa_jpl_url
        }" target="_blank" rel="noopener">JPL details →</a>
      </div>
    `;

    grid.appendChild(card);
    requestAnimationFrame(() => card.classList.add("visible")); // reuse reveal animation
  }
}

// --- Loading wrapper
async function loadNEOs(dateStr = yyyyMmDd()) {
  const grid = document.getElementById("neo-grid");
  const statsCount = document.getElementById("neo-count");
  const statsHaz = document.getElementById("neo-hazard");

  if (grid) {
    grid.innerHTML = `<article class="neo-card skeleton" style="height:120px"></article>
                      <article class="neo-card skeleton" style="height:120px"></article>
                      <article class="neo-card skeleton" style="height:120px"></article>`;
  }

  try {
    const data = await fetchNEOs(dateStr);
    renderNEOs(dateStr, data);
  } catch (err) {
    console.warn(err);
    if (statsCount) statsCount.textContent = "—";
    if (statsHaz) statsHaz.textContent = "—";
    if (grid)
      grid.innerHTML = `<article class="neo-card">NeoWs is unavailable right now. Please try again later.</article>`;
  }
}

// --- Init controls (date + refresh)
(function initNEOs() {
  const input = document.getElementById("neo-date");
  const btn = document.getElementById("neo-refresh");

  if (!input || !btn) return; // section not present yet

  const today = yyyyMmDd();
  input.value = today;

  btn.addEventListener("click", () => loadNEOs(input.value || today));
  input.addEventListener("change", () => loadNEOs(input.value || today));

  loadNEOs(today);
})();

// --- Units toggle (Metric / Imperial)
(function initUnitsToggle() {
  const buttons = document.querySelectorAll(".unit-btn");
  if (!buttons.length) return; // no toggle present in HTML, skip

  function updateButtons() {
    buttons.forEach((btn) => {
      const isActive = btn.dataset.unit === currentUnit;
      btn.setAttribute("aria-pressed", String(isActive));
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const newUnit = btn.dataset.unit;
      if (!newUnit || newUnit === currentUnit) return;
      currentUnit = newUnit;
      localStorage.setItem("units", currentUnit);
      updateButtons();

      // Re-render with cached data if available, otherwise reload
      if (lastNeoPayload && lastNeoDate) {
        renderNEOs(lastNeoDate, lastNeoPayload);
      } else {
        const input = document.getElementById("neo-date");
        loadNEOs(input?.value || yyyyMmDd());
      }
    });
  });

  updateButtons(); // apply saved state on load
})();

// =========================
// Highlights: Launch • ISS • Space Weather • NEO
// =========================
(async function buildHighlights() {
  const timeline = document.querySelector("#highlights .timeline");
  if (!timeline) return;

  // helpers
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fmtUTC = (iso) => {
    if (!iso) return "TBD";
    const d = new Date(iso);
    return (
      d.toLocaleString(undefined, {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }) + " UTC"
    );
  };

  const makeItem = (dateLabel, text, href, shortTitle) => {
    const item = document.createElement("div");
    item.className = "t-item reveal";
    item.innerHTML = `
      <span class="t-date">${dateLabel}</span>
      <span class="t-short">${shortTitle || ""}</span>
      <span class="t-text">${text}${
      href ? ` <a href="${href}" target="_blank" rel="noopener">→</a>` : ""
    }</span>
    `;
    return item;
  };

  const safeFetch = async (url, opt) => {
    const r = await fetch(url, opt);
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  };

  // clear & skeleton
  timeline.innerHTML = `
    <div class="t-item skeleton" style="height:52px"></div>
    <div class="t-item skeleton" style="height:52px"></div>
    <div class="t-item skeleton" style="height:52px"></div>
    <div class="t-item skeleton" style="height:52px"></div>
  `;

  // ========== Card 1: Next Launch (Launch Library 2) ==========
  async function cardLaunch() {
    try {
      const data = await safeFetch(
        "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=1&hide_recent_previous=true"
      );
      const L = data?.results?.[0];
      if (!L) throw new Error("No launch");
      const when = fmtUTC(L.net || L.window_start);
      const name = L.name || "Upcoming launch";
      const provider = L.launch_service_provider?.name
        ? ` • ${L.launch_service_provider.name}`
        : "";
      const loc = L.pad?.name ? ` — ${L.pad.name}` : "";
      return makeItem(
        when,
        `${name}${provider}${loc}`,
        L.url || null,
        "Next Rocket Launch"
      );
    } catch {
      return makeItem("TBD", "Next major launch window", null);
    }
  }

  // ========== Card 2: ISS Pass (Open Notify via proxy) ==========
  // Open Notify is HTTP-only; on HTTPS sites we use a simple CORS proxy.
  const OPEN_NOTIFY = "http://api.open-notify.org/iss-pass.json";
  const PROXY = (u) =>
    `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`;

  async function getPosition() {
    // browser geolocation (fast) → fallback to a default location
    const fallback = { coords: { latitude: 40.7128, longitude: -74.006 } }; // NYC fallback
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation
          ? navigator.geolocation.getCurrentPosition(res, rej, {
              enableHighAccuracy: true,
              timeout: 7000,
            })
          : rej(new Error("geo unsupported"))
      );
      return pos || fallback;
    } catch {
      return fallback;
    }
  }

  async function cardISS() {
    try {
      const {
        coords: { latitude: lat, longitude: lon },
      } = await getPosition();
      const url = `${OPEN_NOTIFY}?lat=${lat}&lon=${lon}&n=1`;
      const data = await safeFetch(PROXY(url)); // wrap to avoid mixed-content/CORS
      const pass = data?.response?.[0];
      if (!pass) throw new Error("No pass");
      const t = new Date(pass.risetime * 1000);
      const label =
        t.toLocaleString(undefined, {
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }) + " (local)";
      const mins = Math.round((pass.duration || 0) / 60);
      return makeItem(
        label,
        `Next ISS pass near you • ~${mins} min visible`,
        "https://spotthestation.nasa.gov/sightings/",
        "ISS Pass"
      );
    } catch {
      return makeItem(
        "Monthly",
        "ISS visible passes (varies by location)",
        "https://spotthestation.nasa.gov/"
      );
    }
  }

  // ========== Card 3: Space Weather (DONKI GST/CME recent) ==========
  async function cardSpaceWeather() {
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 5);
      const SK =
        typeof NASA_KEY !== "undefined" && NASA_KEY ? NASA_KEY : "DEMO_KEY";
      const [gst, cme] = await Promise.all([
        safeFetch(
          `https://api.nasa.gov/DONKI/GST?startDate=${ymd(start)}&endDate=${ymd(
            end
          )}&api_key=${SK}`
        ),
        safeFetch(
          `https://api.nasa.gov/DONKI/CME?startDate=${ymd(start)}&endDate=${ymd(
            end
          )}&api_key=${SK}`
        ),
      ]);

      let txt = "Space weather update";
      let when = "Recent";

      if (Array.isArray(gst) && gst.length) {
        const g = [...gst].sort(
          (a, b) => new Date(b.startTime) - new Date(a.startTime)
        )[0];
        const kpVals = (g.allKpIndex || [])
          .map((x) => Number(x.kpIndex))
          .filter(Number.isFinite);
        const kpMax = kpVals.length ? Math.max(...kpVals) : null;
        txt = `Geomagnetic storm${kpMax != null ? ` (Kp≈${kpMax})` : ""}`;
        when = fmtUTC(g.startTime);
        return makeItem(
          when,
          txt,
          g.link || "https://www.swpc.noaa.gov/",
          "Space Weather"
        );
      }

      if (Array.isArray(cme) && cme.length) {
        const c = [...cme].sort(
          (a, b) => new Date(b.startTime) - new Date(a.startTime)
        )[0];
        txt = "Coronal Mass Ejection detected";
        when = fmtUTC(c.startTime);
        return makeItem(when, txt, c.link || "https://www.swpc.noaa.gov/");
      }

      throw new Error("No recent events");
    } catch {
      return makeItem(
        "—",
        "Space weather is calm (no recent GST/CME)",
        "https://www.swpc.noaa.gov/"
      );
    }
  }

  // ========== Card 4: Closest NEO this week (NeoWs) ==========
  async function cardNEO() {
    try {
      const SK =
        typeof NASA_KEY !== "undefined" && NASA_KEY ? NASA_KEY : "DEMO_KEY";
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 7);
      const data = await safeFetch(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${ymd(
          start
        )}&end_date=${ymd(end)}&api_key=${SK}`
      );

      // flatten objects by day into one list
      const days = data?.near_earth_objects || {};
      const list = Object.keys(days).flatMap((d) => days[d]);

      if (!list.length) throw new Error("No NEOs");

      // choose object with minimum miss distance across first approach in window
      let best = null;
      for (const neo of list) {
        const ca =
          (neo.close_approach_data || []).find(
            (ca) =>
              ca.close_approach_date >= ymd(start) &&
              ca.close_approach_date <= ymd(end)
          ) || neo.close_approach_data?.[0];

        const missKm = Number(ca?.miss_distance?.kilometers ?? Infinity);
        if (!isFinite(missKm)) continue;
        if (!best || missKm < best.missKm) best = { neo, ca, missKm };
      }

      if (!best) throw new Error("No valid miss distance");

      const when = fmtUTC(
        best.ca.close_approach_date_full || best.ca.close_approach_date
      );
      const miss =
        best.missKm >= 1000000
          ? `${(best.missKm / 1_000_000).toFixed(2)} Mkm`
          : `${Math.round(best.missKm).toLocaleString()} km`;

      const estMin =
        best.neo.estimated_diameter?.meters?.estimated_diameter_min;
      const estMax =
        best.neo.estimated_diameter?.meters?.estimated_diameter_max;
      const size =
        estMin && estMax
          ? `${Math.round(estMin)}–${Math.round(estMax)} m`
          : "size n/a";

      const pho = best.neo.is_potentially_hazardous_asteroid ? " • PHO" : "";
      return makeItem(
        when,
        `Closest NEO: ${best.neo.name} • Miss: ${miss} • Est. ${size}${pho}`,
        best.neo.nasa_jpl_url || null,
        "Near-Earth Object"
      );
    } catch {
      return makeItem(
        "—",
        "Closest NEO this week: data unavailable",
        "https://cneos.jpl.nasa.gov/ca/"
      );
    }
  }

  // Build all cards, then render
  try {
    const [i1, i2, i3, i4] = await Promise.all([
      cardLaunch(),
      cardISS(),
      cardSpaceWeather(),
      cardNEO(),
    ]);
    const items = [i1, i2, i3, i4];

    timeline.innerHTML = "";
    items.forEach((el, idx) => {
      el.setAttribute("data-delay", (idx + 1) * 100);
      timeline.appendChild(el);
      requestAnimationFrame(() => el.classList.add("visible"));
    });
  } catch (e) {
    console.warn("Highlights failed:", e);
    // keep whatever was there
  }
})();
