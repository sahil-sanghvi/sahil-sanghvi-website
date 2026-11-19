# Adding travel photos

Your travel photos live on two pages:

- **`/travel`**: the map, the list of places, and every place's photos. This is the page search engines index.
- **`/travel/trail`**: the game version. Places unlock one at a time and the map flies between them.

Each place also gets its own page at `/travel/<place>` (for example `/travel/moraine-lake`), so it can show up in search on its own.

The Travel links (top bar, home page menu, README button) stay hidden until at least one place is published. They appear on their own after your first push with photos.

You add photos with a small editor that runs on your own computer. It saves the photos into the project, and when you push to `main`, Vercel redeploys the site with them.

---

## One-time setup

You need [Node.js](https://nodejs.org) 20 or newer, and the repo cloned on your computer.

```bash
git clone https://github.com/sahil-sanghvi/sahil-sanghvi-website.git
```

```bash
cd sahil-sanghvi-website
```

```bash
npm install
```

If you already have the repo, just get the latest `main`:

```bash
git checkout main
```

```bash
git pull
```

---

## Adding photos

### 1. Start the editor

```bash
npm run travel
```

Open **http://localhost:5174** in Chrome or Safari. Leave the terminal running while you work. Everything saves automatically as you type.

### 2. Drop in your photos

Drag photos onto the **Drop photos here** box (or click it to pick files). For each photo the editor:

- shrinks it to 1600px wide, so the site stays fast,
- reads **where** it was taken (GPS) and drops a pin there,
- reads **when** it was taken and fills in the date,
- groups photos taken close together (within about 5 km, or on the same day if there's no GPS) into **one place**,
- looks up the place name and region from the pin when the photo has GPS.

Two things to know:

- **iPhone HEIC photos**: Chrome can't read them. Either use Safari, or export them as JPEG first (Photos app: File → Export → JPEG).
- **No GPS?** That happens with screenshots, WhatsApp photos, and some cameras. Search for the place in the box on the map, or click the map, to pin it by hand.

### 3. Fill in each place

Click a place in the list on the left, then fill in:

| Field | What to write | Example |
|---|---|---|
| **Place name** | The specific spot | Moraine Lake |
| **Region** | City, province/state, country | Banff, Alberta, Canada |
| **Caption** | One short line, shown big | Ten peaks, one very cold lake |
| **Story** | A few sentences (optional) | Up at 4am to beat the shuttle crowds. Worth it. |
| **When** | Year and month | 2025-07 |
| **Page URL** | Leave blank; it's made from the place name | moraine-lake |

**Describe this photo** (under the photo strip) is optional alt text for that one photo, for example *"hiking the Plain of Six Glaciers trail"*. If you leave it blank, the site writes one for you, like *"Sahil Sanghvi at Moraine Lake, Banff, Alberta, Canada: Ten peaks, one very cold lake"*. Your name is always included, which is what helps the photos come up when someone searches "Sahil Sanghvi".

Avoid em dashes (—) in captions and stories. The site turns them into commas in titles and descriptions anyway.

Each place in the list shows red tags for anything missing. **A place only goes on the site once it has a name, a pin, and at least one photo.** Everything else is optional but makes the page better.

### 4. Put the places in order

The order of the list is the order on the map: the numbers on the pins, the dashed route, and the order of the trail game.

- **Drag** places in the list to reorder them, or click **Sort by date taken**.
- **Merge into previous place** joins two places that should be one (their photos go into the place above).
- In the photo strip, **◀ Move / Move ▶** changes photo order. The **first photo is the cover**, used for link previews.
- **Remove this one** deletes a photo; **Delete place** (click twice) deletes a whole place and its photos.

### 5. Tidy the file names

Click **Tidy file names** (top right). It renames every photo from `IMG_4821.jpg` to `sahil-sanghvi-moraine-lake-1.jpg`. Google Images uses file names as a clue to what a photo shows, so do this every time before you commit.

### 6. Preview (optional)

In a second terminal, start the site:

```bash
npm run dev
```

Then click **Preview /travel ↗** in the editor, or open http://localhost:3000/travel and http://localhost:3000/travel/trail.

In the trail, add `?unlock` to the URL to open every place at once, or `?reset` to start over from stop 1.

### 7. Publish

Stop the editor (Ctrl+C), then commit the photos and the place list:

```bash
git add public/travel lib/content/static/travel.json
```

```bash
git commit -m "Add travel photos"
```

```bash
git push origin main
```

Vercel rebuilds the site in a minute or two and the photos go live.

---

## After your first upload: help Google find the photos

The site already does the technical work. Every photo has your name in its alt text and file name, each place has its own page, and every photo is listed in the image sitemap (`/sitemap.xml`) and credited to you in the page's structured data.

Google still has to crawl it, and that can take days to weeks. To speed it up:

1. Go to [Google Search Console](https://search.google.com/search-console) and add your site (the **URL prefix** option, with your Vercel or custom domain).
2. Verify it. The **HTML tag** method is easiest: send me the tag and I'll add it to the site.
3. Open **Sitemaps** and submit `sitemap.xml`.
4. Optional: use **URL Inspection** on `/travel` and click **Request indexing**.

Use the same photos and your full name in places that link back to the site (LinkedIn, GitHub profile). That helps Google connect "Sahil Sanghvi" with this site.

---

## Editing later

Run `npm run travel` again whenever you want to add a trip, fix a caption, or reorder places. Then repeat steps 5 and 7 (tidy, commit, push).

## Where things live

| What | Where |
|---|---|
| Place list (names, captions, pins, photo order) | `lib/content/static/travel.json` |
| Photo files | `public/travel/` |
| The editor (local only, never deployed) | `scripts/travel-editor/` |
| Travel page / place pages / trail game | `app/(site)/travel/` |

## Troubleshooting

- **"Could not load places"** in the editor: the editor server isn't running. Run `npm run travel` again.
- **Port already in use**: something else is on 5174. Run `PORT=5175 npm run travel` and open http://localhost:5175.
- **A place doesn't show on the site**: it's missing a name, a pin, or a photo. The editor's red tags show which.
- **"Tidy file names" failed**: a file with the target name already exists in `public/travel/` but isn't in the list. Delete or rename that stray file, then try again.
- **Map search or "Name + region from pin" doesn't work**: these use OpenStreetMap's free search, which needs internet and allows about one lookup per second. Wait a moment and retry.
