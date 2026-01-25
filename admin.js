const API_BASE =
  window.API_BASE || (location.protocol === "file:" ? "http://localhost:3000/api" : "/api");
const tokenKey = "lsp_admin_token";

const loginForm = document.getElementById("adminLogin");
const loginHint = document.getElementById("loginHint");
const adminPanel = document.getElementById("adminPanel");
const logoutBtn = document.getElementById("logoutBtn");

const schemeForm = document.getElementById("schemeForm");
const faqForm = document.getElementById("faqForm");

const schemesList = document.getElementById("schemesList");
const faqsList = document.getElementById("faqsList");
const registrationsTable = document.getElementById("registrationsTable");

function getToken() {
  return localStorage.getItem(tokenKey);
}

function setToken(token) {
  localStorage.setItem(tokenKey, token);
}

function clearToken() {
  localStorage.removeItem(tokenKey);
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Request gagal");
  }
  return res.json();
}

function showPanel(isAuthed) {
  if (isAuthed) {
    adminPanel.style.display = "block";
    loginForm.closest(".section").style.display = "none";
    logoutBtn.style.display = "inline-flex";
  } else {
    adminPanel.style.display = "none";
    loginForm.closest(".section").style.display = "block";
    logoutBtn.style.display = "none";
  }
}

async function login(email, password) {
  const data = await fetchJSON(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
}

async function loadSchemes() {
  const schemes = await fetchJSON(`${API_BASE}/schemes`);
  schemesList.innerHTML = schemes
    .map(
      (s) => `
      <div class="admin__item">
        <div>
          <strong>${s.title}</strong> <span class="tag">Level ${s.level}</span>
          <div class="muted">${s.description || ""}</div>
        </div>
        <div class="admin__item-actions">
          <button data-id="${s.id}" class="btn btn--ghost btn--small js-edit-scheme">Edit</button>
          <button data-id="${s.id}" class="btn btn--ghost btn--small js-del-scheme">Hapus</button>
        </div>
      </div>
    `
    )
    .join("");
}

async function loadFaqs() {
  const faqs = await fetchJSON(`${API_BASE}/faqs`);
  faqsList.innerHTML = faqs
    .map(
      (f) => `
      <div class="admin__item">
        <div>
          <strong>${f.question}</strong>
          <div class="muted">${f.answer}</div>
        </div>
        <div class="admin__item-actions">
          <button data-id="${f.id}" class="btn btn--ghost btn--small js-edit-faq">Edit</button>
          <button data-id="${f.id}" class="btn btn--ghost btn--small js-del-faq">Hapus</button>
        </div>
      </div>
    `
    )
    .join("");
}

async function loadRegistrations() {
  const regs = await fetchJSON(`${API_BASE}/registrations`, {
    headers: { ...authHeaders() },
  });
  const tbody = registrationsTable.querySelector("tbody");
  tbody.innerHTML = regs
    .map(
      (r) => `
      <tr>
        <td>${r.name}</td>
        <td>${r.email}</td>
        <td>${r.wa}</td>
        <td>${r.schemeTitle || "-"}</td>
        <td>${r.notes || "-"}</td>
        <td>${new Date(r.createdAt).toLocaleString("id-ID")}</td>
      </tr>
    `
    )
    .join("");
}

async function refreshAll() {
  await Promise.all([loadSchemes(), loadFaqs(), loadRegistrations()]);
}

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginHint.textContent = "";
  const fd = new FormData(loginForm);
  try {
    await login(fd.get("email"), fd.get("password"));
    showPanel(true);
    await refreshAll();
  } catch (err) {
    if (location.protocol === "file:") {
      loginHint.textContent = "Server belum jalan. Jalankan backend dulu.";
    } else {
      loginHint.textContent = err.message;
    }
  }
});

logoutBtn?.addEventListener("click", () => {
  clearToken();
  showPanel(false);
});

schemeForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(schemeForm);
  const competencies = String(fd.get("competencies") || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  await fetchJSON(`${API_BASE}/schemes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      title: fd.get("title"),
      level: fd.get("level"),
      icon: fd.get("icon"),
      description: fd.get("description"),
      competencies,
    }),
  });
  schemeForm.reset();
  await loadSchemes();
});

faqForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(faqForm);
  await fetchJSON(`${API_BASE}/faqs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      question: fd.get("question"),
      answer: fd.get("answer"),
    }),
  });
  faqForm.reset();
  await loadFaqs();
});

schemesList?.addEventListener("click", async (e) => {
  const btn = e.target;
  if (btn.classList.contains("js-del-scheme")) {
    const id = btn.dataset.id;
    await fetchJSON(`${API_BASE}/schemes/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    await loadSchemes();
  }

  if (btn.classList.contains("js-edit-scheme")) {
    const id = btn.dataset.id;
    const title = prompt("Judul skema:");
    const level = prompt("Level:");
    const icon = prompt("Icon (fa-rocket):");
    const description = prompt("Deskripsi:");
    const comps = prompt("Kompetensi (pisahkan dengan koma):");

    await fetchJSON(`${API_BASE}/schemes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        title,
        level,
        icon,
        description,
        competencies: comps
          ? comps.split(",").map((c) => c.trim()).filter(Boolean)
          : [],
      }),
    });
    await loadSchemes();
  }
});

faqsList?.addEventListener("click", async (e) => {
  const btn = e.target;
  if (btn.classList.contains("js-del-faq")) {
    const id = btn.dataset.id;
    await fetchJSON(`${API_BASE}/faqs/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    await loadFaqs();
  }

  if (btn.classList.contains("js-edit-faq")) {
    const id = btn.dataset.id;
    const question = prompt("Pertanyaan:");
    const answer = prompt("Jawaban:");
    await fetchJSON(`${API_BASE}/faqs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ question, answer }),
    });
    await loadFaqs();
  }
});

async function init() {
  const token = getToken();
  if (!token) {
    showPanel(false);
    return;
  }

  try {
    await fetchJSON(`${API_BASE}/auth/me`, { headers: { ...authHeaders() } });
    showPanel(true);
    await refreshAll();
  } catch (_err) {
    clearToken();
    showPanel(false);
  }
}

init();
