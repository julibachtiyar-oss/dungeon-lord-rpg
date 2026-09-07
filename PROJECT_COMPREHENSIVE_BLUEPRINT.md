# 🏰 DUNGEON LORD: CHRONICLES OF INOTIA — MASTER PROJECT BLUEPRINT
> **Single-File Complete Documentation & System Architecture**  
> *Dokumen tunggal lengkap mencakup cerita, mekanik gameplay, arsitektur teknis, struktur file, aset visual/audio, konfigurasi cloud (GitHub, Supabase, Vercel), hingga panduan untuk AI.*

---

## 🌐 1. KOORDINAT UTAMA PROYEK

* **Live Game Production (Vercel)**: [https://dungeon-lord-rpg.vercel.app](https://dungeon-lord-rpg.vercel.app)
* **GitHub Repository**: [https://github.com/julibachtiyar-oss/dungeon-lord-rpg](https://github.com/julibachtiyar-oss/dungeon-lord-rpg)
* **Default Branch**: main
* **Vercel Scope / Team**: jbwork
* **Vercel Project ID**: prj_pHN5pNukmGO2hAjAtkQ4oL34yLCg
* **Vercel Org ID**: 	eam_8wI6toY9JgA2DyrHr85Zn7Vn
* **Workspace Lokal**: C:\Users\julib\.gemini\antigravity\scratch\dungeon-lord-rpg

---

## 📖 2. CERITA, PREMIS & GAMEPLAY LOOP

### A. Alur Cerita (Isekai Lore)
1. **Prolog & Pemanggilan**: Karakter utama terlempar dari dunia modern ke Benua Fantasi **Eldoria** melalui gerbang aksara kuno misterius.
2. **Pendaftaran Petualang**: Tiba di gerbang **Kota Valenrock**, pusat peradaban petualang. Pemain mendaftar ke *Adventurer's Guild* yang dipimpin oleh **Elena** dan mendapat Rank F.
3. **Misi Pertama & Kristal Inti**: Pemain dikirim menyelidiki *Whispering Ruins*. Setelah mengalahkan bos batu kuno (*Ruin Golem*), pemain menemukan **Kristal Inti Dungeon (Core Crystal)** yang berdenyut hangat.
4. **Kelahiran Dungeon Sanctuary**: Kristal Inti bukan untuk diserahkan ke kerajaan, melainkan diikat dengan jiwa pemain untuk membuka **Sanctuary**—kerajaan bawah tanah rahasia milik pemain sendiri yang dipandu oleh roh penjaga **Vespera**.

### B. Siklus Permainan (Core Game Loop)
`mermaid
graph TD
    A[Ibukota Valenrock Hub] -->|Terima Misi / Belanja / Tempa| B[Gerbang Ekspedisi]
    B -->|Action RPG 2D Combat| C[Dungeon Crawler Lantai 1-3]
    C -->|Kalahkan Monster & Bos| D[Rebut Kristal Inti & Loot]
    D -->|Bawa Pulang Hasil Jarahan| E[Rumah Dungeon Sanctuary]
    E -->|Gunakan Kristal Inti| F[Bangun Fasilitas 48 Petak & Minion]
    F -->|Hasilkan Gold Pasif & Status| A
`

---

## ⚔️ 3. TIGA KELAS HERO & NPC UTAMA

### A. Hero Protagonis (src/constants/classes.js)
1. **Black Knight (Warrior)**:
   - *Gaya Bertarung*: Melee jarak dekat berzirah Obsidian tebal, HP dan Defense tertinggi.
   - *Skill 1*: **Hellfire Cleave** — Tebasan pedang api hitam melukai area depan (Damage x2.2).
   - *Skill 2*: **Bastion of Torment** — Tameng kutukan menyerap 70% damage musuh, memulihkan 80 HP, dan mempertebal pertahanan selama 5 detik.
   - *Ultimate*: **Whirlwind of Doom** — Berputar 360 derajat layaknya badai kematian dengan efek knockback (Damage x3.4).
2. **Astral Archmage (Mage)**:
   - *Gaya Bertarung*: Ranged proyektil sihir bintang & es, MP tinggi, serangan area mematikan.
   - *Skill 1*: **Meteor Cataclysm** — Menjatuhkan bola meteor raksasa berledakan area (Damage x2.8).
   - *Skill 2*: **Glacial Frost Nova** — Membekukan suhu ruangan, menghentikan gerak semua monster selama 4 detik.
   - *Ultimate*: **Celestial Restoration** — Ledakan cahaya kosmik yang melukai musuh dan memulihkan HP Hero serta Mercenary.
3. **Shadow Assassin (Rogue)**:
   - *Gaya Bertarung*: Kecepatan tinggi (Speed 4.2), critical chance 35%, serangan bertubi-tubi kilat.
   - *Skill 1*: **Shadow Step Strike** — Teleportasi sekejap ke belakang musuh dengan 100% Critical Damage.
   - *Skill 2*: **Poison Fan Blades** — Melempar 8 belati beracun menyebar 360 derajat dengan efek racun DoT.
   - *Ultimate*: **Phantom Dance** — Bayangan klon menyerang musuh berkali-kali tanpa bisa ditarget selama 3 detik.

### B. NPC Kota Valenrock & Sanctuary
* **Elena (Resepsionis Guild)**: Memberikan misi bounty, tutorial, dan pendaftaran petualang (*portrait: /portraits/elena.jpg*).
* **Borin (Pandai Besi)**: Bengkel tempa senjata hingga tingkat +10 dan pemasangan soket batu permata (*portrait: /portraits/borin.jpg*).
* **Vespera (Roh Inti Sanctuary)**: Pemandu pembangunan kerajaan bawah tanah dan pengatur pertahanan dari penyerang luar (*portrait: /portraits/vespera.jpg*).

---

## 🏰 4. DUA MODE GAMEPLAY LENGKAP

### Mode 1: Ekspedisi Petualangan (Action RPG 2D Canvas)
* **Engine**: HTML5 2D Canvas rendering 60 FPS dengan dukungan **Retina High-DPI** (devicePixelRatio 1.0 - 2.5x).
* **Kontrol Smartphone**: Analog Virtual Joystick di kiri bawah layar (360 derajat) + Tombol Aksi di kanan bawah (Serang, Skill 1, Skill 2, Dash Menghindar, Quick Potion).
* **Sistem Monster**:
  - *Slime Hijau*: Melompat dengan animasi squash & stretch jelly.
  - *Goblin*: Lincah dengan senjata belati.
  - *Skeleton Archer*: Pemanah kerangka jarak jauh.
  - *Orc Berserker*: Monster kekar dengan serangan tebasan kapak berat.
  - *Bos Ruin Golem / Gargoyle Overlord / Lich King*: Bos berskala besar (72x72 px) dengan bar HP bertingkat dan pola serangan berfase.
* **Sistem Looting**: Peti harta karun di setiap ruangan berisi Gold, Gems, serta perlengkapan senjata dan zirah dengan tingkat rarity (*Common, Rare, Epic, Legendary*).

### Mode 2: Pengelolaan Sanctuary Bawah Tanah (Dungeon Tycoon)
* **Grid 48 Petak (8 Kolom x 6 Baris)**: Pemain menyusun tata letak ruangan dungeon:
  1. **Jantung Dungeon (Core)**: Pusat kristal kehidupan dungeon.
  2. **Ruang Simpanan Goblin (Gold Vault)**: Menghasilkan Gold pasif per detik (bisa diklaim kapan saja).
  3. **Sarang Monster Minion (Monster Den)**: Membiakkan minion penjaga dan memproduksi Gems.
  4. **Ruang Tempa Obsidian (Forge)**: Memperkuat senjata dan zirah Hero.
  5. **Kuali Alkimia (Alchemy Lab)**: Meracik potion HP & MP otomatis secara berkala.
  6. **Ruang Perangkap Duri (Trap Chamber)**: Melumpuhkan penjelajah luar (*invaders*) yang mencoba menjarah dungeon.
* **Simulasi Invaders**: Petualang manusia luar akan mencoba memasuki portal dan menyerang inti dungeon. Perangkap dan minion Anda akan otomatis mencegat mereka.

---

## 🎨 5. ASET VISUAL & AUDIO HYBRID

### A. Aset Gambar 2D Pixel Art Asli (DawnLike Framework)
Tersimpan di folder public/:
* public/sprites/player.png: Spritesheet 2D Hero 16x16 (Warrior, Mage, Assassin) dengan arah hadap 4 arah dan frame jalan.
* public/sprites/humanoid.png: Sprite prajurit pendamping (Mercenary) dan Goblin.
* public/sprites/slime.png: Sprite monster Slime dengan animasi loncat.
* public/sprites/undead.png: Sprite Skeleton Archer dan Lich King.
* public/sprites/demon.png: Sprite Gargoyle Overlord bertanduk besar.
* public/sprites/floor.png & wall.png: Ubin lantai batu bertekstur dan dinding kastil gothic.
* public/backgrounds/valenrock.jpg: Ilustrasi kota kastil megah Valenrock.
* public/portraits/: Avatar lukisan anime-gothic Elena, Borin, Vespera, dan Hero.

### B. Audio Engine Hybrid 2.0 (src/engine/soundEngine.js)
* **Musik Berkualitas Tinggi (Eksternal)**:
  - Layar Pembuka & Kota: /audio/title_theme.ogg (Petikan kecapi & flute akustik abad pertengahan).
  - Penjelajahan Dungeon: /audio/dungeon_theme.opus (Musik petualangan 8-bit retro dinamis).
  - Pertarungan Bos: /audio/boss_battle.opus (Musik battle bertempo cepat).
* **Procedural Synthesis Fallback**: Jika koneksi lambat atau browser menahan izin autoplay, engine otomatis menyalakan synthesizer chiptune polyphonic (Web Audio API) tanpa error.

---

## 📁 6. PETA POHON FILE CODEBASE

`
dungeon-lord-rpg/
├── .vercel/
│   └── project.json                  # ID proyek & konfigurasi Vercel
├── supabase/
│   └── schema.sql                    # Skema database PostgreSQL Supabase
├── public/
│   ├── audio/                        # File musik nyata (.ogg, .opus)
│   ├── sprites/                      # Spritesheet pixel art 2D
│   ├── portraits/                    # Foto avatar NPC & Hero
│   ├── backgrounds/                  # Latar belakang kota Valenrock
│   ├── manifest.json                 # Manifest PWA (Pasang di HP)
│   └── sw.js                         # Service worker untuk offline caching
├── src/
│   ├── components/
│   │   ├── TitleScreen.jsx           # Layar mulai / lanjut game
│   │   ├── PrologueModal.jsx         # Cutscene awal isekai & pemilihan identitas
│   │   ├── TownHub.jsx               # Hub kota Valenrock, dialog NPC, toko potion
│   │   ├── DungeonManagement.jsx     # Dashboard manajemen Sanctuary
│   │   ├── DungeonSanctuaryMap.jsx   # Grid pertahanan 48 petak dungeon
│   │   ├── InotiaInventoryModal.jsx  # Tas 7 slot, paperdoll zirah, mercenary
│   │   ├── ClassSelectModal.jsx      # Modal ganti & pratinjau kelas hero
│   │   ├── DungeonFloorSelect.jsx    # Pemilih lantai 1-3 & atmospheric modifiers
│   │   ├── TalentTreeModal.jsx       # Pohon bakat 3 cabang per kelas hero
│   │   ├── BountyBoardModal.jsx      # Papan misi hadiah monster & bestiary
│   │   ├── StoryDialogueModal.jsx    # Sistem dialog cutscene visual novel
│   │   ├── VirtualControls.jsx       # Joystick virtual & tombol sentuh aksi
│   │   ├── BossHealthBar.jsx         # Indikator bar HP bos berornamen
│   │   ├── ErrorBoundary.jsx         # Layar pemulihan otomatis jika crash
│   │   └── InstallPwaPrompt.jsx      # Modal install aplikasi native ke HP
│   ├── constants/
│   │   ├── classes.js                # Data spesifikasi HERO_CLASSES (Object)
│   │   ├── rooms.js                  # DUNGEON_ROOMS_TEMPLATE & DUNGEON_FLOORS
│   │   ├── monsters.js               # Data monster, statistik, dan AI behavior
│   │   ├── items.js                  # Tabel loot, rarity perlengkapan
│   │   ├── mercenaries.js            # Karakter pendamping & AI taktik
│   │   └── bounties.js               # Quest buruan & modifier lantai
│   ├── engine/
│   │   ├── GameCanvas.jsx            # Komponen React canvas + resize listener
│   │   ├── gameEngine.js             # Engine pertarungan, fisika proyektil, combo
│   │   ├── spriteRenderer.js         # Render karakter & monster pixel 2D
│   │   ├── dungeonTileRenderer.js    # Render lantai dan dinding labirin
│   │   ├── dungeonGenerator.js       # Generator dungeon otomatis non-overlapping
│   │   └── soundEngine.js            # Engine audio hybrid (file + synth)
│   ├── hooks/
│   │   └── useGameState.js           # State sentral game, upgrade, ekonomi, loot
│   ├── lib/
│   │   └── supabase.js               # Client helper cloud save & leaderboards
│   ├── App.jsx                       # Root view switcher (title/town/sanctuary/adventure)
│   ├── main.jsx                      # Entrypoint React
│   └── index.css                     # Tailwind CSS & styling font fantasi
├── .env.example                      # Template credential Supabase
├── package.json                      # Dependensi npm & script build
├── vite.config.js                    # Konfigurasi bundler Vite
├── AI_MASTER_MANIFEST.md             # Panduan instruksi khusus AI
├── PROJECT_COMPREHENSIVE_BLUEPRINT.md # Dokumen blueprint tunggal ini
└── README.md                         # Halaman pengantar GitHub
`

---

## 🗄️ 7. SKEMA DATABASE SUPABASE (CLOUD SAVE & LEADERBOARDS)

Script SQL ini tersimpan di supabase/schema.sql dan siap dijalankan langsung di **Supabase SQL Editor**:

`sql
-- 1. Tabel Penyimpanan Data Permainan di Awan (Cloud Saves)
CREATE TABLE IF NOT EXISTS public.game_saves (
    player_id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL DEFAULT 'Ren',
    hero_class_id TEXT NOT NULL DEFAULT 'warrior',
    hero_level INTEGER NOT NULL DEFAULT 1,
    core_crystals INTEGER NOT NULL DEFAULT 0,
    gold BIGINT NOT NULL DEFAULT 0,
    gems INTEGER NOT NULL DEFAULT 0,
    story_chapter INTEGER NOT NULL DEFAULT 1,
    adventurer_rank TEXT NOT NULL DEFAULT 'F',
    save_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabel Papan Peringkat Global (Leaderboard)
CREATE TABLE IF NOT EXISTS public.leaderboards (
    player_id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL,
    hero_class TEXT NOT NULL,
    hero_level INTEGER NOT NULL DEFAULT 1,
    core_crystals INTEGER NOT NULL DEFAULT 0,
    floor_reached INTEGER NOT NULL DEFAULT 1,
    total_kills INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indeks Kecepatan Query
CREATE INDEX IF NOT EXISTS idx_game_saves_updated ON public.game_saves(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_score ON public.leaderboards(core_crystals DESC, floor_reached DESC);

-- 4. Row Level Security (RLS)
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY " Allow public read on game_saves\ ON public.game_saves FOR SELECT USING (true);
CREATE POLICY \Allow public upsert on game_saves\ ON public.game_saves FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY \Allow public read on leaderboards\ ON public.leaderboards FOR SELECT USING (true);
CREATE POLICY \Allow public upsert on leaderboards\ ON public.leaderboards FOR ALL USING (true) WITH CHECK (true);
`

### Konfigurasi Environment Variables:
Tambahkan ke file .env.local atau ke **Vercel Project Settings > Environment Variables**:
`env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
`

---

## ⚠️ 8. ATURAN KRUSIAL PENGEMBANGAN (LESSONS LEARNED UNTUK AI)

1. **HERO_CLASSES adalah Object, Bukan Array**:
 - HERO_CLASSES di src/constants/classes.js adalah object berkunci ({ warrior: {...}, mage: {...}, rogue: {...} }).
 - Jangan pernah panggil HERO_CLASSES.map(...) langsung! Selalu gunakan Object.values(HERO_CLASSES).map(...).
2. **Sintaks PowerShell Windows**:
 - Operator perangkaian perintah di terminal Windows adalah titik koma ;, bukan &&.
 - Jangan jalankan perintah cd mandiri; gunakan argumen direktori kerja saat menjalankan tool.
3. **Penyebaran Vercel Wajib Membawa Scope**:
 - Selalu deploy dengan parameter:
 `powershell
 vercel --scope jbwork --prod --yes
 `
4. **Rendering Pixel Art Tajam**:
 - Selalu atur ctx.imageSmoothingEnabled = false sebelum memanggil ctx.drawImage untuk menjaga ketajaman resolusi pixel art 16x16 di layar beresolusi tinggi.

---

## 🛠️ 9. PERINTAH LOKAL CEPAT

* **Menjalankan Server Dev**: 
pm run dev
* **Menguji Kompilasi Produksi**: 
pm run build
* **Menyimpan & Kirim ke GitHub**: git add . ; git commit -m \feat: deskripsi\ ; git push origin main
* **Deploy ke Vercel Produksi**: ercel --scope jbwork --prod --yes

---
*Dokumen ini merupakan sumber kebenaran tunggal (Single Source of Truth) dari proyek Dungeon Lord RPG.*
