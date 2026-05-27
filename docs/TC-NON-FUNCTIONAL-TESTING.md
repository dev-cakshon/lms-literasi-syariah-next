# Tabel Test Cases — Non-Functional Testing (TC-NF)

**Dokumen:** TC-NON-FUNCTIONAL-TESTING.md  
**Versi MVP:** Mei 2026  
**Standar Kualitas:** ISO/IEC 25010 — Compatibility, Reliability, Performance Efficiency  
**Cakupan Platform:** Web desktop & laptop (mobile di luar cakupan — keputusan ruang lingkup)

> Kolom hasil (Status / skor / rasio) dikosongkan — diisi saat eksekusi pengujian (TA-34).

---

## NFT-1 — Compatibility

**Aspek ISO/IEC 25010:** Co-existence, Interoperability  
**Tool:** Browser DevTools → responsive mode

### Kriteria Lolos

Setiap kombinasi browser × ukuran layar dinyatakan **Pass** bila memenuhi semua kondisi berikut:

- **Critical path berjalan penuh:** login → buka kursus → buka bab → mark complete → kerjakan aktivitas → lihat hasil.
- **Rendering bersih:** tidak ada overflow, elemen tumpang tindih, teks terpotong, atau kontrol yang tidak bisa diklik.
- **Konsistensi visual:** layout, font, dan warna sesuai desain.

### Matriks Hasil

| Browser / Versi           | Desktop (1920×1080) | Laptop (1366×768) | Catatan |
| ------------------------- | ------------------- | ----------------- | ------- |
| Google Chrome (v\_\_\_)   |                     |                   |         |
| Mozilla Firefox (v\_\_\_) |                     |                   |         |
| Microsoft Edge (v\_\_\_)  |                     |                   |         |

> **Catatan ruang lingkup:** Pengujian dibatasi pada platform web desktop dan laptop. Platform mobile (375px) dan Safari (memerlukan macOS) berada di luar cakupan — keputusan ruang lingkup yang disengaja.

Isi sel dengan `Pass` atau `Fail`. Bila `Fail`, cantumkan referensi defect singkat di kolom Catatan.

---

## NFT-2 — Reliability

**Aspek ISO/IEC 25010:** Maturity, Fault Tolerance  
**Tool:** Chrome DevTools → Network tab (throttling: Slow 3G)

### Kriteria Lolos

- **Kondisi Normal:** 100% sukses, tanpa error atau hasil flaky.
- **Kondisi Slow 3G:** tetap berhasil pada akhirnya; loader/skeleton tampil saat menunggu; tidak ada state rusak atau duplikasi (poin tidak dobel, sertifikat idempoten).

### Tabel Uji

| ID      | Skenario Kritis                                        | Kondisi Jaringan | Iterasi | Hasil (Sukses/Total) | Perilaku Teramati | Status |
| ------- | ------------------------------------------------------ | ---------------- | ------- | -------------------- | ----------------- | ------ |
| TC-R.01 | Login student → redirect `/dashboard`                  | Normal           | 10x     |                      |                   |        |
| TC-R.02 | Login student → redirect `/dashboard`                  | Slow 3G          | 5x      |                      |                   |        |
| TC-R.03 | Mark chapter complete + award poin (real-time)         | Normal           | 10x     |                      |                   |        |
| TC-R.04 | Mark chapter complete + award poin                     | Slow 3G          | 5x      |                      |                   |        |
| TC-R.05 | Submit aktivitas → `ActivityResultScreen` + best score | Normal           | 10x     |                      |                   |        |
| TC-R.06 | Submit aktivitas → `ActivityResultScreen`              | Slow 3G          | 5x      |                      |                   |        |
| TC-R.07 | Selesaikan kursus 100% → terbit sertifikat (idempoten) | Normal           | 5x      |                      |                   |        |

Isi kolom **Hasil** dengan rasio sukses (mis. `10/10`), **Perilaku Teramati** dengan catatan singkat, dan **Status** dengan `Pass` atau `Fail`.

---

## NFT-3 — Performance (Lighthouse)

**Aspek ISO/IEC 25010:** Time Behaviour, Resource Utilisation  
**Tool:** Chrome Lighthouse (built-in DevTools)  
**Kondisi Audit:** Production build (`pnpm build && pnpm start`), mode Desktop, jendela incognito.

### Skala Skor

| Skor     | Kategori                 |
| -------- | ------------------------ |
| 90 – 100 | Hijau (Baik)             |
| 50 – 89  | Kuning (Perlu Perbaikan) |
| 0 – 49   | Merah (Buruk)            |

### Tabel Hasil Audit

| ID      | Halaman / Rute                 | Performance | Accessibility | Best Practices | SEO | LCP (s) | TBT (ms) | CLS | Catatan |
| ------- | ------------------------------ | ----------- | ------------- | -------------- | --- | ------- | -------- | --- | ------- |
| TC-P.01 | Landing / login (`/`)          |             |               |                |     |         |          |     |         |
| TC-P.02 | Dashboard (`/dashboard`)       |             |               |                |     |         |          |     |         |
| TC-P.03 | Katalog kursus (`/my-courses`) |             |               |                |     |         |          |     |         |
| TC-P.04 | Course overview                |             |               |                |     |         |          |     |         |
| TC-P.05 | Chapter viewer                 |             |               |                |     |         |          |     |         |
| TC-P.06 | Aktivitas (Drag & Drop)        |             |               |                |     |         |          |     |         |

Isi setiap kolom skor dengan angka (0–100) dan Core Web Vitals dengan nilai absolut. Lampirkan **screenshot hasil Lighthouse** untuk setiap baris di bawah tabel ini saat eksekusi.

---

## Setup Eksekusi

**Production build (wajib untuk Lighthouse):**

```bash
# Dari lms-literasi-syariah-next/
pnpm build && pnpm start
```

Lighthouse harus dijalankan terhadap production build — bukan `pnpm dev`.

**Akun uji:**

- Satu akun student aktif (email + password diketahui).
- Kursus uji yang dapat diselesaikan 100% (berisi bab + semua jenis aktivitas).

**Versi browser:** catat nomor versi aktual saat pengujian di kolom "Browser / Versi" pada matriks Compatibility.

---

## Cara Mencatat Hasil

| Tabel         | Kolom yang Diisi                 | Nilai Berlaku                                 |
| ------------- | -------------------------------- | --------------------------------------------- |
| Compatibility | Sel matriks                      | `Pass` / `Fail` (+ catatan defect)            |
| Reliability   | Hasil, Perilaku Teramati, Status | Rasio `n/n`; catatan singkat; `Pass` / `Fail` |
| Lighthouse    | Skor (4 kolom) + CWV (3 kolom)   | Angka; lampirkan screenshot di bawah tabel    |

---

## Kesimpulan

_(Diisi setelah seluruh pengujian selesai)_

| Aspek         | Hasil | Keterangan |
| ------------- | ----- | ---------- |
| Compatibility |       |            |
| Reliability   |       |            |
| Performance   |       |            |

**Putusan:** `Layak` / `Tidak Layak` lanjut ke Penyatuan Aplikasi.

---

_Dokumen ini digunakan pada subtask eksekusi non-functional testing (TA-34) dan kompilasi dokumen internal testing (TA-35)._
