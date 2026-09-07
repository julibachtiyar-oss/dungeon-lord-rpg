# 🏰 DUNGEON LORD RPG - AI MASTER MANIFEST & ARCHITECTURE HANDOVER
> **Dokumen ini dirancang agar setiap AI Assistant (Antigravity, Claude, Copilot, ChatGPT) atau developer baru dapat membaca, memahami, memodifikasi, dan men-deploy proyek ini secara mandiri tanpa kehilangan konteks.**

---

## 📌 1. KOORDINAT PROYEK & AKSES CLOUD

| Layanan | Detail / Identitas | Lokasi / URL |
| :--- | :--- | :--- |
| **GitHub Repository** | julibachtiyar-oss/dungeon-lord-rpg | [https://github.com/julibachtiyar-oss/dungeon-lord-rpg](https://github.com/julibachtiyar-oss/dungeon-lord-rpg) |
| **Git Default Branch** | main | Git Remote: origin |
| **Vercel Production** | Live URL | [https://dungeon-lord-rpg.vercel.app](https://dungeon-lord-rpg.vercel.app) |
| **Vercel Scope / Team** | jbwork | Wajib pakai flag --scope jbwork |
| **Vercel Project ID** | prj_pHN5pNukmGO2hAjAtkQ4oL34yLCg | Config di .vercel/project.json |
| **Vercel Org ID** | 	eam_8wI6toY9JgA2DyrHr85Zn7Vn | Team jbwork |
| **Supabase Cloud DB** | SQL Schema & Client | File: supabase/schema.sql & src/lib/supabase.js |
| **Local Directory** | Windows Workspace | C:\Users\julib\.gemini\antigravity\scratch\dungeon-lord-rpg |

---

## 🎮 2. INTI GAMEPLAY & CERITA (LORE)

Game ini memadukan **Action RPG 2D Klasik (Inotia 3 / Diamond Rush)** dengan **Simulasi Pembangunan Dungeon Sanctuary**:
1. **Prolog Isekai**: Pemain dipanggil ke benua fantasi *Eldoria*, memilih nama dan takdir kelas (*Black Knight*, *Astral Archmage*, *Shadow Assassin*).
2. **Ibukota Valenrock (Town Hub)**:
   - **Elena (Resepsionis Guild)**: Pendaftaran petualang Rank F & pembagian misi dungeon.
   - **Borin (Blacksmith)**: Bengkel tempa senjata hingga level +10 & soket batu permata.
   - **Toko Alkimia**: Pembelian Potion pemulihan darah/mana.
   - **Papan Bounty**: Berburu monster dan codex drop table.
3. **Ekspedisi Dungeon (Action RPG Canvas)**:
   - Kontrol joystick virtual & tombol aksi (Serang, Skill 1, Skill 2, Dash, Potion).
   - Kalahkan monster penjaga dan bos lantai (Ruin Golem, Gargoyle Overlord, Lich King).
   - Menaklukkan dungeon menghasilkan **Kristal Inti (Core Crystals)**, Gold, Gems, dan perlengkapan acak.
4. **Rumah Dungeon Kita (Sanctuary Mode)**:
   - Terbuka setelah Misi 1 selesai.
   - Mengikat Kristal Inti untuk membangun kerajaan bawah tanah pribadi (48 petak grid).
   - Bangun fasilitas: Core, Gold Vault goblin, Monster Den, Bengkel Obsidian, Lab Alkimia, Trap Chamber.
   - Bertahan dari serbuan penjelajah luar (*invaders*).

---

## 🗂️ 3. PETA STRUKTUR CODEBASE

`
dungeon-lord-rpg/
├── .vercel/
│   └── project.json          # Konfigurasi project & org Vercel
├── supabase/
│   └── schema.sql            # Script SQL tabel game_saves & leaderboards Supabase
├── public/
│   ├── audio/                # Musik nyata (title_theme.ogg, dungeon_theme.opus, boss_battle.opus)
│   ├── sprites/              # Spritesheet 2D DawnLike (player, slime, undead, demon, humanoid, floor, wall)
│   ├── portraits/            # Portrait NPC & Hero (elena, borin, vespera, hero_warrior)
│   ├── backgrounds/          # Latar kota Valenrock (valenrock.jpg)
│   ├── manifest.json         # Konfigurasi PWA Mobile
│   └── sw.js                 # Service worker offline caching
├── src/
│   ├── components/           # Komponen UI React 19
│   │   ├── TitleScreen.jsx        # Layar pembuka (Lanjutkan / Cerita Baru)
│   │   ├── PrologueModal.jsx      # Dialog pengantar isekai & pemilihan identitas Hero
│   │   ├── TownHub.jsx            # Hub kota Valenrock & interaksi NPC
│   │   ├── DungeonManagement.jsx  # Layar pengelolaan Sanctuary Bawah Tanah
│   │   ├── DungeonSanctuaryMap.jsx# Grid interaktif 48 petak pertahanan dungeon
│   │   ├── InotiaInventoryModal.jsx # Tas 7-slot perlengkapan & manajemen Mercenary
│   │   ├── ClassSelectModal.jsx   # Pemilihan & preview skill 3 kelas
│   │   ├── DungeonFloorSelect.jsx # Pemilih lantai ekspedisi & atmospheric modifier
│   │   ├── TalentTreeModal.jsx    # Pohon bakat 3 cabang per kelas
│   │   ├── BountyBoardModal.jsx   # Papan buruan guild & codex drop monster
│   │   ├── StoryDialogueModal.jsx # Sistem cutscene visual novel dialog beranimasi
│   │   ├── VirtualControls.jsx    # Analog joystick sentuh & tombol aksi smartphone
│   │   ├── BossHealthBar.jsx      # Bar HP bos ornate gothic
│   │   ├── ErrorBoundary.jsx      # Tangkapan layar pemulihan crash otomatis
│   │   └── InstallPwaPrompt.jsx   # Modal pasang aplikasi ke Home Screen HP
│   ├── constants/            # Data game murni (JSON-like)
│   │   ├── classes.js        # Data HERO_CLASSES (Warrior, Mage, Assassin)
│   │   ├── rooms.js          # Template ruang Sanctuary & DUNGEON_FLOORS
│   │   ├── monsters.js       # Status monster, bos, pola AI serangan
│   │   ├── items.js          # Drop table, rarity senjata, zirah, cincin
│   │   ├── mercenaries.js    # Daftar prajurit pendamping & taktik AI
│   │   └── bounties.js       # Misi pemburu monster & floor modifiers
│   ├── engine/               # Game Engine Canvas 2D & Audio
│   │   ├── GameCanvas.jsx    # Wrapper React untuk Canvas HTML5 dengan DPI scaling
│   │   ├── gameEngine.js     # Loop game 60 FPS, partikel, AI monster, damage combat
│   │   ├── spriteRenderer.js # Render sprite pixel 2D DawnLike & animasi karakter
│   │   ├── dungeonTileRenderer.js # Render ubin batu kastil lantai & dinding
│   │   ├── dungeonGenerator.js    # Generator labirin koridor kamar non-overlapping
│   │   └── soundEngine.js    # Audio hybrid (File ogg/opus + synth polyphonic fallback)
│   ├── hooks/
│   │   └── useGameState.js   # State sentral (Save/Load, Gold, Gems, Core Crystals, Stats)
│   ├── lib/
│   │   └── supabase.js       # Client integrasi cloud save & leaderboards Supabase
│   ├── App.jsx               # Root orkestrator tampilan (title/town/sanctuary/adventure)
│   ├── main.jsx              # Entry point React
│   └── index.css             # Konfigurasi Tailwind & utility font fantasi
├── .env.example              # Template variabel lingkungan
├── package.json              # Dependensi npm & build script
├── vite.config.js            # Konfigurasi Vite
├── AI_MASTER_MANIFEST.md     # Dokumen ini (Handover untuk AI)
└── README.md                 # Dokumentasi umum
`

---

## ⚡ 4. ATURAN PENTING & LESSONS LEARNED UNTUK AI

1. **Struktur HERO_CLASSES**:
   - HERO_CLASSES di src/constants/classes.js bertipe **Object**, BUKAN Array.
   - Jika ingin me-loop, selalu gunakan:
     `javascript
     Object.values(HERO_CLASSES).map((cls) => ...)
     `
2. **Perintah Terminal Windows / PowerShell**:
   - Shell aktif adalah **PowerShell**.
   - Jangan gunakan && untuk merangkai perintah. Gunakan ; (titik koma).
   - Jangan gunakan perintah cd mandiri.
3. **Deploy Vercel Wajib Scope**:
   - Perintah deploy:
     `powershell
     vercel --scope jbwork --prod --yes
     `
4. **Audio Web Autoplay**:
   - Browser modern memblokir audio sebelum adanya interaksi pengguna (tap/click).
   - sound.init() sudah dipasang pada tombol Mulai / Tap pertama layar.
   - Jika file audio .ogg / .opus gagal dimuat, soundEngine.js otomatis beralih ke polyphonic synthesizer Web Audio API tanpa menimbulkan crash.
5. **Sprite Renderer Fallback**:
   - spriteRenderer.js dan dungeonTileRenderer.js selalu mengecek img.complete && img.naturalWidth > 0. Jika gambar offline/belum terunduh, engine merender fallback visual prosedural secara instan.

---

## ☁️ 5. CARA MENGHUBUNGKAN SUPABASE (CLOUD SAVE & LEADERBOARD)

1. Buat proyek baru di [https://supabase.com](https://supabase.com).
2. Buka menu **SQL Editor**, buka file supabase/schema.sql dari repositori ini, lalu jalankan script tersebut untuk membuat tabel game_saves dan leaderboards.
3. Buka **Project Settings** > **API**, salin **Project URL** dan **anon public key**.
4. Pasang ke file .env.local atau ke **Vercel Settings > Environment Variables**:
   `env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...
   `
5. Game otomatis mendeteksi konfigurasi tersebut melalui src/lib/supabase.js dan mengaktifkan sinkronisasi cloud!

---

## 🚀 6. PERINTAH DASAR DEVELOPER / AI

- **Menjalankan Game Lokal**:
  `powershell
  npm run dev
  `
- **Kompilasi & Build Produksi**:
  `powershell
  npm run build
  `
- **Commit & Push ke GitHub**:
  `powershell
  git add . ; git commit -m " feat: deskripsi perubahan\ ; git push origin main
 `
- **Deploy Langsung ke Vercel Produksi**:
 `powershell
 vercel --scope jbwork --prod --yes
 `
