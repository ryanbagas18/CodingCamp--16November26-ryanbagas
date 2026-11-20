# Implementation Plan: To-Do Life Dashboard

## Overview

Implement a single-page vanilla JS dashboard in three files (`index.html`, `css/style.css`, `js/script.js`) with no build step. Tasks follow the State → Render → Event cycle defined in the design and are ordered so each step compiles on the previous one.

## Tasks

- [x] 1. Project scaffold
  - [x] 1.1 Create `index.html` with semantic structure
    - Write `<header>`, `<main>`, `<section>` elements for Clock/Greeting, Timer, Quick Links, and To-Do List
    - Add all required element IDs referenced in the design (`#clock-time`, `#clock-date`, `#greeting`, `#greeting-display`, `#name-edit-input`, `#name-edit-btn`, `#name-save-btn`, `#name-cancel-btn`, `#name-error`, `#timer-display`, `#timer-start-btn`, `#timer-stop-btn`, `#timer-reset-btn`, `#timer-preset-btns`, `#timer-custom-input`, `#timer-notification`, `#timer-error`, `#todo-input`, `#todo-add-btn`, `#todo-list`, `#todo-counter`, `#todo-empty`, `#link-name-input`, `#link-url-input`, `#link-add-btn`, `#link-list`, `#link-error`, `#theme-toggle-btn`)
    - Link `css/style.css` and `js/script.js`; load Poppins from Google Fonts
    - Add `aria-label` attributes on all icon-only buttons
    - _Requirements: 7.1, 7.9, 8.3_

  - [x] 1.2 Create `css/style.css` with custom properties and base layout
    - Define `[data-theme="light"]` and `[data-theme="dark"]` CSS custom property blocks with the exact colour values from the design
    - Write base typography (Poppins, fallback `system-ui, sans-serif`), card styles (border-radius 16–20px, box-shadow, padding), and two-column grid for Timer + Quick Links (`≥768px`), single-column stacking below 768px
    - Add `transition: 0.2s` on interactive elements, `:focus-visible` outline (min 2px), and `text-decoration: line-through` / `opacity: 0.5` classes for done tasks
    - Set clock font-size in range 2.75rem–3.25rem bold
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 1.3 Create `js/script.js` skeleton with section comments and state object
    - Write section comment blocks: `// === STATE ===`, `// === STORAGE ===`, `// === CLOCK & GREETING ===`, `// === USERNAME EDITOR ===`, `// === TIMER ===`, `// === TODO ===`, `// === LINKS ===`, `// === THEME ===`, `// === INIT ===`
    - Define the `state` object with all fields from the design (`userName`, `theme`, `pomodoroMinutes`, `tasks`, `links`, `timer` sub-object)
    - Cache all DOM element references at the top of the INIT section (do not re-query in render loops)
    - _Requirements: 8.5_

- [x] 2. Storage helpers
  - [x] 2.1 Implement `loadFromStorage` and `saveToStorage`
    - `saveToStorage(key, value)` calls `JSON.stringify` then `localStorage.setItem`
    - `loadFromStorage(key, fallback)` wraps `localStorage.getItem` + `JSON.parse` in `try/catch`; returns `fallback` when the item is `null` or JSON is malformed
    - _Requirements: 8.1, 4.16, 5.8_

  - [ ] 2.2 Write property test for round-trip serialisation (Property 2)
    - **Property 2: Round-trip serialisasi data ke localStorage**
    - Use `fc.array(fc.record({id: fc.string(), text: fc.string({minLength:1, maxLength:200}), done: fc.boolean()}))` to verify JSON round-trip produces deep-equal output
    - Use `fc.string()` as corrupt input and assert `loadFromStorage` returns the fallback without throwing
    - **Validates: Requirements 4.15, 4.16, 5.7, 5.8, 8.1**

- [x] 3. Clock & Greeting
  - [x] 3.1 Implement `getGreetingPhrase`, `buildGreetingText`, and `updateClock`
    - `getGreetingPhrase(hour)` maps hour [0–23] to exactly one of "Selamat pagi" (5–10), "Selamat siang" (11–14), "Selamat sore" (15–17), "Selamat malam" (18–23 and 0–4)
    - `buildGreetingText(phrase, name)` returns `"[phrase], [name]!"` when name is non-empty, else `"[phrase]!"`
    - `updateClock()` reads `new Date()`, updates `#clock-time` (HH:MM:SS), `#clock-date` (full Indonesian date string), and `#greeting` via `textContent`; reads `state.userName`
    - Wire `setInterval(updateClock, 1000)` and call `updateClock()` once immediately in INIT
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2_

  - [ ] 3.2 Write property test for greeting phrase (Property 5)
    - **Property 5: Sapaan selalu sesuai rentang waktu**
    - Use `fc.integer({min:0, max:23})` and assert the return value is one of the four valid phrases and maps to the correct hour range
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6, 1.7**

- [x] 4. Username Editor
  - [x] 4.1 Implement `enterNameEditMode`, `exitNameEditMode`, and `saveUserName`
    - `enterNameEditMode()` shows `#name-edit-input` (pre-filled with `state.userName`), `#name-save-btn`, `#name-cancel-btn`; hides `#name-edit-btn`
    - `exitNameEditMode()` reverses the above visibility
    - `saveUserName()` trims the input value; rejects if empty/whitespace (displays error via `#name-error.textContent`) or length > 50 (displays error); on success saves to `state.userName`, calls `saveToStorage("userName", ...)`, clears `#name-error`, calls `exitNameEditMode()`, then `updateClock()`
    - Bind Enter key on `#name-edit-input` to `saveUserName()`; bind Escape key to `exitNameEditMode()`
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ] 4.2 Write property test for username validation (Property 8)
    - **Property 8: Validasi input nama menolak semua string tidak valid**
    - Use `fc.string().filter(s => s.trim() === "")` and `fc.string({minLength: 51})` to verify `localStorage["userName"]` is unchanged and `#name-error` has non-empty text content after each attempt
    - **Validates: Requirements 2.7, 2.8**

- [x] 5. Focus Timer
  - [x] 5.1 Implement `renderTimer`, `setTimerDuration`, `startTimer`, `stopTimer`, `resetTimer`, `tickTimer`, and `onTimerEnd`
    - `renderTimer()` formats `state.timer.remaining` as MM:SS and sets `#timer-display.textContent`
    - `setTimerDuration(minutes)` validates range [1–120]; on invalid shows `#timer-error.textContent` and returns; on valid sets `state.timer.remaining = minutes * 60`, `state.pomodoroMinutes = minutes`, calls `saveToStorage("pomodoroMinutes", minutes)`, clears error, calls `renderTimer()`
    - `startTimer()` guards against double-start (`isRunning` check); sets `isRunning = true`, disables all duration controls (preset buttons + `#timer-custom-input`), stores `setInterval(tickTimer, 1000)` in `state.timer.intervalId`
    - `stopTimer()` clears the interval, sets `isRunning = false`, re-enables controls
    - `resetTimer()` calls `stopTimer()`, resets `remaining` to `state.pomodoroMinutes * 60`, calls `renderTimer()`
    - `tickTimer()` uses `Math.max(0, remaining - 1)`; calls `onTimerEnd()` when `remaining === 0`, else calls `renderTimer()`
    - `onTimerEnd()` clears interval, sets `isRunning = false`, re-enables controls, sets `#timer-notification.textContent` to a session-complete message
    - Bind preset buttons (15, 25, 45) to `setTimerDuration`; bind `#timer-custom-input` change to `setTimerDuration` with parsed integer; bind start/stop/reset buttons
    - On INIT load `pomodoroMinutes` from storage and call `renderTimer()`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12_

  - [ ] 5.2 Write property test for timer non-negative invariant (Property 1)
    - **Property 1: Timer tidak pernah negatif**
    - Use `fc.integer({min:1, max:120})` for initial duration and `fc.integer({min:0, max:10000})` for tick count; assert `state.timer.remaining >= 0` after all ticks
    - **Validates: Requirements 3.4, 3.8**

  - [ ] 5.3 Write property test for valid custom duration persistence (Property 9)
    - **Property 9: Durasi timer kustom yang valid selalu disimpan dan diterapkan**
    - Use `fc.integer({min:1, max:120})` and assert `state.timer.remaining === minutes * 60` and `localStorage["pomodoroMinutes"] === String(minutes)` after `setTimerDuration(minutes)`
    - **Validates: Requirements 3.9, 3.10**

- [x] 6. Checkpoint — timer and clock
  - Ensure clock updates every second, greeting changes with hour, timer counts down without going below zero, all controls disable while running, and `onTimerEnd` fires correctly. Ask the user if questions arise.

- [ ] 7. To-Do List
  - [x] 7.1 Implement `renderTodoList` and `renderTodoCounter`
    - `renderTodoList()` clears `#todo-list`, iterates `state.tasks`, and builds each `<li>` with a checkbox, `<span class="task-text">`, and Edit/Delete buttons; sets text via `textContent` only; shows/hides `#todo-empty` when array is empty
    - Apply `text-decoration: line-through` and `opacity: 0.5` styles when `done === true`
    - `renderTodoCounter()` sets `#todo-counter.textContent` to `"[doneCount] dari [total] tugas selesai"`
    - _Requirements: 4.5, 4.6, 4.13, 4.14_

  - [x] 7.2 Implement `addTask`, `deleteTask`, and `toggleTask`
    - `addTask(text)` trims input; ignores if empty; truncates to 200 chars; pushes `{id: Date.now().toString(), text, done: false}` to `state.tasks`; calls `saveToStorage("tasks", ...)`, `renderTodoList()`, `renderTodoCounter()`
    - `deleteTask(id)` filters `state.tasks`, saves, re-renders
    - `toggleTask(id)` flips `done` on the matching task, saves, re-renders
    - Bind `#todo-add-btn` and Enter on `#todo-input` to `addTask`; bind checkbox change to `toggleTask`; bind delete buttons to `deleteTask`
    - On INIT load tasks from storage (seed if `null`), call `renderTodoList()` and `renderTodoCounter()`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.12, 4.15_

  - [x] 7.3 Implement `enterEditTask`, `saveEditTask`, and `cancelEditTask`
    - `enterEditTask(id)` replaces `<span class="task-text">` with `<input>` pre-filled with the task text (max 200 chars); shows Save/Cancel buttons; hides Edit button
    - `saveEditTask(id, text)` trims value; ignores if empty; updates `state.tasks`, saves, calls `renderTodoList()` and `renderTodoCounter()`
    - `cancelEditTask(id)` calls `renderTodoList()` without saving
    - Bind Enter key in edit input to `saveEditTask`; Escape to `cancelEditTask`
    - _Requirements: 4.7, 4.8, 4.9, 4.10, 4.11_

  - [ ] 7.4 Write property test for add/delete inverse (Property 6)
    - **Property 6: Penambahan dan penghapusan tugas adalah invers satu sama lain**
    - Use `fc.array(taskRecord)` and `fc.string({minLength:1, maxLength:200})` and assert that after `addTask` then `deleteTask` the array length and contents are identical to the original
    - **Validates: Requirements 4.3, 4.12**

  - [ ] 7.5 Write property test for toggle done round-trip (Property 7)
    - **Property 7: Toggle status done adalah round-trip**
    - Use `fc.array(taskRecord, {minLength:1})` and assert that calling `toggleTask(id)` twice leaves `done` unchanged
    - **Validates: Requirements 4.5, 4.6**

  - [ ] 7.6 Write property test for counter accuracy (Property 10)
    - **Property 10: Penghitung tugas selalu akurat**
    - Use `fc.array(taskRecord)` and assert the counter text matches the exact count of `done === true` tasks over the total
    - **Validates: Requirements 4.14**

- [x] 8. Quick Links
  - [x] 8.1 Implement `normalizeUrl`, `addLink`, `deleteLink`, and `renderLinks`
    - `normalizeUrl(url)` returns the url unchanged if it already starts with `http://` or `https://`, otherwise prepends `https://`
    - `addLink(name, url)` trims both; ignores if either is empty; calls `normalizeUrl`; pushes `{id: Date.now().toString(), name, url}` to `state.links`; saves; calls `renderLinks()`
    - `deleteLink(id)` filters, saves, re-renders
    - `renderLinks()` clears `#link-list`, builds each entry as `<a target="_blank" rel="noopener noreferrer">` with the link name set via `textContent` plus a delete button; shows/hides empty state if needed
    - Bind `#link-add-btn` to `addLink`; bind delete buttons to `deleteLink`
    - On INIT load links from storage (seed if `null`), call `renderLinks()`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ] 8.2 Write property test for URL normalisation (Property 3)
    - **Property 3: URL tautan selalu memiliki skema yang valid**
    - Use `fc.string()` as arbitrary URL input and assert `normalizeUrl(url).startsWith("http://") || normalizeUrl(url).startsWith("https://")`
    - **Validates: Requirements 5.3, 5.4**

- [ ] 9. Light/Dark Mode
  - [x] 9.1 Implement `detectSystemTheme`, `applyTheme`, and `toggleTheme`
    - `detectSystemTheme()` returns `"dark"` if `window.matchMedia("(prefers-color-scheme: dark)").matches`, else `"light"`
    - `applyTheme(theme)` sets `document.documentElement.dataset.theme = theme`, updates `#theme-toggle-btn` icon (🌙 for light, ☀️ for dark) via `textContent`, saves to storage with key `"theme"`, updates `state.theme`
    - `toggleTheme()` calls `applyTheme(state.theme === "light" ? "dark" : "light")`
    - Bind `#theme-toggle-btn` click to `toggleTheme`
    - On INIT call `applyTheme(loadFromStorage("theme", detectSystemTheme()))`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 9.2 Write property test for theme toggle (Property 4)
    - **Property 4: Theme toggle selalu menghasilkan nilai yang valid dan berbeda**
    - Use `fc.constantFrom("light", "dark")` as initial theme; after one `toggleTheme()` call assert the new value differs from the initial and is one of the two valid values
    - **Validates: Requirements 6.3, 6.4**

- [x] 10. Checkpoint — full integration
  - Open `index.html` directly in a browser. Verify: clock ticks, greeting updates, name editor saves and rejects invalid input, timer counts down and fires the notification, tasks persist across page reload, links open in new tab, theme toggles correctly and persists. Ask the user if questions arise.

- [ ] 11. Responsive layout and visual polish
  - [ ] 11.1 Finalize responsive CSS and accessibility attributes
    - Confirm media query breakpoint at 768px produces the two-column → single-column layout switch
    - Verify `font-size` for clock is in range 2.75rem–3.25rem bold
    - Check all interactive elements have `transition: 0.2s`, `:focus-visible` outline ≥ 2px, correct `aria-label` values
    - Confirm done tasks render `text-decoration: line-through` and `opacity: 0.5` from CSS classes
    - _Requirements: 7.1, 7.2, 7.5, 7.6, 7.7, 7.8, 7.9_

- [ ] 12. README.md
  - [ ] 12.1 Write `README.md` with features overview and deploy instructions
    - List all four widgets and their key capabilities
    - Provide step-by-step GitHub Pages deploy instructions (push to repo, enable Pages from `main` branch root, access via `https://<user>.github.io/<repo>/`)
    - _Requirements: 8.3_

- [ ] 13. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints (tasks 6, 10, 13) provide incremental validation milestones
- Property tests use **fast-check** (≥100 iterations per property); tag each test with `// Feature: todo-life-dashboard, Property N: <text>`
- No test framework setup task is included per NFR-1; tests can be run via a CDN-loaded fast-check in a separate test HTML or via Node without a bundler

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1"] },
    { "id": 3, "tasks": ["3.2", "4.1"] },
    { "id": 4, "tasks": ["4.2", "5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3", "7.1"] },
    { "id": 6, "tasks": ["7.2", "8.1"] },
    { "id": 7, "tasks": ["7.3", "8.2", "9.1"] },
    { "id": 8, "tasks": ["7.4", "7.5", "7.6", "9.2"] },
    { "id": 9, "tasks": ["11.1"] },
    { "id": 10, "tasks": ["12.1"] }
  ]
}
```
