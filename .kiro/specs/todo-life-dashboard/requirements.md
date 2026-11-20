# Requirements Document

## Introduction

To-Do List Life Dashboard adalah aplikasi web satu halaman yang membantu pengguna mengorganisasi hari mereka. Aplikasi ini menampilkan jam real-time, daftar tugas (to-do list), timer fokus (Pomodoro), dan tautan cepat ke situs web favorit. Antarmuka sepenuhnya berbahasa Indonesia. Aplikasi berjalan murni di browser tanpa backend — semua data disimpan di Local Storage. Teknologi yang digunakan: HTML, CSS, dan Vanilla JavaScript.

---

## Glossary

- **Dashboard**: Halaman utama aplikasi yang menampilkan semua widget dalam satu layar.
- **Clock**: Widget jam yang menampilkan waktu dan tanggal saat ini.
- **Timer**: Komponen penghitung mundur untuk sesi fokus (Pomodoro).
- **TodoList**: Komponen pengelola daftar tugas pengguna.
- **LinkManager**: Komponen pengelola tautan cepat ke situs web.
- **ThemeToggle**: Kontrol untuk berpindah antara mode terang dan gelap.
- **Storage**: Browser Local Storage API yang digunakan untuk menyimpan semua data secara persisten.
- **Task**: Objek tugas dengan properti `id`, `text`, dan `done`.
- **Link**: Objek tautan dengan properti `id`, `name`, dan `url`.
- **userName**: String nama pengguna yang disimpan di Local Storage.
- **pomodoroMinutes**: Angka durasi timer fokus (default 25) yang disimpan di Local Storage.
- **theme**: Nilai `"light"` atau `"dark"` yang disimpan di Local Storage.

---

## Requirements

### Requirement 1: Tampilan Jam dan Tanggal Real-Time

**User Story:** Sebagai pengguna, saya ingin melihat waktu dan tanggal saat ini di dashboard, sehingga saya bisa selalu mengetahui waktu tanpa harus melihat perangkat lain.

#### Acceptance Criteria

1. THE Clock SHALL menampilkan waktu saat ini dalam format HH:MM:SS yang diperbarui setiap satu detik.
2. THE Clock SHALL menampilkan tanggal lengkap dalam format bahasa Indonesia, contoh: "Jumat, 20 November 2026".
3. IF jam menunjukkan rentang 05:00–10:59, THEN THE Dashboard SHALL menampilkan sapaan "Selamat pagi".
4. IF jam menunjukkan rentang 11:00–14:59, THEN THE Dashboard SHALL menampilkan sapaan "Selamat siang".
5. IF jam menunjukkan rentang 15:00–17:59, THEN THE Dashboard SHALL menampilkan sapaan "Selamat sore".
6. IF jam menunjukkan rentang 18:00–23:59 atau 00:00–04:59, THEN THE Dashboard SHALL menampilkan sapaan "Selamat malam".
7. WHEN tampilan jam diperbarui dan waktu melewati batas rentang sapaan, THE Dashboard SHALL memperbarui sapaan secara otomatis tanpa memuat ulang halaman.

---

### Requirement 2: Sapaan dengan Nama Pengguna yang Dapat Dikustomisasi

**User Story:** Sebagai pengguna, saya ingin sapaan menyebut nama saya, sehingga dashboard terasa lebih personal.

#### Acceptance Criteria

1. WHEN `userName` tersimpan di Storage dan tidak kosong, THE Dashboard SHALL menampilkan sapaan dengan format "[Sapaan], [Nama]!", contoh: "Selamat pagi, Rina!".
2. WHEN `userName` kosong atau tidak ada di Storage, THE Dashboard SHALL menampilkan sapaan tanpa nama, contoh: "Selamat pagi!".
3. WHEN pengguna mengklik tombol "Ubah nama", THE Dashboard SHALL menampilkan input inline untuk mengedit nama tanpa membuka dialog/prompt.
4. WHEN pengguna menyimpan nama baru yang valid, THE Dashboard SHALL menyimpan nilai ke Storage dengan kunci `userName` dan memperbarui tampilan sapaan secara langsung.
5. WHEN pengguna menekan Enter pada input nama, THE Dashboard SHALL menyimpan nama dengan perilaku yang sama seperti mengklik tombol simpan.
6. WHEN pengguna menekan Escape pada input nama, THE Dashboard SHALL membatalkan pengeditan dan mengembalikan tampilan ke nama sebelumnya.
7. IF nama yang dimasukkan pengguna mengandung hanya spasi atau kosong, THEN THE Dashboard SHALL menolak penyimpanan dan menampilkan pesan kesalahan yang menginformasikan bahwa nama tidak boleh kosong, tanpa mengubah nilai `userName` di Storage.
8. IF nama yang dimasukkan pengguna melebihi 50 karakter, THEN THE Dashboard SHALL menolak penyimpanan dan menampilkan pesan kesalahan yang menginformasikan batas maksimal nama, tanpa mengubah nilai `userName` di Storage.

---

### Requirement 3: Timer Fokus (Pomodoro)

**User Story:** Sebagai pengguna, saya ingin menggunakan timer penghitung mundur untuk sesi kerja fokus, sehingga saya dapat bekerja secara terstruktur menggunakan teknik Pomodoro.

#### Acceptance Criteria

1. THE Timer SHALL menampilkan sisa waktu dalam format MM:SS.
2. WHEN halaman pertama kali dimuat, THE Timer SHALL membaca nilai `pomodoroMinutes` dari Storage dan menggunakannya sebagai durasi awal.
3. IF nilai `pomodoroMinutes` tidak ditemukan di Storage saat halaman dimuat, THEN THE Timer SHALL menggunakan nilai default 25 menit sebagai durasi awal.
4. WHEN pengguna mengklik tombol Start, THE Timer SHALL memulai penghitung mundur satu detik per detik.
5. WHILE timer sedang berjalan, THE Timer SHALL mencegah pembuatan penghitung mundur baru jika tombol Start diklik lagi.
6. WHEN pengguna mengklik tombol Stop, THE Timer SHALL menghentikan penghitung mundur tanpa mereset waktu.
7. WHEN pengguna mengklik tombol Reset, THE Timer SHALL menghentikan penghitung mundur dan mengembalikan tampilan ke durasi `pomodoroMinutes` yang aktif.
8. WHEN timer mencapai 00:00, THE Timer SHALL berhenti secara otomatis, menampilkan pesan notifikasi di halaman yang menginformasikan bahwa sesi fokus telah selesai, dan mengaktifkan kembali semua kontrol input serta tombol Start.
9. WHEN pengguna memilih preset durasi (15, 25, atau 45 menit), THE Timer SHALL mereset timer ke durasi yang dipilih dan menyimpan nilai ke Storage dengan kunci `pomodoroMinutes`.
10. WHEN pengguna memasukkan durasi kustom antara 1–120 menit, THE Timer SHALL mereset timer ke durasi tersebut dan menyimpan nilai ke Storage dengan kunci `pomodoroMinutes`.
11. WHILE timer sedang berjalan, THE Timer SHALL menonaktifkan semua kontrol pengubah durasi (preset dan input kustom).
12. IF pengguna memasukkan nilai durasi kustom di luar rentang 1–120, THEN THE Timer SHALL mengabaikan input tersebut, menampilkan pesan kesalahan di halaman yang menginformasikan rentang nilai yang valid (1–120 menit), dan mempertahankan durasi yang sedang aktif.

---

### Requirement 4: Daftar Tugas (To-Do List)

**User Story:** Sebagai pengguna, saya ingin mengelola daftar tugas harian saya, sehingga saya dapat melacak apa yang perlu dikerjakan dan apa yang sudah selesai.

#### Acceptance Criteria

1. WHEN halaman pertama kali dimuat dan Storage belum pernah berisi data tasks, THE TodoList SHALL menampilkan tiga tugas awal (seed data): "Belajar JavaScript 1 jam" (belum selesai), "Kerjakan tugas RevoU" (belum selesai), dan "Push project ke GitHub" (sudah selesai).
2. WHEN halaman dimuat dan Storage sudah berisi data tasks, THE TodoList SHALL memuat dan menampilkan semua tugas dari Storage.
3. WHEN pengguna mengklik tombol tambah atau menekan Enter setelah mengetik di input tugas, THE TodoList SHALL menambahkan tugas baru ke daftar dengan status `done: false`, dengan panjang teks tugas maksimal 200 karakter.
4. IF input tugas kosong atau hanya berisi spasi saat pengguna mencoba menambahkan, THEN THE TodoList SHALL mengabaikan aksi tersebut tanpa menambahkan tugas ke daftar.
5. WHEN pengguna mencentang checkbox sebuah tugas, THE TodoList SHALL mengubah status `done` tugas menjadi `true` dan menampilkan teks dengan garis coret (`text-decoration: line-through`) serta opacity `0.5`.
6. WHEN pengguna menghapus centang checkbox sebuah tugas, THE TodoList SHALL mengubah status `done` tugas menjadi `false` dan mengembalikan tampilan teks tanpa garis coret dan dengan opacity `1`.
7. WHEN pengguna mengklik tombol Edit pada sebuah tugas, THE TodoList SHALL mengubah teks tugas menjadi input yang dapat diedit secara inline dengan panjang maksimal 200 karakter.
8. WHILE mode edit aktif pada sebuah tugas, THE TodoList SHALL menampilkan tombol Save dan Cancel.
9. WHEN pengguna mengklik Save atau menekan Enter saat mode edit aktif, THE TodoList SHALL menyimpan teks yang baru dan keluar dari mode edit.
10. IF teks pada input edit kosong atau hanya berisi spasi saat pengguna mengklik Save atau menekan Enter, THEN THE TodoList SHALL mengabaikan aksi tersebut dan tetap berada dalam mode edit.
11. WHEN pengguna mengklik Cancel atau menekan Escape saat mode edit aktif, THE TodoList SHALL membatalkan perubahan dan mengembalikan teks asli.
12. WHEN pengguna mengklik tombol Delete pada sebuah tugas, THE TodoList SHALL menghapus tugas tersebut dari daftar.
13. WHEN daftar tugas kosong, THE TodoList SHALL menampilkan pesan "Belum ada tugas. Yuk tambah satu!".
14. THE TodoList SHALL menampilkan penghitung tugas dengan format "[jumlah selesai] dari [total] tugas selesai".
15. WHEN daftar tugas berubah (tambah, edit, hapus, atau ubah status), THE TodoList SHALL menyimpan seluruh array tasks ke Storage dengan kunci `tasks` dalam format JSON.
16. WHEN memuat data tasks dari Storage, THE TodoList SHALL membungkus `JSON.parse` dalam try/catch dan menggunakan array kosong sebagai fallback jika data rusak.

---

### Requirement 5: Tautan Cepat (Quick Links)

**User Story:** Sebagai pengguna, saya ingin memiliki tombol tautan cepat ke situs web favorit saya, sehingga saya dapat membuka situs yang sering dikunjungi dengan satu klik.

#### Acceptance Criteria

1. WHEN halaman pertama kali dimuat dan Storage belum pernah berisi data links, THE LinkManager SHALL menampilkan empat tautan awal (seed data): Google, YouTube, GitHub, dan ChatGPT.
2. WHEN halaman dimuat dan Storage sudah berisi data links, THE LinkManager SHALL memuat dan menampilkan semua tautan dari Storage.
3. WHEN pengguna mengklik sebuah tautan, THE LinkManager SHALL membuka URL tersebut di tab baru menggunakan atribut `target="_blank"` dan `rel="noopener noreferrer"`.
4. WHEN pengguna menambahkan tautan baru dengan URL yang tidak diawali `http://` atau `https://`, THE LinkManager SHALL secara otomatis menambahkan awalan `https://` pada URL tersebut.
5. IF nama tautan atau field URL kosong atau hanya berisi spasi saat pengguna mencoba menambahkan tautan baru, THEN THE LinkManager SHALL mengabaikan aksi tersebut tanpa menambahkan tautan ke daftar.
6. WHEN pengguna mengklik tombol hapus pada sebuah tautan, THE LinkManager SHALL menghapus tautan tersebut dari daftar.
7. WHEN daftar tautan berubah, THE LinkManager SHALL menyimpan seluruh array links ke Storage dengan kunci `links` dalam format JSON.
8. WHEN memuat data links dari Storage, THE LinkManager SHALL membungkus `JSON.parse` dalam try/catch dan menggunakan array kosong sebagai fallback jika data rusak.

---

### Requirement 6: Mode Terang dan Gelap (Light/Dark Mode)

**User Story:** Sebagai pengguna, saya ingin bisa berpindah antara tampilan terang dan gelap, sehingga dashboard nyaman digunakan di berbagai kondisi pencahayaan.

#### Acceptance Criteria

1. WHEN halaman pertama kali dimuat dan kunci `theme` belum ada di Storage, THE ThemeToggle SHALL membaca preferensi sistem pengguna melalui `prefers-color-scheme` dan menerapkan tema yang sesuai.
2. WHEN halaman dimuat dan kunci `theme` sudah ada di Storage, THE ThemeToggle SHALL menerapkan tema yang tersimpan.
3. WHEN pengguna mengklik tombol toggle tema, THE ThemeToggle SHALL berpindah tema antara `"light"` dan `"dark"`, memperbarui atribut `data-theme` pada elemen `<html>`, dan menyimpan pilihan ke Storage dengan kunci `theme`.
4. IF tema aktif adalah `"light"`, THEN THE ThemeToggle SHALL menampilkan ikon 🌙 pada tombol toggle; IF tema aktif adalah `"dark"`, THEN THE ThemeToggle SHALL menampilkan ikon ☀️ pada tombol toggle.
5. THE Dashboard SHALL mengimplementasikan kedua tema menggunakan CSS custom properties (variabel CSS) yang beralih melalui atribut `data-theme` pada `<html>`.

---

### Requirement 7: Desain Visual dan Tata Letak Responsif

**User Story:** Sebagai pengguna, saya ingin antarmuka yang bersih, modern, dan nyaman digunakan di berbagai ukuran layar, sehingga saya dapat menggunakan dashboard di komputer maupun ponsel.

#### Acceptance Criteria

1. THE Dashboard SHALL menggunakan font "Poppins" dari Google Fonts dengan fallback `system-ui, sans-serif`.
2. THE Dashboard SHALL menampilkan tata letak kartu dua kolom pada lebar layar 768px ke atas (Timer dan Quick Links berdampingan), dan menumpuk semua kartu secara vertikal pada lebar di bawah 768px.
3. THE Dashboard SHALL menerapkan mode terang dengan warna latar belakang soft cream/off-white, kartu putih, aksen biru-ungu pastel (#7C83FD / #6C63FF), dan teks dark slate.
4. THE Dashboard SHALL menerapkan mode gelap dengan warna latar belakang biru abu-abu gelap (#1E2030), kartu (#2A2D43), aksen yang lebih terang, dan kontras teks yang tinggi; bukan hitam murni.
5. THE Dashboard SHALL menampilkan jam dalam ukuran tipografi antara 2.75rem dan 3.25rem dengan gaya bold untuk menciptakan hierarki visual yang jelas.
6. THE Dashboard SHALL menerapkan sudut kartu membulat (border-radius 16–20px), bayangan tipis yang lembut, dan jarak (padding/margin) yang lapang.
7. THE Dashboard SHALL menerapkan transisi hover dan fokus yang mulus dengan durasi 0.2s pada semua elemen interaktif.
8. THE Dashboard SHALL menampilkan outline fokus yang terlihat pada semua elemen interaktif untuk aksesibilitas keyboard, dengan gaya yang berbeda dari tampilan default browser atau menggunakan `:focus-visible` dengan outline minimal 2px.
9. THE Dashboard SHALL menggunakan elemen HTML semantik: `<header>`, `<main>`, `<section>`, dan atribut `aria-label` pada tombol ikon.

---

### Requirement 8: Ketahanan Data dan Kualitas Kode

**User Story:** Sebagai pengguna, saya ingin data saya tetap aman meskipun ada kesalahan, sehingga halaman tidak pernah rusak karena data yang korup di Local Storage.

#### Acceptance Criteria

1. IF data yang tersimpan di Storage rusak atau tidak valid, THEN THE Storage SHALL menggunakan nilai fallback yang aman (array kosong untuk tasks dan links, string kosong untuk userName, 25 untuk pomodoroMinutes, dan tema sistem untuk theme) sehingga halaman tetap berfungsi.
2. THE Dashboard SHALL menggunakan `textContent` (bukan `innerHTML` dengan input pengguna) saat merender teks yang berasal dari input pengguna untuk mencegah XSS.
3. THE Dashboard SHALL dapat dibuka langsung sebagai file `index.html` tanpa memerlukan server atau proses build.
4. IF halaman dijalankan dengan data Storage yang valid dan tidak ada kegagalan jaringan eksternal, THEN THE Dashboard SHALL tidak menghasilkan error di console browser.
5. THE Dashboard SHALL mengorganisasi kode JavaScript dalam satu file `js/script.js` dengan komentar bagian yang jelas: state, storage helpers, greeting/clock, timer, todo, links, theme, dan init.
