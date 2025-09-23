# Podcaster’s Forge

Podcaster’s Forge is an integrated suite of tools designed to give independent podcasters, musicians, and content creators the same kind of workflow efficiency that large studios enjoy—without the overhead, bloat, or steep learning curve.

Built from the ground up with creators in mind, the Forge combines multiple specialized modules under one roof, each represented as a “tool” within the metaphor of the forge: hammer, anvil, tongs, quench. Together, these tools turn raw ideas into finished, polished content that can be published and distributed with minimal clicks.

At its core, Podcaster’s Forge is about eliminating bottlenecks. Every creator knows the pain of wasted hours—formatting scripts, juggling thumbnails, struggling with uploads, or copy-pasting metadata across platforms. The Forge strips away those inefficiencies. Its browser-based architecture ensures accessibility from any device, while modular design makes it easy to grow: start with one tool, add more as your workflow demands evolve.

---

## Core Modules

- **Teleprompter Pro (Anvil)**  
  A browser-based teleprompter with advanced features like voice-activated scrolling, WPM tracking, pre-roll countdowns, LAN display mirroring, and OBS integration.

- **Uploader (Hammer)**  
  A publishing assistant that automates uploading to YouTube, Spotify, and Rumble. It auto-generates optimized titles, descriptions, hashtags, and chapters, while offering guided CTR improvements.

- **Quench & Tongs (Expansion Tools)**  
  Dedicated modules for metadata handling, analytics, and creator-focused utilities—each designed to reduce friction and improve creative flow.

---

## Why Podcaster’s Forge?

Most tools on the market are either too bloated for solo creators or too fragmented to be efficient. Podcaster’s Forge strikes the balance by focusing on creator pain points first: saving time, streamlining workflows, and ensuring that every minute spent is a minute creating—not fighting software.

The project is open, extensible, and intended to evolve with its user base. Whether you’re a podcaster recording weekly shows, a musician releasing tracks, or a video creator uploading to multiple platforms, Podcaster’s Forge provides the missing infrastructure you’ve always needed.

This is more than a toolkit—it’s a workbench for the modern creator.

---

## Repository Structure

Podcaster-s-Forge/
├── README.md
├── TESTING.md
├── CONTRIBUTOR_LICENSE_AGREEMENT.md
├── overview.md
├── uploader.md
├── expansion.md
├── legal/
│ └── README.md
├── server/ # Backend code (APIs, adapters, webhooks)
│ ├── src/
│ │ ├── adapters/
│ │ ├── routes/
│ │ └── lib/
│ └── test/
└── web/ # Frontend code (UI for modules)
├── public/
└── src/
├── components/
├── pages/
├── lib/
└── styles/

---

## 🎙️ Teleprompter Tag System (Standardized)

To keep all podcast scripts consistent and scroll-ready, every file follows this single tag system:

### Speaker Tags

- `[s1] ... [/s1]` → Joe
- `[s2] ... [/s2]` → Brad

(Always close the tag. Never add `: Name` after the tag.)

### Notes / Cues

- `[note] ... [/note]` → stage direction, tone, pacing, delivery, music cues
- Notes must be on their own line (not inside speaker tags)

### Rules

- Every spoken line starts with `[s1]` or `[s2]`
- Every note uses `[note]...[/note]` on its own line
- No duplicate or stray tags
- Keep scripts human-readable and teleprompter-friendly

---

## Legal Notices

- **Testing**: This project is proprietary. Testers are permitted to run Podcaster’s Forge for evaluation only. See [TESTING.md](TESTING.md).
- **Contributions**: Contributions are welcome, but only under the [Contributor License Agreement](CONTRIBUTOR_LICENSE_AGREEMENT.md). By submitting code, you agree that the project owner retains all commercial rights.
