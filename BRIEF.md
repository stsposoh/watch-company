# Brief: VEYRA landing page

Status: ready to build (2026-10-26). The concept, copy and all assets are approved; the design rules and the working process are in `README.md`. Start with the Anatomy section; build sections 2–5 after it, on command.

## Project

- A showcase landing page for VEYRA, a fictional premium watch manufacture: hand-assembled, small-batch, expensive. The page exists only to present design and engineering skills; nothing is sold.
- Style: elegant and contemporary. The palette is dark, matching the video.
- Desktop only. Target screen: MacBook Pro 16" (1728×1117 CSS px at default scaling, DPR 2). There are no tablet or mobile layouts and no responsive work. Check screenshots at 1728×1117.
- Site copy is in English. Use the copy given in this brief as written; do not invent or rewrite it. Any new copy needs approval.
- Brand thesis: "Nothing hidden." The watch is taken apart in front of the viewer: the scroll is the watchmaker's hands, and the story follows the path of energy (spring → wheels → escapement → balance → ruby). The site then puts the watch back together.
- The one main action on the page: request a viewing.
- Stack: Vite + vanilla JS/TS, GSAP + ScrollTrigger, Lenis. No React or Tailwind unless they are truly needed.
- Follow `README.md` (design rules) and the `frontend-design` skill. Where they conflict with this brief, the brief wins.

## Brand facts (fictional, used everywhere, do not change)

- Calibre V1: 214 parts, 27 rubies, 28,800 vibrations per hour (8 beats per second, 691,200 a day), 70-hour power reserve.
- Case: 40 mm, 9.8 mm thick, steel, sapphire crystal.
- Hand assembly: 3 weeks, one watchmaker per watch.
- Workshop: Le Sentier, Vallée de Joux. Watchmaker: Anouk Ferrand; her initials "A.F." are engraved under the balance of every watch she assembles.

## Design system (shared by all sections)

**Palette.** Taken from the video. The warm black dominates; brass is the only accent in the interface.

| Token | Hex | Use |
|---|---|---|
| bench | `#0E0C0A` | Page background, dominant |
| graphite | `#1C1A17` | Raised surfaces, form fields, bands |
| steel | `#D9D4CA` | Main text |
| ash | `#8C857A` | Secondary text, captions |
| brass | `#B8925A` | Callout lines, the button, focus rings |
| ruby | `#B3123A` | Only the ruby and the pulse dot: it means "the mechanism beats here" |

Check AA contrast for every text pair; `ash` on `bench` is for captions only.

**Type.**
- Display: Sentient (Fontshare). Its sharp serifs echo the polished bevels on the bridges. Headlines, the manifesto, model names.
- Text: Switzer (Fontshare). A Swiss grotesk, like the printing on a dial. Body copy, form, buttons.
- Mono: Fragment Mono (Google Fonts). Numbers, specs, station labels, the counters.
- Large size contrast: the manifesto and Anatomy headlines can be very large; body text stays calm.

**Callouts.** Thin brass SVG lines drawn with `stroke-dashoffset`, ending on a small ring at the part, in the manner of a technical drawing. The same callout style is reused outside Anatomy (the manifesto underline, the signature).

**Texture.** A fine, static film grain over the whole page. It ties the video, the photos and the interface together and hides the video's softness.

**Header.** Only "VEYRA" on the left and a "Request a viewing" link on the right that scrolls to the form. Hidden inside Anatomy; it appears once Anatomy unpins.

**Loading.** The first video frame shows at once. While the MP4 loads, a thin brass line runs along the edge of the screen like a seconds hand; it disappears when scrubbing is ready.

**Motion.** Lenis smooth scroll across the whole site, synced with ScrollTrigger. Anatomy is the one big scene; every other section has one idea and stays quiet. No generic fade-up on every element. Every scroll animation reverses on the way back up. With `prefers-reduced-motion`: no Lenis, no scrubbing (Anatomy becomes a sequence of station stills with their text), counters show final values, reveals are instant.

## Page structure (top to bottom)

Rhythm: Anatomy takes more than half of the page, so every section after it is quieter and shorter. Only Anatomy is pinned.

### 1. Anatomy

The pinned scroll-video scene; see the full spec below. Its first station is the hero; there is no separate hero.

### 2. Manifesto

- A dark screen without video, one screen tall, not pinned.
- Copy: "Most watches ask you to trust them. This one lets you check."
- Set very large in Sentient. The first sentence sits in `ash`. The second sentence opens line by line through masks, scrubbed by scroll (not by time), in `steel`.
- Under the word "check", a brass callout line draws itself as the reveal finishes.

### 3. The Watchmaker

- Photos: `watchmaker-hands`, `bench`, `signature`.
- Copy:
  - Headline: "One watch, one pair of hands."
  - Lead: "Anouk Ferrand assembles every V1 she signs. Three weeks, from loose parts to a running watch, at one bench in Le Sentier."
  - Week one, Finishing: "Every bridge is bevelled and polished by hand, including the edges no one is meant to see."
  - Week two, Assembly: "214 parts, fitted and oiled in order. The barrel goes in first."
  - Week three, Regulation: "Timed in six positions over five days, then cased."
  - Signature: "Her initials sit under the balance. You can check."
- The hands photo opens with a shutter-like mask from left to right, as if a workshop shutter were lifted.
- The three weeks are an arc of 21 ticks, like the minute track of a dial, one tick per day. The ticks fill in on scroll; the three stages are labelled along their seven-tick stretches. Numbering is fine here because it is a real sequence.
- It ends on the `signature` photo: a brass callout draws to the engraved initials, with the signature line as its caption.

### 4. Collection: reassembled

- Opens with `collection-lineup` (the three models together) with a slow parallax.
- Then one assembled watch, large, with a switcher Ash / Ink / Bone. The dial changes as a crossfade in place (`dial-ash`, `dial-ink`, `dial-bone` share identical framing). The model name and its line change through a mask.
  - V1 Ash, slate-grey dial: "Grey as the bench it was built on."
  - V1 Ink, black dial: "The quietest of the three."
  - V1 Bone, cream dial: "Warm, like an old enamel dial."
- A "Turn over" control shows `caseback` (the same V1 calibre through the sapphire). It opens with a circular mask growing from the crown, like opening a caseback. Not a fake 3D flip of a flat photo.
- The switcher is a real radio group: keyboard accessible, with visible focus.
- No prices. Not a horizontal scroll, not a grid of cards.

### 5. CTA and footer

- Background: `atelier-piece`, a gem-set V1 on a stand beside an open walnut box. The headline and form sit in the empty left half.
- Caption by the watch: "Atelier piece. Shown only in person."
- Headline: "See it in person." Button: "Request a viewing", in brass, with a subtle magnetic pull.
- Form: name, email, city. No real submission, only validation and a success state. The success message names the city from the form: "We'll write to you about a viewing in {city}." (for example, "…in Lyon.").
- Footer: brand, "A fictional manufacture. Demo site.", the year, and a live counter "Since you arrived, a V1 has beaten 4,312 times." that grows at 8 beats per second from page load.

## Visual language (from the video and stills)

- The scene is a watchmaker's bench in low, warm side light: near-black leather or felt, a soft amber glow in the top-left corner, deep shadows, shallow depth of field.
- Materials carry the colour: brushed and polished steel, gilt brass wheels, heat-blued screws, pink-red rubies.
- The camera keeps one half of the frame dark and empty. That empty half is where the text goes.

## Signature section: "Anatomy" (scroll-driven video)

### Video

- Web file: `assets/video/anatomy.mp4`. 1920×1080, 24 fps, 42.5 s, 1020 frames, no sound, H.264 with a keyframe every 12 frames and no B-frames for scrubbing, 14 MB. Read the duration from the file's metadata; do not hard-code it.
- First frame for the instant first screen: `assets/video/anatomy-poster.avif` (65 KB) with `anatomy-poster.webp` as a fallback. Show it immediately with the hero text, fetch the whole MP4 as a blob in the background, and enable scrubbing only once it has loaded, so seeks never wait on the network.
- Last frame at full resolution for placing the knolling hotspots: `assets/video/knolling-last.png`.
- Source clips `1.mp4`–`6.mp4` (8 s each) and the high-quality master `build/master-v1.mp4` stay in the folder for re-encoding. How the master was stitched: clip 3 is trimmed to 4.75 s (it ended with a hard cut that repeated clip 4's push-in), and the joins are crossfades: 1→2 0.25 s, the others 0.5 s. Joins 2→3, 4→5 and 5→6 did not match in framing, so they read as soft dissolves rather than one continuous camera move.
- "Stations" are compositions that leave an empty dark area for text. The camera is almost still around each one, but those still windows are short and asymmetric, so every station has its own hold window in video time (measured from the frame-to-frame motion of the master).
- Build a debug mode (`?debug` in the URL) that shows the current video time and frame, the scroll progress, and the station windows. It is used to tune the station timings against the real video.

### Structure

- One pinned scene. The video fills the screen (`object-fit: cover`) and an HTML layer sits on top of it. The total scroll length is about 1000–1100vh and must be configurable.
- Scroll is not mapped linearly to the video. Build the mapping from the station config: a table of "scroll progress → video time" with smooth, monotonic interpolation and no jerks.
  - Transitions between stations (from one station's hold end to the next station's hold start): about 60vh of scroll each.
  - Hold at a station (its hold window, below): about 110vh of scroll. The video barely moves here, so add a slight scale of the video, 1.00 → 1.04, plus a small GSAP drift so the frame does not look frozen.
- Smooth the scroll-to-time value (lerp) and seek at most once per animation frame.

### Station config

Timings are measured from `anatomy.mp4` (seconds of video time). They must be easy to edit in one place; fine-tune them in debug mode.

| Station time | Hold window | Station |
|---|---|---|
| 0.0 | 0.0–1.2 | Hero |
| 8.2 | 7.0–9.3 | 01 Case |
| 16.3 | 15.75–16.9 | 02 Barrel |
| 20.3 | 20.0–21.0 | 03 Gear train (the camera keeps a slow push-in here) |
| 26.7 | 26.4–26.95 | 04 Escapement (a short still window; hold it with a slow mapping; the dissolve to clip 5 starts at 27.0) |
| 34.0 | 33.6–34.45 | 05 Jewel (the dissolve to clip 6 starts at 34.5; keep the hold before it) |
| 42.5 | 41.6–42.5 | 06 Knolling (the last frame) |

Composition and copy per station:

| Station time | Station | Composition | Text position | Text and elements |
|---|---|---|---|---|
| 0.0 | Hero | Watch on the right, empty on the left | Left | Brand "VEYRA" (small, mono). Headline "Time, taken apart." Caption "Calibre V1. 214 parts, laid bare." A scroll hint. |
| 8.2 | 01 Case | Watch on the right, empty on the left | Left | Label "01 / Case". Headline "Steel, sapphire, nothing to hide." Three spec lines: 40 mm · 9.8 mm · sapphire crystal. |
| 16.3 | 02 Barrel | Mainspring barrel left of centre, small parts at the top right and along the left; the middle right is empty | Right | Label "02 / Barrel". Headline "70 hours, coiled." Caption "A spring 32 cm long, wound into 11 mm." A counter 0 → 70 h, scrubbed by scroll progress, not by time. |
| 20.3 | 03 Gear train | Watch on the right, empty on the left | Left | Label "03 / Gear train". Headline "One slow release of energy, turned into steady time." A small SVG diagram of the wheel train whose line draws on scroll. |
| 26.7 | 04 Escapement and balance | Mechanism on the left, empty on the right | Top right | Label "04 / Escapement". Headline "8 beats every second." Caption "691,200 a day." A beat counter and a small red pulse dot (see the safety note below). |
| 34.0 | 05 Jewel | Ruby on the left, empty on the right | Bottom right | Label "05 / Jewels". Headline "27 rubies, where steel would meet steel." |
| 42.5 | 06 Knolling | Top-down view of all the parts; the whole frame is used | In a dark band below the frame, not over it | Caption "214 parts. Every one accounted for." Then the section unpins. Hotspots on about 7 parts (see below). |

### Knolling hotspots

- Parts: case, caseback, crystal, barrel with mainspring, a wheel, the hairspring, screws.
- Take the coordinates from `knolling-last.png`. Store them in video-frame coordinates.
- The frame has no clear barrel with its mainspring; there is a loose hairspring (right of centre) and a balance wheel. Use the large gilt wheel at the far left of the fourth row as the barrel, or replace the barrel hotspot with the balance or the escape wheel.
- Style the labels as technical-drawing callouts with short captions.
- A magnifier cursor will be added later. Do not build it now.

### Text animation

- Entrance: headlines line by line through masks (SplitText or clip). Mono labels and spec lines shift 8–12px and fade in. Text enters at the start of a hold window and leaves before the next transition begins.
- Callouts: a thin SVG line from the part to the text, drawn with `stroke-dashoffset`. The line's end is anchored to the part in video-frame coordinates, accounting for the cover crop, and scales together with the video's scale so it never drifts off the part.
- Progress indicator: a vertical scale 01–06 at the side with the active station marked. The progress pointer works like a seconds hand.
- Every entrance must reverse when scrolling back up.

## Assets

### Photos

Originals (JPEG) are in `assets/photos/`; web versions are in `assets/photos/web/` as `<name>-2400` and `<name>-1440`, each in AVIF and WebP (31–260 KB). Use `<picture>` with `srcset`, AVIF first, and lazy-load everything below the first screen.

| Name | Size, ratio | What it shows | Section |
|---|---|---|---|
| `collection-lineup` | 2752×1536, 16:9 | Ash, Ink and Bone side by side on a diagonal, high angle; tools at the edges, the right side dark | Collection, opening |
| `dial-ink`, `dial-ash`, `dial-bone` | 2400×1792, 4:3 landscape | Each model from directly above, centred, hands at 10:09; identical framing across the three | Collection, dial switcher |
| `caseback` | 2400×1792, 4:3 landscape | The same watch turned over, same framing: the movement through the sapphire, crown on the left | Collection, "Turn over" |
| `watchmaker-hands` | 2752×1536, 16:9 | Hands placing a wheel with tweezers, a loupe and a screwdriver; dark wooden bench; the left quarter is dark. A sliver of the face shows in the top right corner, so crop the top edge slightly | The Watchmaker |
| `bench` | 2752×1536, 16:9 | An open watch on a movement holder with tools, caseback and crystal; wide empty dark area on the left | The Watchmaker |
| `signature` | 2752×1536, 16:9 | Macro of a bridge engraved "A.F", a ruby on the left, a blued screw on the right | The Watchmaker, ending |
| `atelier-piece` | 2752×1536, 16:9 | Gem-set V1 with a cream dial on a black cushion, an open walnut box behind; the left half is dark and empty | CTA background |

### Not used on the page

- `assets/frames/`: stills generated before the video. They set the mood but repeat what the video already shows, so they are not used (the bench still is copied to `assets/photos/bench.jpg`).
- `PHOTO-PROMPTS.md`: the prompts the photos were generated from.

## Technical notes and risks

- **Cover crop on 16".** The screen is 1.55:1 and the video is 1.78:1, so `cover` cuts about 130px from each side. That is fine for stations 0–05, but in the knolling frame it would cut the outer columns of screws. Use `contain` for the knolling station: at 1728px wide the frame is 972px tall, which leaves about 145px for the dark text band. Animate the change from cover to contain on the way into station 06.
- **Pulse dot safety.** A visible flash at 8 Hz falls in the range that can trigger photosensitive seizures (WCAG 2.3.1 allows no more than 3 flashes per second). Show the 8 beats per second in the counter. Keep the dot itself as a soft, low-contrast pulse no faster than about 2 Hz, or as a steady glow. With `prefers-reduced-motion`, the dot does not pulse at all.
- **Video for scrubbing.** Decided: one MP4 scrubbed through `video.currentTime`, not an image sequence. Measured: an AVIF sequence of all 1020 frames is about 49 MB (WebP 57 MB), and holding that many decoded 1080p frames costs gigabytes of memory. An all-keyframe MP4 is 51 MB; the chosen MP4 (keyframe every 12 frames, CRF 27) is 14 MB and at 1:1 is visually indistinguishable from the master (SSIM 0.988).
- **Resolution.** A full-width image on a 16" screen is 3456 physical px wide; the 2400px photo versions are close enough. The video is 1080p and slightly softer; the grain overlay hides it.
- **Conflicts with the frontend-design skill.** The skill flags mono for small data labels and specs joined with middle dots ("40 mm · 9.8 mm") as signs of generated design. The brief asks for both, so the brief wins. Section numbers 01–06 are fine because the stations really are a sequence.
