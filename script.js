// Data (diadaptasi dari project React yang kamu kirim)
const SCHEMES = [
  {
    id: "kewirausahaan-muda",
    title: "Kewirausahaan Muda",
    level: "Dasar",
    icon: "fa-rocket",
    description:
      "Ditujukan bagi mahasiswa atau wirausaha pemula yang ingin memvalidasi kompetensi dasar bisnis.",
    competencies: [
      "Identifikasi Peluang Bisnis",
      "Penyusunan Rencana Bisnis",
      "Pemasaran Dasar",
      "Pengelolaan Keuangan Sederhana",
    ],
  },
  {
    id: "manajer-kewirausahaan",
    title: "Manajer Kewirausahaan",
    level: "Lanjut",
    icon: "fa-briefcase",
    description:
      "Sertifikasi tingkat lanjut untuk profesional yang mengelola unit bisnis atau inkubator bisnis.",
    competencies: [
      "Manajemen Strategis",
      "Analisis Kelayakan Bisnis",
      "Pengembangan Produk Inovatif",
      "Manajemen Risiko Bisnis",
    ],
  },
  {
    id: "fasilitator-umkm",
    title: "Fasilitator Pendamping UMKM",
    level: "Pendamping",
    icon: "fa-hands-helping",
    description:
      "Bagi konsultan atau pendamping yang bertugas membantu pengembangan skala bisnis UMKM.",
    competencies: [
      "Teknik Coaching dan Mentoring",
      "Audit Kinerja Bisnis",
      "Digitalisasi UMKM",
      "Akses Permodalan",
    ],
  },
];

const FAQS = [
  {
    question: "Apa itu sertifikasi kompetensi BNSP?",
    answer:
      "Sertifikasi kompetensi adalah proses pemberian sertifikat yang menyatakan seseorang kompeten pada bidang tertentu sesuai Standar Kompetensi Kerja Nasional Indonesia (SKKNI) atau standar lain yang diakui.",
  },
  {
    question: "Berapa lama masa berlaku sertifikat?",
    answer:
      "Sertifikat kompetensi umumnya berlaku selama 3 tahun dan dapat diperpanjang melalui proses pemeliharaan kompetensi sesuai ketentuan LSP dan regulasi yang berlaku.",
  },
  {
    question: "Bagaimana cara mendaftar uji kompetensi?",
    answer:
      "Pendaftaran dapat dilakukan secara daring melalui form pada halaman daftar. Siapkan dokumen identitas dan bukti kompetensi sesuai skema yang dipilih, lalu ikuti proses verifikasi dan penjadwalan.",
  },
];

// Helpers
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const API_BASE = "/api";

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Request gagal");
  }
  return res.json();
}

// Mobile nav toggle
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");
navToggle?.addEventListener("click", () => navMenu.classList.toggle("show"));
$$(".nav__link, .btn").forEach((a) => {
  a.addEventListener("click", () => navMenu.classList.remove("show"));
});

// Footer year
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Render schemes
async function renderSchemes() {
  const grid = $("#schemesGrid");
  const sel = $("#schemeSelect");
  if (!grid && !sel) return;

  let schemes = SCHEMES;
  try {
    const remote = await fetchJSON(`${API_BASE}/schemes`);
    if (Array.isArray(remote) && remote.length) schemes = remote;
  } catch (_err) {
    // fallback to local data
  }

  if (grid) {
    grid.innerHTML = schemes.map((s) => {
      const items = s.competencies
        .map((c) => `<li><span><i class="fa-solid fa-check"></i></span>${c}</li>`)
        .join("");
      return `
        <article class="card">
          <div class="card__top">
            <h3><i class="fa-solid ${s.icon}"></i> ${s.title}</h3>
            <span class="tag">Level ${s.level}</span>
          </div>
          <p class="muted">${s.description || ""}</p>
          <ul class="list">${items}</ul>
        </article>
      `;
    }).join("");
  }

  if (sel) {
    const first = sel.querySelector("option");
    sel.innerHTML = "";
    if (first) sel.appendChild(first);
    schemes.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.title;
      opt.textContent = s.title;
      sel.appendChild(opt);
    });
  }
}

// Render FAQ accordion
async function renderFaqs() {
  const wrap = $("#faqAccordion");
  if (!wrap) return;

  let faqs = FAQS;
  try {
    const remote = await fetchJSON(`${API_BASE}/faqs`);
    if (Array.isArray(remote) && remote.length) faqs = remote;
  } catch (_err) {
    // fallback to local data
  }

  wrap.innerHTML = faqs.map((f, i) => {
    return `
      <div class="faq-item">
        <button class="acc" aria-expanded="false" data-idx="${i}">
          <span>${f.question}</span>
          <span class="acc__icon">+</span>
        </button>
        <div class="panel">
          <p class="muted">${f.answer}</p>
        </div>
      </div>
    `;
  }).join("");

  $$(".acc").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";

      // close others
      $$(".acc").forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        const icon = b.querySelector(".acc__icon");
        if (icon) icon.textContent = "+";
        const p = b.nextElementSibling;
        if (p && p.classList.contains("panel")) p.style.display = "none";
      });

      // toggle this
      btn.setAttribute("aria-expanded", String(!expanded));
      const icon = btn.querySelector(".acc__icon");
      if (icon) icon.textContent = expanded ? "+" : "-";
      const panel = btn.nextElementSibling;
      if (panel && panel.classList.contains("panel")) {
        panel.style.display = expanded ? "none" : "block";
      }
    });
  });
}

// Count-up stats
const counters = $$("[data-count]");
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function runCountUp() {
  if (!counters.length) return;
  counters.forEach((el) => {
    const target = Number(el.getAttribute("data-count")) || 0;
    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(target * easeOut(p)).toString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

const heroSection = $(".hero");
if ("IntersectionObserver" in window && heroSection && counters.length) {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        runCountUp();
        io.disconnect();
      }
    },
    { threshold: 0.35 }
  );
  io.observe(heroSection);
} else {
  runCountUp();
}

// Toast
const toastEl = $("#toast");
function toast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
}

// Form validation + optional WhatsApp
const form = $("#regForm");
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());

  // reset errors
  $$(".error").forEach((s) => (s.textContent = ""));

  const setErr = (name, msg) => {
    const field = form.querySelector(`[name="${name}"]`);
    const err = field?.closest("label")?.querySelector("small.error");
    if (err) err.textContent = msg;
  };

  let ok = true;

  if (!data.nama || String(data.nama).trim().length < 3) {
    ok = false;
    setErr("nama", "Nama minimal 3 karakter.");
  }

  const email = String(data.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    ok = false;
    setErr("email", "Email tidak valid.");
  }

  const wa = String(data.wa || "").replace(/\D/g, "");
  if (wa.length < 10) {
    ok = false;
    setErr("wa", "Nomor WhatsApp minimal 10 digit.");
  }

  if (!data.skema) {
    ok = false;
    setErr("skema", "Pilih skema sertifikasi.");
  }

  if (!ok) {
    toast("Periksa kembali form kamu.");
    return;
  }

  try {
    await fetchJSON(`${API_BASE}/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.nama,
        email: data.email,
        wa: data.wa,
        schemeTitle: data.skema,
        notes: data.catatan || null,
      }),
    });
    toast("Berhasil! Data pendaftaran tersimpan.");
  } catch (err) {
    toast("Gagal mengirim. Coba lagi.");
    return;
  }

  // optional: open WhatsApp
  const sendWA = $("#sendToWhatsApp")?.checked;
  if (sendWA) {
    const admin = "6280000000000"; // TODO: ganti nomor admin resmi
    const msg = encodeURIComponent(
      `Halo admin LSP Kewirausahaan, saya ingin daftar uji kompetensi.\n\n` +
        `Nama: ${data.nama}\n` +
        `Skema: ${data.skema}\n` +
        `WhatsApp: ${data.wa}\n` +
        `Email: ${data.email}\n` +
        (data.catatan ? `Catatan: ${data.catatan}\n` : "")
    );
    window.open(`https://wa.me/${admin}?text=${msg}`, "_blank", "noopener,noreferrer");
  }

  form.reset();
});

// Init
renderSchemes();
renderFaqs();
