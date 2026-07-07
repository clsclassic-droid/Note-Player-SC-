const CONFIG = {
  // Paste the Google Apps Script Web App URL here after deploying it (see README.md).
  APPS_SCRIPT_URL: "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE",
  // SHA-256 hash of the gate password. Default password is "noteplayer2026".
  // To change it, see the instructions in README.md.
  PASSWORD_HASH: "6e4b0e55f212666c6d78a200d8a83d66a74439f3083d2f955c30352ee75040e3",
};

const gateScreen = document.getElementById("gate");
const appScreen = document.getElementById("app");
const gatePasswordInput = document.getElementById("gate-password");
const gateSubmit = document.getElementById("gate-submit");
const gateError = document.getElementById("gate-error");
const logoutBtn = document.getElementById("logout");
const refreshBtn = document.getElementById("refresh-btn");
const form = document.getElementById("record-form");
const formStatus = document.getElementById("form-status");
const recordsBody = document.getElementById("records-body");

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function showApp() {
  gateScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
  loadRecords();
}

function showGate() {
  appScreen.classList.add("hidden");
  gateScreen.classList.remove("hidden");
}

async function tryUnlock() {
  const value = gatePasswordInput.value;
  const hash = await sha256(value);
  if (hash === CONFIG.PASSWORD_HASH) {
    gateError.classList.add("hidden");
    sessionStorage.setItem("np_unlocked", "1");
    showApp();
  } else {
    gateError.classList.remove("hidden");
  }
}

gateSubmit.addEventListener("click", tryUnlock);
gatePasswordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") tryUnlock();
});

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("np_unlocked");
  gatePasswordInput.value = "";
  showGate();
});

function setStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = "status" + (type ? " " + type : "");
  formStatus.classList.remove("hidden");
}

function renderRecords(records) {
  if (!records || records.length === 0) {
    recordsBody.innerHTML = '<tr><td colspan="5" class="empty">ยังไม่มีข้อมูล</td></tr>';
    return;
  }
  recordsBody.innerHTML = records
    .map((r) => {
      const time = r.timestamp ? new Date(r.timestamp).toLocaleString("th-TH") : "";
      return `<tr>
        <td>${escapeHtml(time)}</td>
        <td>${escapeHtml(r.player)}</td>
        <td>${escapeHtml(r.race)}</td>
        <td>${escapeHtml(r.strategy)}</td>
        <td>${escapeHtml(r.manner)}</td>
      </tr>`;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

async function loadRecords() {
  if (!isConfigured()) return;
  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL);
    const data = await res.json();
    renderRecords(data);
  } catch (err) {
    recordsBody.innerHTML = '<tr><td colspan="5" class="empty">โหลดข้อมูลไม่สำเร็จ</td></tr>';
  }
}

function isConfigured() {
  return CONFIG.APPS_SCRIPT_URL && !CONFIG.APPS_SCRIPT_URL.startsWith("PASTE_YOUR");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!isConfigured()) {
    setStatus("ยังไม่ได้ตั้งค่า APPS_SCRIPT_URL ใน app.js (ดู README.md)", "error");
    return;
  }

  const player = document.getElementById("player").value.trim();
  const race = document.getElementById("race").value.trim();
  const strategy = document.getElementById("strategy").value.trim();
  const manner = document.getElementById("manner").value.trim();

  if (!player || !race || !strategy || !manner) {
    setStatus("กรุณากรอกข้อมูลให้ครบทุกช่อง", "error");
    return;
  }

  const submitBtn = document.getElementById("submit-btn");
  submitBtn.disabled = true;
  setStatus("กำลังบันทึก...", "");

  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      body: new URLSearchParams({ player, race, strategy, manner }),
    });
    const result = await res.json();
    if (result.result === "success") {
      form.reset();
      setStatus("บันทึกข้อมูลสำเร็จ", "ok");
      loadRecords();
    } else {
      setStatus("บันทึกไม่สำเร็จ กรุณาลองใหม่", "error");
    }
  } catch (err) {
    setStatus("เกิดข้อผิดพลาด กรุณาลองใหม่", "error");
  } finally {
    submitBtn.disabled = false;
  }
});

refreshBtn.addEventListener("click", loadRecords);

if (sessionStorage.getItem("np_unlocked") === "1") {
  showApp();
}
