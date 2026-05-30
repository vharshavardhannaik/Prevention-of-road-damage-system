const DEFAULT_API_BASE = 'http://localhost:5000/api';
const STORAGE_KEY = 'smartroadApiBase';

const app = document.getElementById('app');

const state = {
  apiBase: loadApiBase(),
  route: getRoute(),
  scanner: {
    stream: null,
    active: false,
    rafId: null,
  },
};

function loadApiBase() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const injected = window.__SMARTROAD_API_BASE__;
  const value = stored || injected || DEFAULT_API_BASE;
  return normalizeApiBase(value);
}

function normalizeApiBase(value) {
  return String(value || DEFAULT_API_BASE).trim().replace(/\/$/, '');
}

function setApiBase(value) {
  state.apiBase = normalizeApiBase(value);
  window.localStorage.setItem(STORAGE_KEY, state.apiBase);
}

function getRoute() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const segments = path.split('/').filter(Boolean);

  if (segments[0] === 'scan' && segments[1] === 'contractor') {
    return { name: 'scan-contractor' };
  }

  if (segments[0] === 'contractor' && segments[1]) {
    return { name: 'contractor-profile', contractorId: decodeURIComponent(segments[1]) };
  }

  if (segments[0] === 'report' && segments[1]) {
    return { name: 'road-report', roadId: decodeURIComponent(segments[1]) };
  }

  return { name: 'home' };
}

function navigate(path) {
  window.history.pushState({}, '', path);
  state.route = getRoute();
  render();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function money(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat('en-IN').format(number);
}

async function api(path, options = {}) {
  const response = await fetch(`${state.apiBase}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      message = payload.error || payload.message || message;
    } catch (error) {
      const text = await response.text().catch(() => '');
      if (text) message = text;
    }
    throw new Error(message);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

function headerTemplate(active = 'home') {
  return `
    <header class="topbar">
      <div class="container topbar-inner">
        <a class="brand" href="/" data-link>
          <div class="brand-mark">SR</div>
          <div>
            <h1 class="brand-title">SmartRoad QR Portal</h1>
            <p class="brand-subtitle">QR scan, contractor profile, and public road reporting</p>
          </div>
        </a>

        <nav class="nav" aria-label="Primary">
          ${navButton('Home', '/', active === 'home')}
          ${navButton('Scan Contractor', '/scan/contractor', active === 'scan-contractor')}
          ${navButton('Report Road', '/report/ROAD-001', active === 'road-report')}
          <button type="button" id="open-settings">API Settings</button>
        </nav>
      </div>
    </header>
  `;
}

function navButton(label, href, active) {
  return `<a href="${href}" data-link style="${active ? 'background: rgba(56, 189, 248, 0.18); border-color: rgba(56, 189, 248, 0.32);' : ''}">${label}</a>`;
}

function heroTemplate() {
  return `
    <section class="hero">
      <div class="container hero-grid">
        <div class="panel hero-main">
          <div class="eyebrow"><span class="eyebrow-dot"></span> Netlify-ready QR section</div>
          <h1>Deploy the QR flow as a separate public site.</h1>
          <p>
            This folder is a standalone static app for contractor QR scanning and road damage reporting.
            Deploy it to Netlify, point it at your backend API, and generate QR codes that open directly on mobile.
          </p>
          <div class="hero-actions">
            <a class="btn" href="/scan/contractor" data-link>Open Contractor Scanner</a>
            <a class="secondary-btn" href="/report/ROAD-001" data-link>Open Road Report</a>
          </div>
        </div>

        <aside class="panel hero-side">
          <div class="stat-grid">
            <div class="stat"><strong>1</strong><span>Standalone folder</span></div>
            <div class="stat"><strong>SPA</strong><span>Netlify friendly</span></div>
            <div class="stat"><strong>QR</strong><span>Road and contractor</span></div>
            <div class="stat"><strong>LAN</strong><span>Works with backend URL</span></div>
          </div>
          <div class="notice">
            <strong>Deployment note</strong>
            <p class="helper">
              Edit <code>window.__SMARTROAD_API_BASE__</code> in <code>index.html</code> before deploy,
              or set it in the API settings panel after the site is live.
            </p>
          </div>
        </aside>
      </div>
    </section>

    <section class="section">
      <div class="container grid-3">
        <article class="card">
          <div class="inline-badge">Contractor QR</div>
          <h3>Scan a contractor QR</h3>
          <p>Use the phone camera when the browser supports BarcodeDetector, or enter the contractor ID manually.</p>
        </article>
        <article class="card">
          <div class="inline-badge">Public report page</div>
          <h3>Open a road report</h3>
          <p>Generated QR codes can open the complaint form directly on a public mobile page.</p>
        </article>
        <article class="card">
          <div class="inline-badge">Netlify deploy</div>
          <h3>Static and lightweight</h3>
          <p>This folder can be published as-is on Netlify with no backend build step.</p>
        </article>
      </div>
    </section>
  `;
}

function apiSettingsPanel() {
  return `
    <section class="section">
      <div class="container">
        <div class="panel card">
          <h3>API Settings</h3>
          <p>Point this site to your deployed backend. Example: <code>https://your-backend.onrender.com/api</code></p>
          <div class="form-row" style="margin-top: 16px;">
            <div class="field">
              <label for="api-base-input">Backend API base URL</label>
              <input id="api-base-input" type="url" value="${escapeHtml(state.apiBase)}" placeholder="https://your-backend.onrender.com/api" />
            </div>
            <div class="field" style="align-self: end;">
              <label>&nbsp;</label>
              <button class="btn" id="save-api-base" type="button">Save API URL</button>
            </div>
          </div>
          <p class="helper" style="margin-top: 12px;">Saved locally in this browser and used by all QR pages.</p>
        </div>
      </div>
    </section>
  `;
}

function loadingCard(title, subtitle = 'Loading data...') {
  return `
    <div class="panel card">
      <div class="loading"><span class="spinner"></span><strong>${escapeHtml(title)}</strong></div>
      <p style="margin-top: 10px;">${escapeHtml(subtitle)}</p>
    </div>
  `;
}

function errorCard(title, message) {
  return `
    <div class="panel card notice error">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function contractorCard(contractor) {
  return `
    <div class="panel card">
      <div class="inline-badge">Contractor profile</div>
      <h3 style="margin-top: 14px;">${escapeHtml(contractor.name)}</h3>
      <p>ID: ${escapeHtml(contractor.contractorId || contractor.id)}</p>

      <div class="meta-grid" style="margin-top: 18px;">
        <div class="meta"><small>Age</small><strong>${escapeHtml(contractor.age || 'N/A')}</strong></div>
        <div class="meta"><small>Ad No</small><strong>${escapeHtml(contractor.adNo || 'N/A')}</strong></div>
        <div class="meta"><small>License No</small><strong>${escapeHtml(contractor.licenseNo || 'N/A')}</strong></div>
        <div class="meta"><small>Rating</small><strong>${escapeHtml(contractor.currentRating ?? 'N/A')}</strong></div>
        <div class="meta"><small>Complaints</small><strong>${escapeHtml(contractor.totalComplaints ?? 0)}</strong></div>
        <div class="meta"><small>Projects</small><strong>${escapeHtml(contractor.totalProjects ?? 0)}</strong></div>
      </div>

      <div class="notice" style="margin-top: 18px;">
        <strong>Contact</strong>
        <p class="helper">${escapeHtml(contractor.email || 'No email provided')}</p>
      </div>
    </div>
  `;
}

function roadSummaryCard(road) {
  const warranty = road.warrantyEndDate ? new Date(road.warrantyEndDate).toLocaleDateString() : 'N/A';
  return `
    <div class="panel card">
      <div class="inline-badge">Public road report</div>
      <h3 style="margin-top: 14px;">${escapeHtml(road.roadName)}</h3>
      <p>Road ID: ${escapeHtml(road.roadId)}</p>

      <div class="meta-grid" style="margin-top: 18px;">
        <div class="meta"><small>Status</small><strong>${escapeHtml(road.status || 'Active')}</strong></div>
        <div class="meta"><small>Length</small><strong>${escapeHtml(road.roadLength || 0)} km</strong></div>
        <div class="meta"><small>Project Cost</small><strong>₹${money(road.projectCost)}</strong></div>
        <div class="meta"><small>Warranty Ends</small><strong>${escapeHtml(warranty)}</strong></div>
      </div>

      <div class="notice" style="margin-top: 18px;">
        <strong>Location</strong>
        <p class="helper">${escapeHtml(road.address || road.location?.address || 'Not specified')}</p>
      </div>
    </div>
  `;
}

function complaintFormCard(road) {
  return `
    <form class="panel card stack" id="complaint-form">
      <div>
        <div class="inline-badge">Report damage</div>
        <h3 style="margin-top: 14px;">Submit a complaint</h3>
        <p>Fill only the fields you want to share. The complaint will be tied to this road.</p>
      </div>

      <div class="form-row">
        <div class="field">
          <label for="userId">Name</label>
          <input id="userId" name="userId" type="text" placeholder="Your name" />
        </div>
        <div class="field">
          <label for="userEmail">Email</label>
          <input id="userEmail" name="userEmail" type="email" placeholder="you@example.com" />
        </div>
      </div>

      <div class="field">
        <label for="userPhone">Phone</label>
        <input id="userPhone" name="userPhone" type="tel" placeholder="+91 XXXXX XXXXX" />
      </div>

      <div class="form-row">
        <div class="field">
          <label for="damageType">Damage Type</label>
          <select id="damageType" name="damageType">
            <option>Pothole</option>
            <option>Crack</option>
            <option>Erosion</option>
            <option>Flooding</option>
            <option>Other</option>
          </select>
        </div>
        <div class="field">
          <label for="severity">Severity</label>
          <select id="severity" name="severity">
            <option>Low</option>
            <option selected>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label for="description">Description</label>
        <textarea id="description" name="description" placeholder="Describe the road issue in a few sentences..." required></textarea>
      </div>

      <div class="field">
        <label for="photoFile">Photo</label>
        <input id="photoFile" name="photoFile" type="file" accept="image/*" />
      </div>

      <div class="field">
        <label for="contractorRating">Contractor rating</label>
        <select id="contractorRating" name="contractorRating">
          <option value="0">No rating</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </div>

      <div class="hero-actions">
        <button class="btn" type="submit">Submit Complaint</button>
        <a class="secondary-btn" href="/scan/contractor" data-link>Go to scanner</a>
      </div>

      <div id="complaint-message"></div>
    </form>
  `;
}

async function renderHomePage() {
  app.innerHTML = `${headerTemplate('home')}${heroTemplate()}${apiSettingsPanel()}`;
  bindSharedEvents();
}

async function renderContractorPage(contractorId) {
  app.innerHTML = `${headerTemplate('scan-contractor')}
    <main class="page">
      <div class="container page-grid">
        <section class="stack">
          ${loadingCard('Loading contractor...')}
        </section>
        <aside class="stack">
          <div class="panel card">
            <div class="inline-badge">Tips</div>
            <h3 style="margin-top: 14px;">How the QR link works</h3>
            <p>The QR should open this page on mobile and then fetch contractor data from your backend.</p>
          </div>
        </aside>
      </div>
    </main>`;

  bindSharedEvents();

  try {
    const data = await api(`/contractors/${encodeURIComponent(contractorId)}`);
    const contractor = data.contractor;

    app.innerHTML = `${headerTemplate('scan-contractor')}
      <main class="page">
        <div class="container page-grid">
          <section class="stack">
            ${contractorCard(contractor)}
          </section>
          <aside class="stack">
            <div class="panel card">
              <div class="inline-badge">QR destination</div>
              <h3 style="margin-top: 14px;">${escapeHtml(window.location.origin)}/contractor/${escapeHtml(contractor.contractorId || contractor.id)}</h3>
              <p class="helper">Use the contractor QR endpoint to print or download this link.</p>
            </div>
          </aside>
        </div>
      </main>`;
    bindSharedEvents();
  } catch (error) {
    app.innerHTML = `${headerTemplate('scan-contractor')}
      <main class="page">
        <div class="container page-grid">
          <section class="stack">
            ${errorCard('Contractor not found', error.message)}
          </section>
          <aside class="stack">
            <div class="panel card">
              <div class="inline-badge">Manual lookup</div>
              <p class="helper">Try another contractor ID or scan a different QR code.</p>
            </div>
          </aside>
        </div>
      </main>`;
    bindSharedEvents();
  }
}

async function renderRoadPage(roadId) {
  app.innerHTML = `${headerTemplate('road-report')}
    <main class="page">
      <div class="container page-grid">
        <section class="stack" id="road-column">
          ${loadingCard('Loading road...', 'Fetching road details from the backend')}
        </section>
        <aside class="stack">
          <div class="panel card">
            <div class="inline-badge">Shareable link</div>
            <h3 style="margin-top: 14px;">${escapeHtml(window.location.href)}</h3>
            <p class="helper">This is the public QR destination. The backend can generate the same URL in PNG form.</p>
          </div>
        </aside>
      </div>
    </main>`;

  bindSharedEvents();

  try {
    const data = await api(`/roads/${encodeURIComponent(roadId)}`);
    const road = data.road;

    app.innerHTML = `${headerTemplate('road-report')}
      <main class="page">
        <div class="container page-grid">
          <section class="stack" id="road-column">
            ${roadSummaryCard(road)}
            ${complaintFormCard(road)}
          </section>
          <aside class="stack">
            <div class="panel card">
              <div class="inline-badge">Road QR</div>
              <h3 style="margin-top: 14px;">${escapeHtml(road.roadId)}</h3>
              <p class="helper">If you print the QR with the backend endpoint, it should point to this Netlify route.</p>
            </div>
          </aside>
        </div>
      </main>`;
    bindSharedEvents();
    bindComplaintForm(road);
  } catch (error) {
    app.innerHTML = `${headerTemplate('road-report')}
      <main class="page">
        <div class="container page-grid">
          <section class="stack">
            ${errorCard('Road not found', error.message)}
          </section>
          <aside class="stack">
            <div class="panel card">
              <div class="inline-badge">Check the link</div>
              <p class="helper">Make sure the QR encodes a valid road ID like ROAD-001.</p>
            </div>
          </aside>
        </div>
      </main>`;
    bindSharedEvents();
  }
}

function bindComplaintForm(road) {
  const form = document.getElementById('complaint-form');
  const message = document.getElementById('complaint-message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const description = String(formData.get('description') || '').trim();
    const file = formData.get('photoFile');

    if (!description) {
      message.innerHTML = `<div class="notice error">Please provide a description of the road damage.</div>`;
      return;
    }

    message.innerHTML = `<div class="notice">Submitting complaint...</div>`;

    let photoUrl = '';
    if (file && file instanceof File && file.size > 0) {
      photoUrl = await fileToBase64(file);
    }

    try {
      const payload = {
        roadId: road.roadId,
        userId: String(formData.get('userId') || 'anonymous'),
        userEmail: String(formData.get('userEmail') || 'user@example.com'),
        userPhone: String(formData.get('userPhone') || 'N/A'),
        damageType: String(formData.get('damageType') || 'Pothole'),
        description,
        severity: String(formData.get('severity') || 'Medium'),
        photoUrl,
        location: {
          latitude: road.latitude || 0,
          longitude: road.longitude || 0,
        },
      };

      const response = await api('/complaints', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const ratingValue = Number(formData.get('contractorRating') || 0);
      if (ratingValue > 0 && road.contractorId) {
        await api('/contractors/rate', {
          method: 'POST',
          body: JSON.stringify({
            contractorId: road.contractorId,
            roadId: road.id,
            ratingValue,
            userId: String(formData.get('userId') || 'anonymous'),
            userEmail: String(formData.get('userEmail') || 'user@example.com'),
            comment: `Rating from Netlify QR page: ${description.slice(0, 50)}`,
          }),
        });
      }

      message.innerHTML = `
        <div class="notice success">
          Complaint submitted successfully. Reference ID: ${escapeHtml(response?.complaint?.complaintId || 'submitted')}
        </div>
      `;
      form.reset();
    } catch (error) {
      message.innerHTML = `<div class="notice error">${escapeHtml(error.message || 'Failed to submit complaint')}</div>`;
    }
  });
}

function bindSharedEvents() {
  document.querySelectorAll('[data-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http')) return;
      event.preventDefault();
      navigate(href);
    });
  });

  const settingsButton = document.getElementById('open-settings');
  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      navigate('/#settings');
      window.setTimeout(() => {
        const panel = document.getElementById('api-base-input');
        if (panel) panel.focus();
      }, 50);
    });
  }

  const saveButton = document.getElementById('save-api-base');
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      const input = document.getElementById('api-base-input');
      if (!input || !input.value.trim()) return;
      setApiBase(input.value.trim());
      render();
    });
  }

  if (state.route.name === 'scan-contractor') {
    bindScanner();
  }
}

function bindScanner() {
  const startButton = document.getElementById('start-scan');
  const stopButton = document.getElementById('stop-scan');
  const manualButton = document.getElementById('manual-submit');
  const video = document.getElementById('scanner-video');
  const result = document.getElementById('scanner-result');
  const idInput = document.getElementById('contractor-id-input');

  const stop = () => stopScanner(video);

  if (startButton) {
    startButton.addEventListener('click', async () => {
      await startScanner(video, result);
    });
  }

  if (stopButton) {
    stopButton.addEventListener('click', stop);
  }

  if (manualButton && idInput) {
    manualButton.addEventListener('click', async () => {
      const raw = idInput.value.trim();
      if (!raw) return;
      await openContractorFromRaw(raw, result);
    });
  }

  window.addEventListener('beforeunload', stop, { once: true });
}

async function startScanner(video, resultNode) {
  if (!video) return;

  if (!('BarcodeDetector' in window)) {
    resultNode.innerHTML = `<div class="notice error">This browser does not support QR camera scanning. Use manual ID entry instead.</div>`;
    return;
  }

  try {
    state.scanner.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = state.scanner.stream;
    await video.play();
    state.scanner.active = true;

    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const loop = async () => {
      if (!state.scanner.active) return;

      try {
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const bitmap = await createImageBitmap(canvas);
        const codes = await detector.detect(bitmap);

        if (codes && codes.length > 0) {
          const raw = String(codes[0].rawValue || '').trim();
          await stopScanner(video);
          await openContractorFromRaw(raw, resultNode);
          return;
        }
      } catch (error) {
        // ignore transient detection errors
      }

      state.scanner.rafId = window.requestAnimationFrame(loop);
    };

    state.scanner.rafId = window.requestAnimationFrame(loop);
    resultNode.innerHTML = `<div class="notice success">Camera ready. Point the QR code at the camera.</div>`;
  } catch (error) {
    resultNode.innerHTML = `<div class="notice error">Unable to access the camera. ${escapeHtml(error.message || '')}</div>`;
  }
}

async function stopScanner(video) {
  state.scanner.active = false;
  if (state.scanner.rafId) {
    window.cancelAnimationFrame(state.scanner.rafId);
    state.scanner.rafId = null;
  }

  if (video && video.srcObject) {
    const stream = video.srcObject;
    stream.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  }

  if (state.scanner.stream) {
    state.scanner.stream.getTracks().forEach((track) => track.stop());
    state.scanner.stream = null;
  }
}

async function openContractorFromRaw(rawValue, resultNode) {
  const extracted = extractContractorId(rawValue) || rawValue;

  if (!extracted) {
    resultNode.innerHTML = `<div class="notice error">No contractor ID was found in the QR code.</div>`;
    return;
  }

  if (looksLikeUrl(rawValue)) {
    const target = new URL(rawValue);
    const routeContractorId = target.pathname.match(/\/contractor\/([^/]+)/i)?.[1];
    const routeRoadId = target.pathname.match(/\/report\/([^/]+)/i)?.[1];

    if (routeContractorId) {
      navigate(`/contractor/${encodeURIComponent(routeContractorId)}`);
      return;
    }

    if (routeRoadId) {
      navigate(`/report/${encodeURIComponent(routeRoadId)}`);
      return;
    }
  }

  try {
    const response = await api(`/contractors/${encodeURIComponent(extracted)}`);
    navigate(`/contractor/${encodeURIComponent(response.contractor.contractorId || extracted)}`);
  } catch (error) {
    resultNode.innerHTML = `<div class="notice error">${escapeHtml(error.message || 'Contractor not found')}</div>`;
  }
}

function extractContractorId(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const urlMatch = raw.match(/\/contractor\/([^/?#]+)/i);
  if (urlMatch) return decodeURIComponent(urlMatch[1]);

  const idMatch = raw.match(/(CONTR-[A-Z0-9-]+|CONTRACTOR-[A-Z0-9-]+)/i);
  if (idMatch) return idMatch[1];

  return raw;
}

function looksLikeUrl(value) {
  try {
    new URL(String(value));
    return true;
  } catch (error) {
    return false;
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function render() {
  state.route = getRoute();

  if (state.route.name === 'contractor-profile') {
    renderContractorPage(state.route.contractorId);
    return;
  }

  if (state.route.name === 'road-report') {
    renderRoadPage(state.route.roadId);
    return;
  }

  if (state.route.name === 'scan-contractor') {
    renderScanPage();
    return;
  }

  renderHomePage();
}

function renderScanPage() {
  app.innerHTML = `${headerTemplate('scan-contractor')}
    <main class="page">
      <div class="container page-grid">
        <section class="stack">
          <div class="panel card stack">
            <div>
              <div class="inline-badge">Contractor QR scanner</div>
              <h3 style="margin-top: 14px;">Scan the contractor QR code</h3>
              <p>Use the camera when supported, or paste the QR content manually.</p>
            </div>

            <div class="camera-box">
              <video id="scanner-video" playsinline muted></video>
            </div>

            <div class="hero-actions">
              <button class="btn" id="start-scan" type="button">Start Camera Scan</button>
              <button class="secondary-btn" id="stop-scan" type="button">Stop Camera</button>
            </div>

            <div class="field">
              <label for="contractor-id-input">Or enter QR value / contractor ID</label>
              <input id="contractor-id-input" type="text" placeholder="CONTR-001 or QR URL" />
            </div>

            <button class="btn" id="manual-submit" type="button">Open Contractor</button>
            <div id="scanner-result"></div>
          </div>
        </section>

        <aside class="stack">
          <div class="panel card">
            <div class="inline-badge">Scanner notes</div>
            <h3 style="margin-top: 14px;">QR targets can be URLs</h3>
            <p>
              This scanner accepts either a plain contractor ID or a full URL like
              <code>/contractor/CONTR-001</code>.
            </p>
          </div>
        </aside>
      </div>
    </main>`;
  bindSharedEvents();
  bindScanner();
}

window.addEventListener('popstate', render);

document.addEventListener('click', (event) => {
  const link = event.target.closest('[data-link]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('http')) return;
  event.preventDefault();
  navigate(href);
});

render();
