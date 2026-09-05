# Dungeon Lord: RPG & Sanctuary ⚔️🏰

Game Mobile Web RPG & Dungeon Tycoon yang dapat dimainkan langsung di browser smartphone atau dipasang ke layar utama HP (PWA).

---

## 🎮 Dua Mode Permainan

### 1. Mode Pengelolaan Dungeon (Sanctuary Tycoon)
* **Jantung Dungeon (Core)**: Pusat kekuatan dan wilayah kekuasaan dungeon.
* **Ruang Simpanan Goblin (Gold Vault)**: Menghasilkan Gold pasif setiap detik (bisa diklaim kapan saja saat online maupun offline).
* **Sarang Monster Minion (Monster Den)**: Membiakkan minion penjaga dungeon dan menghasilkan Kristal Jiwa (Gems).
* **Ruang Tempa Obsidian (Forge)**: Meng-upgrade statistik senjata dan perlengkapan zirah Hero.
* **Kuali Alkimia (Alchemy Lab)**: Meracik ramuan pemulihan HP & Mana secara otomatis.
* **Ruang Perangkap Maut (Trap Chamber)**: Melindungi dungeon dari penyusup dan memperkuat armor Hero.

### 2. Mode Petualangan (Action RPG Dungeon Crawler)
* **Pilihan Kelas Hero**:
  * **Dragon Knight**: Petarung jarak dekat berzirah tebal, skill *Whirlwind Slash* (putaran pedang area) & *Iron Bastion* (tameng naga penyerap damage).
  * **Astral Archmage**: Ahli mantra jarak jauh, skill *Meteor Fireball* (ledakan api besar) & *Frost Nova* (membekukan musuh).
  * **Shadow Assassin**: Sangat lincah dan berkecepatan tinggi, skill *Shadow Blitz* (serangan kilat 100% crit) & *Poison Blades* (8 belati beracun).
* **Kontrol Sentuh Khusus Smartphone**:
  * Analog Virtual Joystick di kiri bawah layar (gerakan 360 derajat responsif).
  * Tombol aksi di kanan bawah: Serang Utama, Skill 1, Skill 2, Dash / Menghindar, dan Quick Potion.
* **Sistem Loot & Boss**:
  * Kumpulkan senjata, zirah, dan relik bertingkat *Common*, *Rare*, *Epic*, hingga *Legendary*.
  * Hadapi Gargoyle Overlord dan Lich King Malakor dengan animasi proyektil dan efek suara retro sintetis.

---

## 🚀 Menjalankan Game Secara Lokal

1. Buka folder proyek di terminal:
   ```bash
   cd C:\Users\julib\.gemini\antigravity\scratch\dungeon-lord-rpg
   ```
2. Jalankan server pengembangan Vite:
   ```bash
   npm run dev
   ```
3. Buka URL yang muncul di browser (misal: `http://localhost:5173`).
4. Untuk membuka di HP yang satu jaringan WiFi, buka alamat Network IP yang tertera di terminal.

---

## 📲 Memasang Game di HP (PWA - Add to Home Screen)

1. Buka game melalui browser HP (Chrome / Safari / Edge).
2. Tekan tombol **"Pasang di HP"** yang muncul di layar, atau buka menu browser lalu pilih **"Tambahkan ke Layar Utama" (Add to Home Screen)**.
3. Game akan langsung terinstal layaknya aplikasi native tanpa frame browser dan mendukung permainan offline!

---

## ☁️ Cara Deploy ke Vercel

Game ini sudah dilengkapi konfigurasi `vercel.json`:
```bash
vercel
```
Atau hubungkan ke repository GitHub Anda untuk continuous deployment otomatis.
