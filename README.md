# Jersey 3D Studio — Pattern Reader V1 prototype

Prototipe frontend untuk memeriksa lima outline vektor yang diekstrak dari `hd.pdf`.

## Menjalankan secara lokal

Persyaratan: Node.js 18 atau lebih baru.

```bash
npm install
npm run dev
```

Buka URL lokal yang ditampilkan Vite.

## Build untuk Vercel

```bash
npm run build
```

Deploy folder proyek ini ke repository GitHub lalu impor repository ke Vercel. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.

## Yang sudah berfungsi

- Data lima outline vektor hasil ekstraksi dari `hd.pdf`.
- Pemilihan panel: front bodice, back bodice, sleeve A, sleeve B, collar.
- Tampilan geometri SVG dan zoom.
- Informasi bounding box dalam cm.
- Upload PDF baru untuk pratinjau halaman pertama.
- Upload logo dan motif untuk asset preview.
- Layout responsif untuk desktop dan mobile.

## Batasan prototipe

- Ekstraksi vektor otomatis saat pengguna mengunggah PDF baru belum diimplementasikan. Lima outline yang tersedia berasal dari file contoh `hd.pdf`.
- Ukuran cm adalah konversi bounding box PDF berdasarkan 72 pt/inci; belum diverifikasi terhadap penggaris atau ukuran cetak fisik.
- Garis jahit, seam allowance, pasangan edge, konstruksi 3D, UV mapping, dan cloth simulation belum dibuat.
- Upload logo/motif saat ini hanya menampilkan pratinjau aset; belum dipetakan ke jersey 3D.

## Catatan Vercel

Aplikasi ini statis dan cocok untuk Vercel. File upload di prototipe diproses lokal di browser. Untuk menyimpan proyek lintas perangkat nanti, tambahkan Supabase Storage/Database atau object storage lain. Periksa kuota dan ketentuan paket gratis sebelum deployment produksi.


## V2 — Jersey 3D Preview Beta

- Menambahkan renderer Three.js dengan model jersey 3D generik berbasis mesh.
- Kamera interaktif: drag untuk orbit, scroll untuk zoom, tombol depan/belakang/samping.
- Rotasi otomatis dapat diaktifkan/nonaktifkan.
- Pengaturan warna dasar jersey.
- Tekstur contoh dengan nama dan nomor, serta dukungan aset logo/motif yang diunggah.
- Komponen 3D di-load sebagai bagian frontend dan tidak membutuhkan server render khusus.

### Batasan penting V2

Model 3D saat ini adalah bentuk jersey generik untuk preview visual, bukan hasil simulasi jahitan dari lima panel `hd.pdf`. Outline panel belum memiliki pasangan garis jahit, seam allowance, notch, dan korespondensi panjang jahitan. Simulasi gravitasi, elastisitas, collision, dan drape kain belum diterapkan. Karena itu model ini tidak boleh digunakan untuk memvalidasi ukuran atau kecocokan pola produksi. Tahap selanjutnya adalah membangun seam mapping dari panel 2D dan menguji panjang garis jahit sebelum garment mesh dibentuk dari pola aktual.

### Dependensi tambahan

`three` digunakan untuk rendering WebGL dan OrbitControls. Jalankan `npm install` setelah mengunduh ZIP.
