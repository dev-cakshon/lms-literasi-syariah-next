# Tabel Test Cases — Functional Testing (TC-F)

**Dokumen:** TC-FUNCTIONAL-TESTING.md  
**Versi MVP:** April 2026  
**Metodologi:** Black-Box Testing  
**Total:** 42 Test Cases

> Kolom **Actual Output** dan **Status** dikosongkan — diisi saat eksekusi pengujian.

---

## F1 — Autentikasi

| ID      | Fitur    | Skenario                                                                                        | Precondition                             | Expected Output                                                               | Actual Output | Status |
| ------- | -------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------- | ------------- | ------ |
| TC-F.01 | Register | Register dengan data valid (nama, email baru, password ≥ 8 karakter, konfirmasi password cocok) | Belum login; email belum terdaftar       | Akun berhasil dibuat; user langsung login dan diarahkan ke `/dashboard`       |               |        |
| TC-F.02 | Register | Register dengan email yang sudah terdaftar                                                      | Belum login; email sudah ada di sistem   | Muncul pesan error "Email sudah digunakan" atau sejenisnya; form tidak submit |               |        |
| TC-F.03 | Login    | Login sebagai student dengan kredensial valid                                                   | Akun student aktif sudah terdaftar       | Login berhasil; user diarahkan ke `/dashboard`                                |               |        |
| TC-F.04 | Login    | Login sebagai admin dengan kredensial valid                                                     | Akun dengan role `admin` sudah terdaftar | Login berhasil; user diarahkan ke `/admin/course`                             |               |        |
| TC-F.05 | Login    | Login dengan password salah                                                                     | Akun sudah terdaftar                     | Muncul pesan error autentikasi; tidak bisa masuk ke halaman dalam             |               |        |

---

## F2 — Katalog Kursus

| ID      | Fitur                   | Skenario                                                              | Precondition                                         | Expected Output                                                                                                                                                      | Actual Output | Status |
| ------- | ----------------------- | --------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------ |
| TC-F.06 | Katalog Kursus          | Student membuka halaman `/my-courses`                                 | Login sebagai student; ≥ 1 kursus dipublish tersedia | Kursus yang dipublish ditampilkan dalam grid dengan thumbnail, judul, dan progress; chip jumlah BAB ditampilkan hanya jika kursus belum selesai dan memiliki ≥ 1 bab |               |        |
| TC-F.07 | Katalog Kursus — Search | Student mencari kursus menggunakan kata kunci yang cocok dengan judul | Login sebagai student; ≥ 1 kursus dipublish tersedia | Hanya kursus yang judulnya mengandung kata kunci yang ditampilkan                                                                                                    |               |        |
| TC-F.08 | Katalog Kursus — Search | Student mencari kursus dengan kata kunci yang tidak cocok             | Login sebagai student; ≥ 1 kursus dipublish tersedia | Daftar kursus kosong / pesan "No course found"                                                                                                                       |               |        |

---

## F3 — Course Viewer

| ID      | Fitur                     | Skenario                                                              | Precondition                                                           | Expected Output                                                                                                                                                            | Actual Output | Status |
| ------- | ------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------ |
| TC-F.09 | Course Overview           | Student membuka halaman overview kursus                               | Login sebagai student; kursus dengan ≥ 1 konten tersedia               | Daftar konten (bab dan aktivitas) ditampilkan terurut berdasarkan `position`; indikator progress menampilkan jumlah item selesai / total item (termasuk bab dan aktivitas) |               |        |
| TC-F.10 | Chapter Viewer            | Student membuka sebuah bab                                            | Login sebagai student; kursus dengan bab yang memiliki konten tersedia | Halaman bab menampilkan judul dan konten; jika media type `youtube` maka YouTube player ditampilkan; jika media type `slides` maka slides ditampilkan                      |               |        |
| TC-F.11 | Mark Chapter Complete     | Student menekan tombol "Mark as Complete" pada bab yang belum selesai | Login sebagai student; bab belum ditandai selesai                      | Progress diperbarui di real-time; student dinavigasi ke bab berikutnya (atau overview jika bab terakhir)                                                                   |               |        |
| TC-F.12 | Mark Complete — Idempoten | Student membuka bab yang sudah selesai                                | Login sebagai student; bab sudah ditandai selesai sebelumnya           | Tombol "Mark as Complete" tidak muncul; bab tetap ditandai selesai                                                                                                         |               |        |
| TC-F.13 | Course Progress Real-time | Student menyelesaikan bab; membuka tab/halaman lain lalu kembali      | Login sebagai student; bab baru saja diselesaikan                      | Status bab tetap "selesai" tanpa perlu refresh; progress sidebar/overview akurat                                                                                           |               |        |

---

## F4 — Gamifikasi

| ID      | Fitur                       | Skenario                                                                              | Precondition                                                                                                     | Expected Output                                                                                                              | Actual Output | Status |
| ------- | --------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------- | ------ |
| TC-F.14 | Points — Earn               | Student menyelesaikan bab untuk pertama kali                                          | Login sebagai student; bab belum pernah diselesaikan                                                             | Toast notifikasi muncul menampilkan poin yang didapat ("+10 points"); poin di dashboard bertambah sesuai                     |               |        |
| TC-F.15 | Points — No Duplicate       | Student membuka kembali bab yang sudah pernah diselesaikan lalu navigasi ke Dashboard | Login sebagai student; bab sudah pernah diselesaikan; catat nilai `totalPoints` di Dashboard sebelum membuka bab | Bab menampilkan state selesai tanpa tombol "Mark as Complete"; `totalPoints` di Dashboard tidak berubah dibanding sebelumnya |               |        |
| TC-F.16 | Badge — Award               | Student mencapai kondisi unlock badge untuk pertama kali (misal: menyelesaikan 1 bab) | Login sebagai student; kondisi badge belum pernah terpenuhi                                                      | Modal badge award muncul setelah mark complete; badge muncul di dashboard                                                    |               |        |
| TC-F.17 | Dashboard — Points & Badges | Student membuka halaman Dashboard                                                     | Login sebagai student yang sudah memiliki poin dan badge                                                         | Profil menampilkan `totalPoints` terkini; bagian badge menampilkan badge yang dimiliki                                       |               |        |
| TC-F.18 | Leaderboard                 | Student membuka halaman Dashboard                                                     | Login sebagai student; ada ≥ 1 user dengan poin                                                                  | Leaderboard menampilkan daftar user terurut dari poin tertinggi; posisi user terlihat                                        |               |        |

---

## F5 — Chatbot AI

| ID      | Fitur                  | Skenario                                                  | Precondition                                   | Expected Output                                                                           | Actual Output | Status |
| ------- | ---------------------- | --------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------- | ------ |
| TC-F.19 | Chatbot — Kirim Pesan  | Student membuka chatbot dan mengirim pesan pertama        | Login sebagai student                          | Bot membalas dengan jawaban relevan; chat baru terbentuk di sidebar; ID chat tersimpan    |               |        |
| TC-F.20 | Chatbot — Lanjut Chat  | Student mengirim pesan lanjutan dalam chat yang sudah ada | Login sebagai student; chat aktif sudah ada    | Bot membalas dalam konteks percakapan yang sama; riwayat pesan tetap terlihat             |               |        |
| TC-F.21 | Chatbot — Chat Baru    | Student menekan tombol "Chat Baru"                        | Login sebagai student; ≥ 1 chat sebelumnya ada | Area chat dikosongkan; student dapat memulai percakapan baru tanpa menghapus riwayat lama |               |        |
| TC-F.22 | Chatbot — Load History | Student memilih chat lama dari sidebar                    | Login sebagai student; ≥ 1 chat sebelumnya ada | Riwayat pesan chat tersebut dimuat dan ditampilkan secara kronologis                      |               |        |

---

## F6 — Aktivitas: True/False

| ID      | Fitur                        | Skenario                                              | Precondition                                                                          | Expected Output                                                                                                                                       | Actual Output | Status |
| ------- | ---------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------ |
| TC-F.23 | True/False — Load            | Student membuka halaman aktivitas True/False          | Login sebagai student; kursus dengan aktivitas True/False tersedia                    | Halaman menampilkan daftar pernyataan; setiap pernyataan memiliki tombol "Benar" dan "Salah"; tombol Submit sudah tampil namun dalam keadaan disabled |               |        |
| TC-F.24 | True/False — Answer Lock     | Student memilih jawaban pada salah satu pernyataan    | Login sebagai student; halaman True/False sudah terbuka; ≥ 1 pernyataan belum dijawab | Pilihan yang dipilih terhighlight; tombol jawaban lain pada pernyataan tersebut ter-disable; jawaban tidak bisa diubah                                |               |        |
| TC-F.25 | True/False — Submit & Result | Student menjawab semua pernyataan lalu menekan Submit | Login sebagai student; semua pernyataan sudah dijawab                                 | `ActivityResultScreen` muncul menampilkan skor (jumlah benar/total) dan badge `+XP` inline; best score di course overview diperbarui                  |               |        |

---

## F7 — Aktivitas: Word Search

| ID      | Fitur                     | Skenario                                                    | Precondition                                                                       | Expected Output                                                                                                                             | Actual Output | Status |
| ------- | ------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------ |
| TC-F.26 | Word Search — Load        | Student membuka halaman aktivitas Word Search               | Login sebagai student; kursus dengan aktivitas Word Search tersedia                | Grid huruf ditampilkan; daftar kata target ditampilkan (semua unchecked); counter `0/{total} KATA` terlihat                                 |               |        |
| TC-F.27 | Word Search — Find Word   | Student men-drag pada grid dan berhasil menemukan satu kata | Login sebagai student; halaman Word Search sudah terbuka; ≥ 1 kata belum ditemukan | Kata yang ditemukan ter-highlight di grid; kata tersebut diberi tanda centang di daftar kata; counter `{n}/{total} KATA` bertambah          |               |        |
| TC-F.28 | Word Search — Auto-Submit | Student menemukan semua kata dalam daftar                   | Login sebagai student; hanya 1 kata tersisa yang belum ditemukan                   | Aktivitas langsung auto-submit tanpa klik tombol; animasi confetti muncul; `ActivityResultScreen` tampil dengan skor dan badge `+XP` inline |               |        |

---

## F8 — Aktivitas: Drag & Drop

| ID      | Fitur                         | Skenario                                                 | Precondition                                                        | Expected Output                                                                                                                                   | Actual Output | Status |
| ------- | ----------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------ |
| TC-F.29 | Drag & Drop — Load            | Student membuka halaman aktivitas Drag & Drop            | Login sebagai student; kursus dengan aktivitas Drag & Drop tersedia | Item-item yang perlu dipasangkan ditampilkan; area target/kategori ditampilkan; tombol Submit tampil namun disabled sampai semua item ditempatkan |               |        |
| TC-F.30 | Drag & Drop — Submit & Result | Student menyelesaikan semua pasangan lalu menekan Submit | Login sebagai student; semua item sudah di-drag ke kategori         | `ActivityResultScreen` muncul menampilkan skor (jumlah benar/total) dan badge `+XP` inline; best score di course overview diperbarui              |               |        |

---

## F9 — Sesi & Akses

| ID      | Fitur                 | Skenario                                                                                  | Precondition                                                        | Expected Output                                                                                                            | Actual Output | Status |
| ------- | --------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------- | ------ |
| TC-F.31 | Logout                | Student menekan tombol logout                                                             | Login sebagai student                                               | Sesi berakhir; user diarahkan ke `/login`; mengakses rute terlindungi seperti `/dashboard` mengalihkan kembali ke `/login` |               |        |
| TC-F.32 | Route Protection      | User tidak terautentikasi mengakses rute terlindungi secara langsung (misal `/dashboard`) | Belum login; tidak ada sesi aktif                                   | User langsung dialihkan ke `/login` oleh middleware; tidak ada konten halaman yang tampil                                  |               |        |
| TC-F.33 | Locked Content Gating | Student mencoba membuka item konten yang terkunci dari daftar di course overview          | Login sebagai student; ada item konten dengan status `locked: true` | Item terkunci tidak dapat dinavigasi; hanya item dengan `locked: false` yang bisa dibuka                                   |               |        |

---

## F10 — Course Viewer (Lanjutan)

| ID      | Fitur                  | Skenario                                                            | Precondition                                                             | Expected Output                                                                                                                                  | Actual Output | Status |
| ------- | ---------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | ------ |
| TC-F.34 | Chapter — Slides Media | Student membuka bab yang memiliki media type `slides`               | Login sebagai student; ada bab dengan media type `slides` terkonfigurasi | Slides ditampilkan di halaman bab (bukan YouTube player); konten teks bab tetap terlihat di bawahnya                                             |               |        |
| TC-F.35 | Certificate Issuance   | Student menyelesaikan 100% kursus (semua bab dan aktivitas selesai) | Login sebagai student; semua item konten dalam kursus belum diselesaikan | `CourseCompletionBanner` tampil di halaman course overview; menekan tombol "Lihat" membuka `CourseCertificateModal` dengan sertifikat yang valid |               |        |

---

## F11 — Activity Result Screen

| ID      | Fitur                            | Skenario                                                                                              | Precondition                                                                 | Expected Output                                                                                                                                                                   | Actual Output | Status |
| ------- | -------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------ |
| TC-F.36 | Result — Celebration Frame       | Student mensubmit aktivitas dengan `scorePercent ≥ 70` (bukan skor sempurna yang mengunci sertifikat) | Login sebagai student; aktivitas belum diselesaikan dengan skor ≥ 70         | Celebration frame tampil: headline "Kerja Bagus!" (atau "Sempurna!" jika 100%), bintang graded (100%→3, ≥85%→2, ≥70%→1), panel "Hadiah Anda" dengan badge `+XP`, animasi confetti |               |        |
| TC-F.37 | Result — Retry Frame             | Student mensubmit aktivitas dengan `scorePercent < 70`                                                | Login sebagai student; aktivitas sudah dibuka                                | Retry frame tampil: headline "Coba Sekali Lagi", semua bintang abu-abu, tombol "Coba Lagi" me-restart aktivitas tanpa meninggalkan halaman                                        |               |        |
| TC-F.38 | Result — Course-Complete Frame   | Student mendapat skor sempurna pada aktivitas terakhir yang membuat kursus 100% selesai               | Login sebagai student; kursus hampir 100% — hanya aktivitas ini yang tersisa | Course-complete frame tampil: headline "Luar Biasa! / Materi Selesai", 3 bintang emas, tombol "Lihat Sertifikat" membuka `CourseCertificateModal`                                 |               |        |
| TC-F.39 | Result — Navigasi Lanjut/Selesai | Student berada di celebration frame setelah submit aktivitas                                          | Login sebagai student; aktivitas di-submit dengan skor ≥ 70                  | Jika ada item konten berikutnya: tombol berbunyi "Lanjut" dan mengarah ke item tersebut; jika ini item terakhir: tombol berbunyi "Selesai" dan mengarah ke course overview        |               |        |

---

## F12 — Chatbot AI (Lanjutan)

| ID      | Fitur                        | Skenario                                                  | Precondition                                              | Expected Output                                                                                                                     | Actual Output | Status |
| ------- | ---------------------------- | --------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------ |
| TC-F.40 | Chatbot — Rename & Delete    | Student mengganti nama sebuah sesi chat lalu menghapusnya | Login sebagai student; ≥ 2 sesi chat sudah ada di sidebar | Nama sesi diperbarui di sidebar setelah rename; sesi terhapus dari sidebar setelah delete; sesi chat lain tidak terpengaruh         |               |        |
| TC-F.41 | Chatbot — Suggestion Prompts | Student membuka chatbot baru (belum ada percakapan)       | Login sebagai student; tidak ada sesi chat aktif          | Suggestion prompts (contoh pertanyaan) ditampilkan di area chat; menekan salah satu mengirimkan teks tersebut sebagai pesan pertama |               |        |
| TC-F.42 | Chatbot — Error Retry        | Bot gagal membalas pesan (error dari server)              | Login sebagai student; pesan sudah dikirim                | Banner error dengan tombol "Coba Lagi" muncul di area chat; menekan "Coba Lagi" mengirim ulang pesan terakhir                       |               |        |

---

_Dokumen ini akan digunakan pada subtask kompilasi hasil pengujian fungsional._

---

## Setup Eksekusi Manual

Sebelum menjalankan pengujian, pastikan kondisi berikut terpenuhi:

**Akun uji:**

- Satu akun student aktif (email + password diketahui)
- Satu akun admin (untuk menyiapkan data kursus jika diperlukan)

**Data kursus:**

- Minimal 1 kursus dipublish yang berisi:
  - ≥ 2 bab (minimal 1 dengan media YouTube, 1 dengan media slides jika tersedia)
  - 1 aktivitas True/False
  - 1 aktivitas Word Search
  - 1 aktivitas Drag & Drop
- Kursus tersebut harus dapat diselesaikan 100% untuk menguji TC-F.35 dan TC-F.38

**Lingkungan:**

- Dev server berjalan: `pnpm dev` (localhost:3000) dengan backend production/emulator
- Browser modern (Chrome/Firefox) dalam mode normal (bukan incognito, kecuali skenario uji akses)

**Cara mencatat hasil:**

- Isi kolom **Actual Output** dengan perilaku yang benar-benar terjadi
- Isi kolom **Status** dengan `Pass`, `Fail`, atau `Blocked`
- Untuk status `Fail`, catat langkah repro singkat di kolom Actual Output
