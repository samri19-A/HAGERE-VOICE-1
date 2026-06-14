# HAGERE VOICE

[![Project Status](https://img.shields.io/badge/status-beta-yellow.svg)](https://github.com/samri19-A/HAGERE-VOICE-1)
[![Languages](https://img.shields.io/github/languages/top/samri19-A/HAGERE-VOICE-1)](https://github.com/samri19-A/HAGERE-VOICE-1)
[![Stars](https://img.shields.io/github/stars/samri19-A/HAGERE-VOICE-1?style=social)](https://github.com/samri19-A/HAGERE-VOICE-1/stargazers)

A polished, offline-first Amharic voice assistant that empowers women artisans to manage inventory with voice — fast, reliable, and beautiful.

---

🎯 Why this project matters

- Designed for accessibility and low-connectivity environments: works offline with a local demo mode and syncs to Supabase when online.
- Local-first UX for non-technical users (voice-first controls in Amharic) so artisans can manage stock without typing.
- Audit-ready: every voice command is logged so changes are traceable for training and trust.

---

✨ Live demo

If you want to see the live demo Please click the link below. :

[🔗 Live demo ](https://hagere-voice-1-cg8m-oze75v8vh-samrawit-s-projects1.vercel.app/)

---

🚀 Quick start (developer)

1. Install dependencies

```bash
npm install
cp .env.example .env   # add Supabase URL + anon key when ready
npm run dev
```

2. Open the app in Chrome (desktop recommended for best Web Speech API support) and try the voice button: press **ድምጽ ተናገር** and speak an Amharic command.

Notes:
- Without Supabase configured the app runs in a local demo mode (localStorage queue) so you can validate the voice flow immediately.

---

🧭 MVP demo flow (short)

1. The user taps **ድምጽ ተናገር** and speaks an Amharic instruction (e.g., `ሱሪ ሁለት ጨመር`).
2. Browser speech-to-text captures Amharic transcript (am-ET locale preferred).
3. amharicParser.js extracts { action, itemName, quantity }.
4. apply_voice_command RPC updates `inventory_items` and writes an audit to `voice_commands`.
5. UI shows before → after quantity change in real time using Supabase Realtime.

---

📦 Project structure (current)

This repository has been updated since earlier docs. Below is the current, authoritative structure from the repository root and the "src/" folder.

Root (top-level):

```
.env.example
.gitignore
.vscode/
index.html
package.json
package-lock.json
vite.config.js
vercel.json
public/
supabase/
src/
README.md
```

src/ (current source layout):

```
src/
├── App.css
├── App.jsx
├── Root.jsx
├── main.jsx
├── components/      # React components (UI pieces)
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries, parsers, services
└── pages/           # Route pages (if used)
```

Notes:
- The `components/`, `hooks/`, `lib/`, and `pages/` directories contain the current app code; the examples in earlier documentation remain conceptually valid but file locations and names might have changed during development.
- Use `src/App.jsx` and `src/Root.jsx` as the application entry points when inspecting runtime behavior.

If you want, I can list the files inside `src/components`, `src/hooks`, and `src/lib` explicitly and add that expanded tree to this README.

---

🗂 Supported Amharic commands (examples)

| Command | Meaning |
|---|---|
| `ሱሪ ሁለት ጨመር` | Add 2 dresses |
| `ቀሚስ አንድ ቀንስ` | Subtract 1 shirt |
| `ሻማ አምስት ጨመር` | Add 5 scarves |

Keywords:
- Add: ጨመር, ጨምር, አክል
- Subtract: ቀንስ, ቀንሳ, አውርድ
- Numbers: አንድ (1) … አስር (10), also supports digits `5`, `12`

---

🗄 Database

- `inventory_items` — current stock per item
- `voice_commands` — audit log with `quantity_before` / `quantity_after`

Supabase setup (for full live demo):
1. Create a free project at https://supabase.com
2. Open SQL Editor and run `supabase/migrations/001_inventory.sql`
3. Enable Realtime for `inventory_items` and `voice_commands` (Database → Replication)
4. Add the project URL and anon key to `.env`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

💡 Tips for a compelling demo

- Use Chrome on desktop for the best am-ET speech recognition.
- Keep the Manual Command Input visible as a reliable fallback during demos.
- Show Supabase Table Editor live: speak → row updates → UI reacts.
- Record a short screen capture (30–60s) showing the full flow.

---

🧩 Extending the project

Ideas that make the product more lovable to developers and stakeholders:
- CI/CD friendly deploys and a one-click demo deploy (Vercel/Netlify).
- Mobile-friendly UI and microphone permission flow improvements.
- Localization pipeline for additional Ethiopian languages.
- Analytics dashboard for voice-command accuracy and common phrases.

---

🤝 Contributing

Contributions are welcome! Please open issues for bugs and feature requests, and submit PRs for fixes or improvements. Include a short description of what you changed and why.

---

📜 License & Contact

This repository currently does not include a license file — add a LICENSE if you want to clarify terms for contributors and enterprises.

Maintainer: @samri19-A

---

Thank you for building something that empowers local artisans — simple UX, offline resilience, and careful auditing make this a product people can trust.
