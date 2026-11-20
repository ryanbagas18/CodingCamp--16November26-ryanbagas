# To-Do Life Dashboard

Aplikasi web satu halaman (SPA) berbahasa Indonesia yang membantu Anda mengorganisasi hari. Berjalan sepenuhnya di browser — tidak butuh server atau proses build.

---

## Fitur

### 🕐 Jam & Sapaan
- Menampilkan waktu real-time (HH:MM:SS) dan tanggal lengkap dalam format bahasa Indonesia.
- Sapaan kontekstual otomatis: *Selamat pagi* (05–10), *Selamat siang* (11–14), *Selamat sore* (15–17), *Selamat malam* (18–04).
- Nama pengguna dapat dikustomisasi lewat editor inline; tersimpan di Local Storage. Kosongkan nama untuk menghapusnya dari sapaan.

### ⏱ Timer Fokus (Pomodoro)
- Penghitung mundur dengan format MM:SS.
- Tombol **Mulai**, **Stop**, dan **Reset**.
- Preset durasi cepat: 15, 25, dan 45 menit (tombol aktif disorot).
- Input kustom bebas antara 1–120 menit (konfirmasi lewat Enter atau tombol Set).
- Notifikasi in-page dan bunyi beep singkat saat sesi fokus selesai.
- Menekan Mulai setelah timer habis memulai hitungan mundur baru dari durasi aktif.

### ✅ Daftar Tugas (To-Do List)
- Tambah (Enter atau tombol), edit inline, hapus, dan tandai tugas selesai.
- Teks tugas yang selesai ditampilkan dengan garis coret.
- Penghitung progres: *"X dari N tugas selesai"*.
- Pesan kosong saat belum ada tugas.
- Semua data tersimpan di Local Storage.

### 🔗 Tautan Cepat (Quick Links)
- Tambah (Enter atau tombol) dan hapus tautan ke situs favorit.
- Tautan selalu terbuka di tab baru.
- URL tanpa awalan `http://`/`https://` secara otomatis diberi awalan `https://`.
- Data tersimpan di Local Storage.

### 🌙 Mode Terang / Gelap
- Toggle antara tema terang dan gelap.
- Membaca preferensi sistem saat pertama kali dibuka.
- Pilihan tema tersimpan di Local Storage.

---

## Tantangan yang Dipilih

1. **Light/Dark Mode** — beralih antara tema terang dan gelap dengan CSS custom properties; preferensi disimpan di Local Storage.
2. **Custom name in greeting** — pengguna memasukkan namanya lewat editor inline; sapaan menyebut nama secara personal (atau tanpa nama jika dikosongkan).
3. **Change Pomodoro time** — durasi timer dapat diubah via preset (15/25/45 mnt) maupun input kustom (1–120 mnt); nilai disimpan di Local Storage.

---

## Local Storage

| Kunci             | Tipe     | Fallback                        |
|-------------------|----------|---------------------------------|
| `tasks`           | JSON array | 3 tugas contoh (seed data)    |
| `links`           | JSON array | 4 tautan contoh (seed data)   |
| `userName`        | string   | `""` (sapaan tanpa nama)        |
| `theme`           | `"light"` / `"dark"` | preferensi sistem  |
| `pomodoroMinutes` | number   | `25`                            |

---

## Cara Menggunakan

1. Clone repositori:
   ```bash
   git clone https://github.com/<username>/<nama-repo>.git
   ```
2. Buka `index.html` langsung di browser. Tidak diperlukan server atau instalasi.

---

## Deploy ke GitHub Pages

1. Push seluruh isi repositori ke branch `main`:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
2. Buka repositori di GitHub → **Settings → Pages**.
3. Di bagian **Branch**, pilih `main` dan folder `/ (root)`, lalu klik **Save**.
4. Tunggu beberapa menit hingga GitHub Pages selesai membangun situs.
5. Akses aplikasi di:
   ```
   https://<username>.github.io/<nama-repo>/
   ```

---

## Struktur File

```
index.html      — Struktur DOM, link ke CSS & JS
css/
  style.css     — Semua gaya, CSS variables, layout responsif
js/
  script.js     — Seluruh logika aplikasi
README.md
```

---

## Teknologi

- HTML5 Semantik (`header`, `main`, `section`, `form`, `fieldset`, `time`, `output`)
- CSS3 (Custom Properties, Grid, Flexbox, Media Queries)
- Vanilla JavaScript (ES6+)
- Google Fonts — Poppins
- Web Audio API (beep saat timer selesai)
