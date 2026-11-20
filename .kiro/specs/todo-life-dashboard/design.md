# Design Document

## Overview

To-Do Life Dashboard adalah aplikasi web satu halaman (SPA) berbasis Vanilla HTML, CSS, dan JavaScript yang membantu pengguna mengorganisasi hari mereka. Tidak ada framework, tidak ada build step — aplikasi dibuka langsung sebagai file `index.html` di browser.

Aplikasi terdiri dari empat widget utama yang ditampilkan dalam satu layar:

1. **Clock & Greeting** — jam real-time HH:MM:SS + tanggal format Indonesia + sapaan kontekstual berdasarkan rentang waktu.
2. **Focus Timer (Pomodoro)** — penghitung mundur dengan preset dan input kustom, notifikasi in-page saat selesai.
3. **To-Do List** — CRUD lengkap dengan status done, inline editing, penghitung progres.
4. **Quick Links** — daftar tautan cepat yang dapat dikustomisasi, dibuka di tab baru.

Data disimpan sepenuhnya di `localStorage` browser. UI berbahasa Indonesia dan mendukung mode terang/gelap via CSS custom properties.

---

## Architecture

### Pola Arsitektur

Aplikasi mengikuti **State → Render → Event** cycle tanpa framework reaktif:

```
┌─────────────────────────────────────────────┐
│                  index.html                 │
│  (struktur DOM statis, titik masuk utama)   │
└──────────────┬──────────────────────────────┘
               │ loads
┌──────────────▼──────────────────────────────┐
│               js/script.js                  │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  State   │  │ Storage  │  │  Render  │  │
│  │ (in-mem) │◄─┤ Helpers  ├─►│Functions │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│       ▲                           │         │
│       │         Event Handlers    │         │
│       └───────────────────────────┘         │
└─────────────────────────────────────────────┘
               │ styles
┌──────────────▼──────────────────────────────┐
│               css/style.css                 │
│  (CSS custom properties, tema, layout)      │
└─────────────────────────────────────────────┘
```

### Prinsip Desain

- **Single source of truth**: semua data hidup di satu objek `state` in-memory; setiap perubahan memanggil `saveToStorage()` lalu fungsi render terkait.
- **No innerHTML dengan user input**: semua teks dari pengguna di-set via `textContent` untuk mencegah XSS.
- **Graceful degradation**: setiap baca dari `localStorage` dibungkus `try/catch` dengan fallback aman.
- **Minimal DOM queries**: elemen DOM di-cache saat init, tidak di-query ulang setiap render.

### Struktur File

```
index.html          ← struktur DOM, link ke CSS & JS
css/
  style.css         ← semua gaya, termasuk CSS variables & responsive
js/
  script.js         ← seluruh logika aplikasi (satu file)
README.md
```

---

## Components and Interfaces

### 1. Clock Component

**Tanggung jawab**: menampilkan jam, tanggal, dan sapaan; diperbarui setiap detik via `setInterval`.

**DOM elements yang digunakan**:

- `#clock-time` — teks HH:MM:SS
- `#clock-date` — teks tanggal format Indonesia
- `#greeting` — teks sapaan (mis. "Selamat pagi, Rina!")

**Fungsi publik (dalam script.js)**:

```
updateClock()        → void   — dipanggil setiap 1000ms
getGreetingPhrase(hour: number) → string — mengembalikan frasa berdasarkan jam
buildGreetingText(phrase: string, name: string) → string — menggabungkan frasa + nama
```

**Ketergantungan**: `state.userName`

---

### 2. Username Editor Component

**Tanggung jawab**: menampilkan nama pengguna dan menyediakan mode edit inline.

**DOM elements**:

- `#greeting-display` — area sapaan (berisi `#greeting`)
- `#name-edit-input` — input teks untuk edit nama (tersembunyi saat bukan mode edit)
- `#name-edit-btn` — tombol "Ubah nama"
- `#name-save-btn` — tombol "Simpan" (hanya tampil saat edit)
- `#name-cancel-btn` — tombol "Batal" (hanya tampil saat edit)
- `#name-error` — elemen error message

**Fungsi**:

```
enterNameEditMode()  → void
exitNameEditMode()   → void
saveUserName()       → void   — validasi lalu simpan ke state & storage
```

**Validasi**:

- Tolak jika nilai hanya spasi atau kosong
- Tolak jika panjang > 50 karakter
- Simpan pesan error ke `#name-error` via `textContent`

---

### 3. Timer Component

**Tanggung jawab**: penghitung mundur Pomodoro dengan kontrol start/stop/reset dan pemilihan durasi.

**DOM elements**:

- `#timer-display` — teks MM:SS
- `#timer-start-btn`, `#timer-stop-btn`, `#timer-reset-btn`
- `#timer-preset-btns` — container tombol preset (15, 25, 45 menit)
- `#timer-custom-input` — input angka untuk durasi kustom
- `#timer-notification` — pesan in-page saat timer selesai
- `#timer-error` — pesan error validasi durasi

**State timer (in-memory, bagian dari `state`)**:

```javascript
state.timer = {
  intervalId: null,  // ID dari setInterval, null jika tidak berjalan
  remaining:  1500,  // sisa detik
  isRunning:  false
};
```

**Fungsi**:

```
startTimer()                      → void
stopTimer()                       → void
resetTimer()                      → void
tickTimer()                       → void  — dipanggil setiap detik, kurangi remaining
onTimerEnd()                      → void  — tampilkan notifikasi, re-enable controls
setTimerDuration(minutes: number) → void
renderTimer()                     → void
```

**Aturan kontrol**:

- `startTimer()` tidak melakukan apa-apa jika `state.timer.isRunning === true`
- Semua kontrol durasi (preset buttons + custom input) di-disable saat `isRunning`
- `remaining` tidak pernah turun di bawah 0

---

### 4. TodoList Component

**Tanggung jawab**: CRUD tugas dengan status done, inline edit, dan penghitung progres.

**DOM elements**:

- `#todo-input` — input teks tugas baru
- `#todo-add-btn` — tombol tambah
- `#todo-list` — `<ul>` container tugas
- `#todo-counter` — teks "[x] dari [n] tugas selesai"
- `#todo-empty` — pesan kosong (tersembunyi jika ada tugas)

**Tiap item tugas dirender sebagai `<li>` dengan**:

- `<input type="checkbox">` untuk status done
- `<span class="task-text">` untuk teks (atau `<input>` saat edit)
- Tombol Edit, Save, Cancel, Delete

**Fungsi**:

```
addTask(text: string)                      → void
deleteTask(id: string)                     → void
toggleTask(id: string)                     → void
enterEditTask(id: string)                  → void
saveEditTask(id: string, text: string)     → void
cancelEditTask(id: string)                 → void
renderTodoList()                           → void
renderTodoCounter()                        → void
```

**Validasi tambah/simpan**:

- Tolak jika kosong atau hanya spasi
- Potong teks ke 200 karakter saat menyimpan

---

### 5. LinkManager Component

**Tanggung jawab**: mengelola tautan cepat, membuka di tab baru.

**DOM elements**:

- `#link-name-input`, `#link-url-input` — input form
- `#link-add-btn` — tombol tambah
- `#link-list` — container kartu tautan
- `#link-error` — pesan error validasi

**Tiap tautan dirender sebagai `<a>` + tombol hapus**.

**Fungsi**:

```
addLink(name: string, url: string) → void
deleteLink(id: string)             → void
normalizeUrl(url: string)          → string  — prepend https:// jika perlu
renderLinks()                      → void
```

**Validasi**:

- Tolak jika name atau url kosong/hanya spasi
- `normalizeUrl` menambahkan `https://` jika url tidak diawali `http://` atau `https://`

---

### 6. ThemeToggle Component

**Tanggung jawab**: beralih antara mode terang dan gelap.

**DOM elements**:

- `#theme-toggle-btn` — tombol toggle dengan ikon (🌙 / ☀️)

**Fungsi**:

```
applyTheme(theme: "light" | "dark") → void
toggleTheme()                       → void
detectSystemTheme()                 → "light" | "dark"
```

**Mekanisme**: `applyTheme` men-set `document.documentElement.dataset.theme` dan menyimpan ke storage.

---

## Data Models

### Task

```javascript
/**
 * @typedef {Object} Task
 * @property {string}  id   - Timestamp string, unik per tugas
 * @property {string}  text - Deskripsi tugas, 1–200 karakter
 * @property {boolean} done - Status penyelesaian
 */
```

Contoh:

```json
{ "id": "1700000001000", "text": "Belajar JavaScript 1 jam", "done": false }
```

### Link

```javascript
/**
 * @typedef {Object} Link
 * @property {string} id   - Timestamp string, unik per tautan
 * @property {string} name - Nama tampilan tautan
 * @property {string} url  - URL lengkap, selalu diawali http:// atau https://
 */
```

Contoh:

```json
{ "id": "1700000002000", "name": "GitHub", "url": "https://github.com" }
```

### Application State (in-memory)

```javascript
const state = {
  userName:        "",      // string, dari localStorage atau ""
  theme:           "light", // "light" | "dark"
  pomodoroMinutes: 25,      // number, 1–120
  tasks:           [],      // Task[]
  links:           [],      // Link[]
  timer: {
    intervalId: null,   // ReturnType<setInterval> | null
    remaining:  1500,   // number, detik tersisa (≥ 0)
    isRunning:  false   // boolean
  }
};
```

### localStorage Keys dan Skema

| Key               | Tipe tersimpan         | Fallback jika rusak/tidak ada  |
|-------------------|------------------------|--------------------------------|
| `userName`        | string                 | `""`                           |
| `theme`           | `"light"` / `"dark"`   | hasil `prefers-color-scheme`   |
| `pomodoroMinutes` | number string          | `25`                           |
| `tasks`           | JSON array             | `[]`                           |
| `links`           | JSON array             | `[]`                           |

### Storage Helper Interface

```javascript
function saveToStorage(key, value)       // JSON.stringify + localStorage.setItem
function loadFromStorage(key, fallback)  // localStorage.getItem + JSON.parse dalam try/catch
```

### Seed Data

**Tasks** (dipakai hanya jika `localStorage.getItem("tasks") === null`):

```json
[
  { "id": "seed-1", "text": "Belajar JavaScript 1 jam", "done": false },
  { "id": "seed-2", "text": "Kerjakan tugas RevoU",      "done": false },
  { "id": "seed-3", "text": "Push project ke GitHub",    "done": true  }
]
```

**Links** (dipakai hanya jika `localStorage.getItem("links") === null`):

```json
[
  { "id": "seed-l1", "name": "Google",   "url": "https://google.com"      },
  { "id": "seed-l2", "name": "YouTube",  "url": "https://youtube.com"     },
  { "id": "seed-l3", "name": "GitHub",   "url": "https://github.com"      },
  { "id": "seed-l4", "name": "ChatGPT",  "url": "https://chat.openai.com" }
]
```

---

### Tata Letak (Layout)

```
┌─────────────────────────────────────────┐
│          HEADER (Clock + Greeting)      │  ← full width
└─────────────────────────────────────────┘
┌──────────────────┐ ┌───────────────────┐
│   Focus Timer    │ │   Quick Links     │  ← dua kolom ≥768px
└──────────────────┘ └───────────────────┘
┌─────────────────────────────────────────┐
│              To-Do List                 │  ← full width
└─────────────────────────────────────────┘
```

Di bawah 768px, semua kolom menumpuk vertikal.

### CSS Custom Properties (tema)

```css
[data-theme="light"] {
  --bg:         #F7F5F0;   /* soft cream */
  --card-bg:    #FFFFFF;
  --accent:     #7C83FD;   /* biru-ungu pastel */
  --accent-alt: #6C63FF;
  --text:       #2D2D3A;   /* dark slate */
  --text-muted: #6B6B80;
  --shadow:     0 2px 12px rgba(0,0,0,0.08);
}

[data-theme="dark"] {
  --bg:         #1E2030;   /* biru abu-abu gelap */
  --card-bg:    #2A2D43;
  --accent:     #9198FF;
  --accent-alt: #7C83FD;
  --text:       #E8E8F0;
  --text-muted: #9898B0;
  --shadow:     0 2px 12px rgba(0,0,0,0.3);
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Timer tidak pernah negatif

*For any* starting duration in [1, 120] minutes and any number of `tickTimer()` calls, the value of `state.timer.remaining` SHALL never fall below 0.

**Validates: Requirements 3.4, 3.8**

---

### Property 2: Round-trip serialisasi data ke localStorage

*For any* array of Task or Link objects with valid fields, serializing with `JSON.stringify` then deserializing with `JSON.parse` SHALL produce an array that is deeply equal to the original; and for any corrupted string stored in localStorage, `loadFromStorage` SHALL return the designated fallback value without throwing an exception.

**Validates: Requirements 4.15, 4.16, 5.7, 5.8, 8.1**

---

### Property 3: URL tautan selalu memiliki skema yang valid

*For any* string passed to `normalizeUrl(url)`, the returned value SHALL always start with either `http://` or `https://`.

**Validates: Requirements 5.3, 5.4**

---

### Property 4: Theme toggle selalu menghasilkan nilai yang valid dan berbeda

*For any* initial theme value (`"light"` or `"dark"`), calling `toggleTheme()` SHALL result in `state.theme` being exactly `"light"` or `"dark"`, and the resulting value SHALL differ from the value before the call.

**Validates: Requirements 6.3, 6.4**

---

### Property 5: Sapaan selalu sesuai rentang waktu

*For any* hour value in [0, 23], `getGreetingPhrase(hour)` SHALL return exactly one of "Selamat pagi", "Selamat siang", "Selamat sore", or "Selamat malam", and the phrase SHALL correspond to the correct hour range: pagi [5–10], siang [11–14], sore [15–17], malam ([18–23] ∪ [0–4]).

**Validates: Requirements 1.3, 1.4, 1.5, 1.6, 1.7**

---

### Property 6: Penambahan dan penghapusan tugas adalah invers satu sama lain

*For any* task list and any valid (non-empty, ≤200 char) task text, adding a task to the list and then immediately deleting that same task SHALL return the list to its original length and contents.

**Validates: Requirements 4.3, 4.12**

---

### Property 7: Toggle status done adalah round-trip

*For any* task, calling `toggleTask(id)` twice in succession SHALL result in the task's `done` field having the same value as before the first call.

**Validates: Requirements 4.5, 4.6**

---

### Property 8: Validasi input nama menolak semua string tidak valid

*For any* string that is entirely composed of whitespace characters, or whose trimmed length exceeds 50 characters, calling `saveUserName` SHALL leave `localStorage["userName"]` unchanged and SHALL display an error message.

**Validates: Requirements 2.7, 2.8**

---

### Property 9: Durasi timer kustom yang valid selalu disimpan dan diterapkan

*For any* integer in [1, 120], calling `setTimerDuration(minutes)` SHALL set `state.timer.remaining` to `minutes * 60` and SHALL write the value to `localStorage["pomodoroMinutes"]`.

**Validates: Requirements 3.9, 3.10**

---

### Property 10: Penghitung tugas selalu akurat

*For any* array of tasks with arbitrary `done` values, the counter text rendered by `renderTodoCounter()` SHALL display the exact count of tasks where `done === true` as the first number and the total array length as the second number.

**Validates: Requirements 4.14**

---

## Error Handling

### Storage Read Failures

Semua pembacaan `localStorage` menggunakan pola berikut:

```javascript
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
```

Fallback per key:

- `tasks` → `[]`
- `links` → `[]`
- `userName` → `""`
- `pomodoroMinutes` → `25`
- `theme` → `detectSystemTheme()`

### Input Validation Errors

Kesalahan validasi ditampilkan **in-page** (bukan `alert()` atau `console.error()`):

- Setiap komponen memiliki elemen `*-error` tersendiri.
- Error di-set via `element.textContent = pesan` (tidak `innerHTML`).
- Error dibersihkan saat pengguna mulai mengetik atau aksi berhasil.

### Timer Boundary

`tickTimer()` memiliki guard:

```javascript
function tickTimer() {
  state.timer.remaining = Math.max(0, state.timer.remaining - 1);
  if (state.timer.remaining === 0) onTimerEnd();
  renderTimer();
}
```

Ini memastikan `remaining` tidak pernah negatif bahkan jika `setInterval` memanggil fungsi lebih dari yang diharapkan.

### XSS Prevention

Semua teks yang bersumber dari input pengguna (nama, teks tugas, nama tautan) di-render via `element.textContent = nilai`, **bukan** via `innerHTML`. Ini berlaku untuk semua fungsi render.

---

## Testing Strategy

### Pendekatan Dual Testing

Strategi pengujian menggunakan dua lapisan:

1. **Unit tests (example-based)**: memverifikasi perilaku spesifik dengan input konkret — kasus tepi, error conditions, interaksi komponen.
2. **Property-based tests (PBT)**: memverifikasi properti universal di ribuan input acak — menggunakan library [fast-check](https://github.com/dubzzz/fast-check) (tersedia via CDN atau npm, cocok untuk Vanilla JS).

Karena aplikasi ini berisi logika murni (parser URL, serialisasi JSON, state machine timer, pemetaan jam ke sapaan), PBT sangat tepat untuk memverifikasi Properties 1–10 di atas.

### Unit Test Targets

| Komponen         | Kasus yang diuji                                                       |
|------------------|------------------------------------------------------------------------|
| Clock            | `getGreetingPhrase` untuk setiap jam batas (0, 5, 11, 15, 18, 23)    |
| Username Editor  | Validasi: kosong, hanya spasi, > 50 karakter, valid                   |
| Timer            | Start → Stop → Reset, durasi kustom di luar 1-120 ditolak             |
| TodoList         | Tambah tugas valid, tambah tugas kosong diabaikan, toggle done, hapus |
| LinkManager      | `normalizeUrl` untuk URL tanpa awalan, dengan http, dengan https      |
| ThemeToggle      | Toggle light→dark, dark→light; baca sistem preference                 |
| Storage          | `loadFromStorage` dengan JSON rusak mengembalikan fallback            |

### Property-Based Test Configuration

Library: **fast-check** (minimum 100 iterasi per properti)

Setiap test PBT diberi tag komentar:

```javascript
// Feature: todo-life-dashboard, Property N: <teks properti>
```

| Property                  | Generator                                                                                                      | Assertion                                                                                   |
|---------------------------|----------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| P1 (Timer ≥ 0)            | `fc.integer({min:1, max:120})` untuk durasi awal; `fc.integer({min:0, max:10000})` untuk jumlah tick           | `remaining >= 0` selalu                                                                     |
| P2 (Round-trip + fallback) | `fc.array(fc.record({id:fc.string(), text:fc.string({minLength:1,maxLength:200}), done:fc.boolean()}))` untuk valid; `fc.string()` untuk corrupt | Round-trip deep equals; corrupt input returns fallback without throwing |
| P3 (URL valid)            | `fc.string()` sebagai input URL sembarang                                                                      | `normalizeUrl(url).startsWith("http://") \|\| normalizeUrl(url).startsWith("https://")`     |
| P4 (Theme toggle)         | `fc.constantFrom("light", "dark")` sebagai initial theme                                                       | Setelah toggle: nilai berbeda dari sebelumnya, dan hanya "light" atau "dark"                |
| P5 (Greeting)             | `fc.integer({min:0, max:23})` sebagai jam                                                                      | Hasil hanya salah satu dari 4 frasa; frasa sesuai rentang                                   |
| P6 (Add+Delete inverse)   | `fc.array(taskRecord)` + `fc.string({minLength:1, maxLength:200})`                                             | Setelah add lalu delete, panjang dan isi array kembali sama                                 |
| P7 (Toggle done round-trip) | `fc.array(taskRecord, {minLength:1})`                                                                        | Toggle dua kali mengembalikan `done` ke nilai semula                                        |
| P8 (Nama tidak valid ditolak) | `fc.string().filter(s => s.trim()==="")` + `fc.string({minLength:51})`                                     | localStorage `userName` tidak berubah; error message ditampilkan                           |
| P9 (Durasi valid disimpan) | `fc.integer({min:1, max:120})`                                                                                | `remaining === minutes*60`; `localStorage.pomodoroMinutes === String(minutes)`              |
| P10 (Counter akurat)      | `fc.array(taskRecord)`                                                                                         | Counter string menampilkan jumlah `done===true` yang tepat dari total                       |

### Pembagian Tanggung Jawab Test

- **Properties P1–P10**: property-based tests (fast-check), ≥100 iterasi masing-masing.
- **Validasi input** (nama > 50 char, durasi luar rentang, task kosong): unit tests example-based.
- **UI state** (disable controls saat timer berjalan, inline edit mode): unit tests example-based dengan DOM mock minimal.
- **Integrasi storage**: unit tests yang men-spy `localStorage.setItem` / `localStorage.getItem`.
- **Smoke tests**: membuka `index.html` langsung di browser dan verifikasi tidak ada console error.
