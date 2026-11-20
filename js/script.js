// ============================================================
// To-Do Life Dashboard — script.js
// ============================================================

// === STATE ===

const SEED_TASKS = [
  { id: "seed-1", text: "Belajar JavaScript 1 jam", done: false },
  { id: "seed-2", text: "Kerjakan tugas RevoU",      done: false },
  { id: "seed-3", text: "Push project ke GitHub",    done: true  }
];

const SEED_LINKS = [
  { id: "seed-l1", name: "Google",  url: "https://www.google.com" },
  { id: "seed-l2", name: "YouTube", url: "https://www.youtube.com" },
  { id: "seed-l3", name: "GitHub",  url: "https://github.com" },
  { id: "seed-l4", name: "ChatGPT", url: "https://chatgpt.com" }
];

const state = {
  userName:        "",
  theme:           "light",
  pomodoroMinutes: 25,
  tasks:           [],
  links:           [],
  timer: {
    intervalId: null,
    remaining:  1500,
    isRunning:  false
  }
};

// tracks which task is in inline edit mode
let editingTaskId = null;

// ============================================================

// === STORAGE ===

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromStorage(key, fallback) {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

// ============================================================

// === CLOCK & GREETING ===

function getGreetingPhrase(hour) {
  if (hour >= 5  && hour <= 10)  return "Selamat pagi";
  if (hour >= 11 && hour <= 14)  return "Selamat siang";
  if (hour >= 15 && hour <= 17)  return "Selamat sore";
  return "Selamat malam";
}

function buildGreetingText(phrase, name) {
  const trimmed = (name || "").trim();
  return trimmed.length > 0 ? `${phrase}, ${trimmed}!` : `${phrase}!`;
}

// ============================================================

// === THEME ===

function detectSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  const safe = (theme === "dark") ? "dark" : "light";
  document.documentElement.dataset.theme = safe;
  state.theme = safe;
  saveToStorage("theme", safe);
}

function toggleTheme() {
  applyTheme(state.theme === "light" ? "dark" : "light");
}

// ============================================================

// === URL HELPER ===

function normalizeUrl(url) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return "https://" + url;
}

// ============================================================

// === INIT ===

(function init() {

  // --- DOM cache ---

  const elClockTime         = document.getElementById("clock-time");
  const elClockDate         = document.getElementById("clock-date");
  const elGreeting          = document.getElementById("greeting");

  const elNameEditorForm    = document.getElementById("name-editor-form");
  const elNameEditInput     = document.getElementById("name-edit-input");
  const elNameEditBtn       = document.getElementById("name-edit-btn");
  const elNameSaveBtn       = document.getElementById("name-save-btn");
  const elNameCancelBtn     = document.getElementById("name-cancel-btn");
  const elNameError         = document.getElementById("name-error");

  const elTimerDisplay      = document.getElementById("timer-display");
  const elTimerStartBtn     = document.getElementById("timer-start-btn");
  const elTimerStopBtn      = document.getElementById("timer-stop-btn");
  const elTimerResetBtn     = document.getElementById("timer-reset-btn");
  const elTimerPresetBtns   = document.getElementById("timer-preset-btns");
  const elTimerCustomForm   = document.getElementById("timer-custom-form");
  const elTimerCustomInput  = document.getElementById("timer-custom-input");
  const elTimerNotification = document.getElementById("timer-notification");
  const elTimerError        = document.getElementById("timer-error");

  const elTodoAddForm  = document.getElementById("todo-add-form");
  const elTodoInput    = document.getElementById("todo-input");
  const elTodoList     = document.getElementById("todo-list");
  const elTodoCounter  = document.getElementById("todo-counter");
  const elTodoEmpty    = document.getElementById("todo-empty");

  const elLinkAddForm   = document.getElementById("link-add-form");
  const elLinkNameInput = document.getElementById("link-name-input");
  const elLinkUrlInput  = document.getElementById("link-url-input");
  const elLinkList      = document.getElementById("link-list");
  const elLinkError     = document.getElementById("link-error");

  const elThemeToggleBtn = document.getElementById("theme-toggle-btn");

  // --- Clock & Greeting ---

  let _lastGreeting = "";

  function updateClock() {
    const now = new Date();
    const HH  = String(now.getHours()).padStart(2, "0");
    const MM  = String(now.getMinutes()).padStart(2, "0");
    const SS  = String(now.getSeconds()).padStart(2, "0");

    elClockTime.textContent = `${HH}:${MM}:${SS}`;
    elClockTime.setAttribute("datetime", now.toISOString());

    const dateStr = now.toLocaleDateString("id-ID", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
    elClockDate.textContent = dateStr;
    elClockDate.setAttribute("datetime", now.toISOString().slice(0, 10));

    const phrase = getGreetingPhrase(now.getHours());
    const greet  = buildGreetingText(phrase, state.userName);
    if (greet !== _lastGreeting) {
      elGreeting.textContent = greet;
      _lastGreeting = greet;
    }
  }

  // --- Username Editor ---

  function enterNameEditMode() {
    elNameEditInput.value = state.userName;
    elNameEditInput.classList.remove("hidden");
    elNameSaveBtn.classList.remove("hidden");
    elNameCancelBtn.classList.remove("hidden");
    elNameEditBtn.classList.add("hidden");
    elNameError.textContent = "";
    elNameEditInput.focus();
  }

  function exitNameEditMode() {
    elNameEditInput.classList.add("hidden");
    elNameSaveBtn.classList.add("hidden");
    elNameCancelBtn.classList.add("hidden");
    elNameEditBtn.classList.remove("hidden");
    elNameError.textContent = "";
  }

  function saveUserName() {
    const trimmed = elNameEditInput.value.trim();
    // Allow empty to clear the name
    if (trimmed.length > 50) {
      elNameError.textContent = "Nama maksimal 50 karakter.";
      return;
    }
    state.userName = trimmed;
    saveToStorage("userName", trimmed);
    _lastGreeting = ""; // force greeting refresh
    elNameError.textContent = "";
    exitNameEditMode();
    updateClock();
  }

  elNameEditorForm.addEventListener("submit", e => {
    e.preventDefault();
    saveUserName();
  });

  elNameEditBtn.addEventListener("click", enterNameEditMode);
  elNameCancelBtn.addEventListener("click", exitNameEditMode);

  elNameEditInput.addEventListener("keydown", e => {
    if (e.key === "Escape") exitNameEditMode();
  });

  // --- Timer ---

  function updatePresetHighlight() {
    elTimerPresetBtns.querySelectorAll(".preset-btn").forEach(btn => {
      const mins = parseInt(btn.dataset.minutes, 10);
      btn.classList.toggle("active", mins === state.pomodoroMinutes);
    });
  }

  function renderTimer() {
    const MM = String(Math.floor(state.timer.remaining / 60)).padStart(2, "0");
    const SS = String(state.timer.remaining % 60).padStart(2, "0");
    elTimerDisplay.textContent = `${MM}:${SS}`;
  }

  function setTimerControls(disabled) {
    elTimerPresetBtns.querySelectorAll("button").forEach(btn => { btn.disabled = disabled; });
    elTimerCustomInput.disabled = disabled;
    elTimerCustomForm.querySelector("button[type='submit']").disabled = disabled;
  }

  function setTimerDuration(minutes) {
    const mins = parseInt(minutes, 10);
    if (isNaN(mins) || mins < 1 || mins > 120) {
      elTimerError.textContent = "Durasi harus antara 1–120 menit.";
      return;
    }
    state.timer.remaining  = mins * 60;
    state.pomodoroMinutes  = mins;
    saveToStorage("pomodoroMinutes", mins);
    elTimerError.textContent = "";
    renderTimer();
    updatePresetHighlight();
  }

  function startTimer() {
    if (state.timer.isRunning) return;
    // If the timer already finished, restart with a fresh duration
    if (state.timer.remaining === 0) {
      state.timer.remaining = state.pomodoroMinutes * 60;
      renderTimer();
    }
    state.timer.isRunning = true;
    elTimerNotification.textContent = "";
    elTimerNotification.classList.add("hidden");
    setTimerControls(true);
    state.timer.intervalId = setInterval(tickTimer, 1000);
  }

  function stopTimer() {
    clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
    state.timer.isRunning  = false;
    setTimerControls(false);
  }

  function resetTimer() {
    stopTimer();
    state.timer.remaining = state.pomodoroMinutes * 60;
    renderTimer();
    elTimerNotification.textContent = "";
    elTimerNotification.classList.add("hidden");
  }

  function tickTimer() {
    state.timer.remaining = Math.max(0, state.timer.remaining - 1);
    if (state.timer.remaining === 0) {
      onTimerEnd();
    } else {
      renderTimer();
    }
  }

  function onTimerEnd() {
    clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
    state.timer.isRunning  = false;
    setTimerControls(false);
    renderTimer();
    elTimerNotification.textContent = "⏰ Waktu fokus selesai! Istirahat sebentar.";
    elTimerNotification.classList.remove("hidden");
    playBeep();
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.2);
    } catch (_) {
      // Audio not available — silent fallback
    }
  }

  elTimerStartBtn.addEventListener("click", startTimer);
  elTimerStopBtn.addEventListener("click", stopTimer);
  elTimerResetBtn.addEventListener("click", resetTimer);

  elTimerCustomForm.addEventListener("submit", e => {
    e.preventDefault();
    setTimerDuration(parseInt(elTimerCustomInput.value, 10));
    elTimerCustomInput.value = "";
  });

  elTimerPresetBtns.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", () => setTimerDuration(parseInt(btn.dataset.minutes, 10)));
  });

  // --- To-Do List ---

  function renderTodoCounter() {
    const done  = state.tasks.filter(t => t.done).length;
    const total = state.tasks.length;
    elTodoCounter.textContent = `${done} dari ${total} tugas selesai`;
  }

  function renderTodoList() {
    elTodoList.innerHTML = "";

    if (state.tasks.length === 0) {
      elTodoEmpty.classList.remove("hidden");
      renderTodoCounter();
      return;
    }

    elTodoEmpty.classList.add("hidden");

    state.tasks.forEach(task => {
      const li = document.createElement("li");
      li.className = "todo-item";
      li.dataset.id = task.id;

      if (task.id === editingTaskId) {
        // Edit mode
        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.className = "task-edit-input";
        editInput.value = task.text;
        editInput.maxLength = 200;
        editInput.setAttribute("aria-label", `Edit tugas: ${task.text}`);
        editInput.addEventListener("keydown", e => {
          if (e.key === "Enter")  { e.preventDefault(); saveEditTask(task.id, editInput.value); }
          if (e.key === "Escape") cancelEditTask();
        });

        const saveBtn = document.createElement("button");
        saveBtn.className = "btn btn-sm btn-primary";
        saveBtn.textContent = "Simpan";
        saveBtn.setAttribute("aria-label", "Simpan perubahan tugas");
        saveBtn.addEventListener("click", () => saveEditTask(task.id, editInput.value));

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "btn btn-sm";
        cancelBtn.textContent = "Batal";
        cancelBtn.setAttribute("aria-label", "Batal edit tugas");
        cancelBtn.addEventListener("click", cancelEditTask);

        li.appendChild(editInput);
        const editActions = document.createElement("div");
        editActions.className = "task-actions";
        editActions.appendChild(saveBtn);
        editActions.appendChild(cancelBtn);
        li.appendChild(editActions);
        setTimeout(() => editInput.focus(), 0);

      } else {
        // Normal mode
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done === true;
        checkbox.id = `task-chk-${task.id}`;
        checkbox.addEventListener("change", () => toggleTask(task.id));

        const label = document.createElement("label");
        label.htmlFor = `task-chk-${task.id}`;
        label.className = "task-text" + (task.done ? " task-done" : "");
        label.textContent = task.text;

        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm";
        editBtn.textContent = "Edit";
        editBtn.setAttribute("aria-label", `Edit tugas: ${task.text}`);
        editBtn.addEventListener("click", () => enterEditTask(task.id));

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-sm btn-danger";
        deleteBtn.textContent = "Hapus";
        deleteBtn.setAttribute("aria-label", `Hapus tugas: ${task.text}`);
        deleteBtn.addEventListener("click", () => deleteTask(task.id));

        li.appendChild(checkbox);
        li.appendChild(label);
        const actions = document.createElement("div");
        actions.className = "task-actions";
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        li.appendChild(actions);
      }

      elTodoList.appendChild(li);
    });

    renderTodoCounter();
  }

  function addTask(text) {
    const trimmed = text.trim().slice(0, 200);
    if (trimmed.length === 0) return;
    state.tasks.push({ id: Date.now().toString(), text: trimmed, done: false });
    saveToStorage("tasks", state.tasks);
    elTodoInput.value = "";
    renderTodoList();
  }

  function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    if (editingTaskId === id) editingTaskId = null;
    saveToStorage("tasks", state.tasks);
    renderTodoList();
  }

  function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      task.done = !task.done;
      saveToStorage("tasks", state.tasks);
      renderTodoList();
    }
  }

  function enterEditTask(id) {
    editingTaskId = id;
    renderTodoList();
  }

  function saveEditTask(id, value) {
    const trimmed = value.trim().slice(0, 200);
    if (trimmed.length === 0) return;
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      task.text = trimmed;
      saveToStorage("tasks", state.tasks);
    }
    editingTaskId = null;
    renderTodoList();
  }

  function cancelEditTask() {
    editingTaskId = null;
    renderTodoList();
  }

  elTodoAddForm.addEventListener("submit", e => {
    e.preventDefault();
    addTask(elTodoInput.value);
  });

  // --- Quick Links ---

  function renderLinks() {
    elLinkList.innerHTML = "";
    state.links.forEach(link => {
      const li = document.createElement("li");
      li.className = "link-item";

      const a = document.createElement("a");
      a.href   = link.url;
      a.target = "_blank";
      a.rel    = "noopener noreferrer";
      a.textContent = link.name;

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-sm btn-danger";
      deleteBtn.textContent = "×";
      deleteBtn.setAttribute("aria-label", `Hapus tautan ${link.name}`);
      deleteBtn.addEventListener("click", () => deleteLink(link.id));

      li.appendChild(a);
      li.appendChild(deleteBtn);
      elLinkList.appendChild(li);
    });
  }

  function addLink(name, url) {
    const trimmedName = name.trim();
    const trimmedUrl  = url.trim();
    if (trimmedName.length === 0 || trimmedUrl.length === 0) {
      elLinkError.textContent = "Nama dan URL tidak boleh kosong.";
      return;
    }
    state.links.push({
      id:   Date.now().toString(),
      name: trimmedName,
      url:  normalizeUrl(trimmedUrl)
    });
    saveToStorage("links", state.links);
    elLinkNameInput.value = "";
    elLinkUrlInput.value  = "";
    elLinkError.textContent = "";
    renderLinks();
  }

  function deleteLink(id) {
    state.links = state.links.filter(l => l.id !== id);
    saveToStorage("links", state.links);
    renderLinks();
  }

  elLinkAddForm.addEventListener("submit", e => {
    e.preventDefault();
    addLink(elLinkNameInput.value, elLinkUrlInput.value);
  });

  // --- Bootstrap sequence ---

  // Theme
  const savedTheme = loadFromStorage("theme", detectSystemTheme());
  applyTheme((savedTheme === "dark") ? "dark" : "light");
  // Sync checkbox to initial theme
  elThemeToggleBtn.checked = (state.theme === "dark");
  elThemeToggleBtn.setAttribute("aria-checked", String(state.theme === "dark"));
  elThemeToggleBtn.addEventListener("change", () => {
    toggleTheme();
    elThemeToggleBtn.setAttribute("aria-checked", String(state.theme === "dark"));
  });

  // Clock
  state.userName = loadFromStorage("userName", "");
  updateClock();
  setInterval(updateClock, 1000);

  // Timer
  const rawMins = loadFromStorage("pomodoroMinutes", 25);
  state.pomodoroMinutes = (typeof rawMins === "number" && rawMins >= 1 && rawMins <= 120)
    ? rawMins : 25;
  state.timer.remaining = state.pomodoroMinutes * 60;
  renderTimer();
  updatePresetHighlight();

  // Tasks
  const rawTasks = loadFromStorage("tasks", null);
  state.tasks = Array.isArray(rawTasks) ? rawTasks : SEED_TASKS;
  if (!Array.isArray(rawTasks)) saveToStorage("tasks", state.tasks);
  renderTodoList();

  // Links
  const rawLinks = loadFromStorage("links", null);
  state.links = Array.isArray(rawLinks) ? rawLinks : SEED_LINKS;
  if (!Array.isArray(rawLinks)) saveToStorage("links", state.links);
  renderLinks();

})();
