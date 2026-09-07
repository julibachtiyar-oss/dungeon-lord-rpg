# 🏰 Dungeon Lord: Chronicles of Inotia ⚔️

> **Game Mobile Action RPG & Dungeon Sanctuary Tycoon bergaya Retro Pixel Art Abad Pertengahan.**
> Dibangun dengan React 19, Vite, HTML5 Canvas 2D Engine, Web Audio API, dan Progressive Web App (PWA).

[![Live Game](https://img.shields.io/badge/Live-dungeon--lord--rpg.vercel.app-gold?style=for-the-badge&logo=vercel)](https://dungeon-lord-rpg.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-julibachtiyar--oss%2Fdungeon--lord--rpg-purple?style=for-the-badge&logo=github)](https://github.com/julibachtiyar-oss/dungeon-lord-rpg)
[![PWA Ready](https://img.shields.io/badge/PWA-Mobile%20Ready-emerald?style=for-the-badge&logo=pwa)](https://dungeon-lord-rpg.vercel.app)

---

## 🌐 Mainkan Sekarang
🎮 **Mainkan Langsung**: **[https://dungeon-lord-rpg.vercel.app](https://dungeon-lord-rpg.vercel.app)**  
*(Dapat langsung dimainkan di browser smartphone Android/iOS maupun PC, serta dapat dipasang ke layar utama HP)*

---

## 📖 Alur Cerita & Fitur Permainan

### 1. Bab 1: Isekai & Ibukota Valenrock
* Terlempar ke dunia fantasi Eldoria melalui gerbang rune kuno.
* Tentukan nama dan takdir kelas:
  - 🛡️ **Black Knight**: Ksatria kegelapan berzirah obsidian dengan tebasan api Hellfire Cleave & Bastion of Torment.
  - 🔮 **Astral Archmage**: Penyihir elemen bintang dengan proyektil Meteor Cataclysm & Glacial Frost Nova.
  - 🗡️ **Shadow Assassin**: Pembunuh bayangan belati beracun dengan kecepatan tinggi & Poison Blades.
* Laporkan diri ke **Elena** di Adventurer's Guild dan tempa perlengkapan pada **Borin** di Bengkel Tempa (+10).

### 2. Ekspedisi Dungeon Liar (Inotia Action RPG)
* Navigasi petualangan menggunakan **Virtual Analog Joystick** dan tombol skill di layar smartphone.
* Hadapi kawanan monster: Slime, Goblin, Skeleton Archer, Orc Berserker.
* Taklukkan Bos Penjaga Kuno: Ruin Golem & Gargoyle Overlord untuk merebut **Kristal Inti (Core Crystals)**!

### 3. Rumah Bawah Tanah Kita (Sanctuary Mode)
* Gunakan Kristal Inti hasil ekspedisi untuk membangun kerajaan bawah tanah pribadimu.
* 48 petak pertahanan strategis:
  - **Dungeon Core**: Pusat energi kerajaan.
  - **Gold Vault**: Goblin tambang penghasil koin emas pasif.
  - **Monster Den**: Membiakkan minion penjaga.
  - **Bengkel Obsidian**: Peningkatan status perlengkapan.
  - **Lab Alkimia**: Pembuatan ramuan otomatis.
  - **Trap Chamber**: Jebakan duri & racun maut bagi penyerang luar.

---

## 🛠️ Tech Stack & Arsitektur
- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Engine 2D**: HTML5 Canvas kustom dengan Retina High-DPI scaling (devicePixelRatio), partikel combat, dan kamera dinamis.
- **Aset 2D**: Spritesheet pixel art retro 16x16 DawnLike.
- **Audio Hybrid**: File musik tema kastil (.ogg) & pertempuran 8-bit (.opus) dengan fallback ke Polyphonic Web Audio API synthesis.
- **Database Cloud (Opsional)**: Supabase PostgreSQL (Schema di supabase/schema.sql).
- **Deployment**: Vercel Edge Network.

---

## 🤖 Panduan Pengembang & AI Handover
Untuk dokumentasi arsitektur menyeluruh, skema database, panduan integrasi Supabase, dan aturan pengembangan bagi AI/developer, silakan baca file:
👉 **[AI_MASTER_MANIFEST.md](./AI_MASTER_MANIFEST.md)**

---

## 💻 Menjalankan Game Secara Lokal

1. **Clone repository**:
   `ash
   git clone https://github.com/julibachtiyar-oss/dungeon-lord-rpg.git
   cd dungeon-lord-rpg
   `
2. **Install dependensi**:
   `ash
   npm install
   `
3. **Jalankan local development server**:
   `ash
   npm run dev
   `
4. **Build untuk produksi**:
   `ash
   npm run build
   `
