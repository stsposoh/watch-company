# VEYRA: design rules

Landing page for a fictional watch manufacture. What to build is in `BRIEF.md`; this file is how to build it. Where the two conflict, `BRIEF.md` wins.

The goal: a showcase page that looks like it was made by a strong human designer, not by AI. It must have its own character. A site that is "just neat" is a failure.

## Process (mandatory, do not skip steps)

1. **Brief.** Done: see `BRIEF.md`.
2. **Concept before code.** Done: the concept in `BRIEF.md` is approved.
3. **Build** according to the approved concept.
4. **Visual check with Playwright.** Screenshots at 1728×1117 (the target screen), plus several scroll positions.
   Critically assess: rhythm, alignment, heading line breaks, contrast, "AI-ness". Fix. At least 2 rounds.
5. **Polish:** micro-interactions, hover states, focus, `prefers-reduced-motion`, load speed.

## Forbidden (typical signs of AI design)

- Purple-blue / pink-purple gradients, neon glow, blurred blobs in the background.
- Glassmorphism cards, identical `rounded-2xl` + `shadow-lg` on everything.
- Default fonts: Inter, Roboto, Arial, system-ui, Poppins, Montserrat, Space Grotesk.
- The hero template: "✨ New" badge → centered heading → subheading → two buttons.
- A grid of "3 cards with an icon, a heading and two lines of text".
- Emoji instead of icons; random Lucide icons "for decoration".
- Everything center-aligned; identical spacing between all sections.
- "Fade-up every element on scroll" as the only animation technique.
- Empty marketing phrases: "Unlock", "Elevate", "Seamless", "Boost your…", "Revolutionize".
- Lorem ipsum and fake "Trusted by" logos.

## What to do instead

**Typography is the main tool.**
- Strong size contrast (headings of 8–15vw are fine), an expressive display font + a calm text font.
- Work with letter-spacing, line-height, `text-wrap: balance`, hanging punctuation, hyphenation.

**Composition.**
- Asymmetry, bold crops, overlaps, elements breaking out of the grid.
- Alternate dense and airy sections; vary the rhythm.
- Editorial devices where they carry information: captions, thin rules, small utility text.

**Color and texture.**
- One dominant color + a sharp accent. Neutrals with temperature, not pure #fff/#000.
- Texture: grain, photos with character, real materials.

**Content.** Use the copy from `BRIEF.md` as written.

## Motion

- Stack: **GSAP + ScrollTrigger**, **Lenis** (smooth scroll), SplitText/split-type for text.
- 1–2 well-thought-out scenes are better than animating everything.
- Custom easing (`expo.out`, `power4.inOut`), meaningful choreography with delays.
- Always respect `prefers-reduced-motion`.
- Before using GSAP, ScrollTrigger, Lenis and other libraries, check the current API and installation method via the **ref** MCP (or **context7**), not from memory. This especially applies to GSAP plugins, imports and breaking changes between versions.
- First describe the scene in words (what moves, in what order, what it should feel like), then write the code. Afterwards, check it in Playwright frame by frame while scrolling.

## Technical rules

- Vite + plain HTML/CSS/JS.
- CSS variables for tokens (colors, fonts, spacing).
- Semantic markup, alt texts, visible focus, AA contrast.
- Fonts: `font-display: swap`, preload the key ones; images in AVIF/WebP, lazy-loaded.
- Include CSS via `<link>` in `<head>`, not by importing it from JS: otherwise the page flashes unstyled on load.
