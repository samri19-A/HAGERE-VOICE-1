# HAGERE VOICE

Offline-first Amharic voice assistant for women artisans to manage inventory.

## MVP demo flow (for judges)

1. User taps **ድምጽ ተናገር** and says an Amharic command, e.g. `ሱሪ ሁለት ጨመር`
2. Browser speech-to-text captures the transcript
3. `amharicParser.js` extracts action (`ጨመር`), item (`ሱሪ`), quantity (`2`)
4. `apply_voice_command` RPC updates `inventory_items.quantity` and logs to `voice_commands`
5. UI shows before → after quantity change in real time

## Quick start

```bash
npm install
cp .env.example .env   # add Supabase URL + anon key
npm run dev
```

Without Supabase, the app runs in **local demo mode** (localStorage) so you can test the voice flow immediately.

## Supabase setup (required for live demo link)

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `supabase/migrations/001_inventory.sql`
3. Enable **Realtime** for `inventory_items` and `voice_commands` (Database → Replication)
4. Copy project URL and anon key into `.env`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

5. Deploy frontend to Vercel/Netlify and share the URL

## Project structure

```
src/
├── lib/
│   ├── amharicParser.js    # Voice transcript → { action, itemName, quantity }
│   ├── inventoryService.js # Supabase RPC + offline queue
│   ├── offlineQueue.js     # localStorage queue when offline
│   └── supabase.js         # Client config
├── hooks/
│   ├── useVoiceCommand.js  # Web Speech API (am-ET)
│   └── useInventory.js     # Fetch + realtime + apply commands
└── components/
    ├── VoiceButton.jsx
    ├── ManualCommandInput.jsx  # Fallback for demo reliability
    ├── InventoryList.jsx
    └── CommandLog.jsx          # Shows quantity_before → quantity_after
```

## Supported Amharic commands

| Command | Meaning |
|---------|---------|
| `ሱሪ ሁለት ጨመር` | Add 2 dresses |
| `ቀሚስ አንድ ቀንስ` | Subtract 1 shirt |
| `ሻማ አምስት ጨመር` | Add 5 scarves |

**Add keywords:** ጨመር, ጨምር, አክል  
**Subtract keywords:** ቀንስ, ቀንሳ, አውርድ  
**Numbers:** አንድ(1) … አስር(10), or digits `5`, `12`

## Database tables

- `inventory_items` — current stock per item
- `voice_commands` — audit log with `quantity_before` / `quantity_after` for demo proof

## Demo tips (June 14)

- Use **Chrome** on desktop for best `am-ET` speech recognition
- Keep **Manual command input** as backup if mic quality is poor
- Show Supabase **Table Editor** side-by-side: speak → row updates live
- Record a 30s screen capture: voice → parser → DB → UI refresh

## Deploy

```bash
npm run build
# Upload dist/ to Vercel, or: npx vercel
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your host.
