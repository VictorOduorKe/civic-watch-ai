# Open Civic Lab (OCL) — Brand Color & Visual Identity System

## 1. Brand Identity Overview

CivicWatch AI Kenya is an independent civic technology initiative developed under **Open Civic Lab (OCL)** (*"Innovating Technology for Better Governance. KENYA"*).

The visual identity is derived directly from the official Open Civic Lab emblem ([`frontend/src/assets/logo.jpg`](file:///home/alpha/projects/civic-watch-ai/frontend/src/assets/logo.jpg)):
* **Open Civic Lab Navy Blue (`#0B2545`)**: Symbolizes trust, technological precision, transparency, and public institutional integrity.
* **Warm Ochre Gold (`#D49B24`)**: Symbolizes civic empowerment, citizen engagement, community light, and democratic action.
* **Kenyan Flag Trim**:
  * **Kenyan Red (`#C8102E`)**: Life-saving urgency, emergency notices, and high-visibility hazards.
  * **Kenyan Green (`#007A3D`)**: Verified statuses, resolved reports, and positive civic outcomes.
  * **Kenyan Black (`#111827`)**: Structural contrast, headings, and high-legibility typography.
  * **White (`#FFFFFF`)**: Clean spatial breathing room, cards, and modal backdrops.

---

## 2. Palette Specification

### Open Civic Lab Navy (`navy`)

| Shade | HEX Code | Tailwind Class | Semantic Usage |
|---|---|---|---|
| `navy-50` | `#F0F4F8` | `bg-navy-50` / `text-navy-50` | Subtle active item backgrounds, light panels |
| `navy-100` | `#D9E2EC` | `bg-navy-100` / `border-navy-100` | Light dividers, badge backgrounds |
| `navy-200` | `#BCCCDC` | `border-navy-200` | Subtle borders, light chip borders |
| `navy-500` | `#334E68` | `text-navy-500` | Secondary icons, muted brand elements |
| `navy-700` | `#1A365D` | `bg-navy-700` | Interactive hover states, secondary navigation |
| `navy-800` | `#102A4C` | `bg-navy-800` | Ring focus outlines, deep card accents |
| `navy-900` | `#0B2545` | `bg-navy-900` / `text-navy-900` | **Primary Brand Color**: Headers, primary CTAs, main logo fill |
| `navy-950` | `#061528` | `bg-navy-950` | Button active/hover states, deep footers, sidebar dark zones |

### Open Civic Lab Ochre Gold (`gold`)

| Shade | HEX Code | Tailwind Class | Semantic Usage |
|---|---|---|---|
| `gold-50` | `#FFFDF5` | `bg-gold-50` | Light highlight banners, informational tips |
| `gold-100` | `#FEF7DA` | `bg-gold-100` | Badge containers, advisory containers |
| `gold-200` | `#FCE8AC` | `border-gold-200` | Highlight borders, subtle card outlines |
| `gold-400` | `#E6AF3D` | `text-gold-400` | Star ratings, interactive hover states |
| `gold-500` | `#D49B24` | `bg-gold-500` / `text-gold-500` | **Primary Brand Accent**: Secondary CTAs, badges, ring accents |
| `gold-600` | `#B88218` | `bg-gold-600` / `text-gold-600` | Hover states for gold buttons, accessible text on light backgrounds |
| `gold-700` | `#926310` | `text-gold-700` | High-contrast text on gold-100 badges |

### National Kenyan Flag Accents (`kenya`)

| Color | HEX Code | Tailwind Class | Usage |
|---|---|---|---|
| Kenyan Red | `#C8102E` | `bg-kenya-red` / `text-kenya-red` | 999/112 emergency banners, urgent hazard warnings, destructive actions |
| Kenyan Green | `#007A3D` | `bg-kenya-green` / `text-kenya-green` | "Resolved" status indicators, verified checkmarks, active accounts |
| Neutral Black | `#111827` | `text-neutral-900` | Primary headlines and high-contrast body text |
| Pure White | `#FFFFFF` | `bg-white` / `text-white` | Surfaces, card backgrounds, elevated dialogs |

---

## 3. Component Color Rules

1. **Primary Buttons & CTAs**:
   - `bg-navy-900 hover:bg-navy-950 text-white font-semibold transition-colors shadow-xs`
   - Active / Focus ring: `focus:ring-2 focus:ring-navy-800 focus:outline-none`
2. **Secondary / Highlight Buttons**:
   - `bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold transition-colors shadow-xs`
   - Accent button: `border border-gold-500 text-navy-900 hover:bg-gold-50`
3. **Form Input Focus States**:
   - `focus:ring-2 focus:ring-navy-800 focus:border-transparent`
4. **Brand Badges**:
   - OCL Badge: `bg-navy-50 text-navy-900 border border-navy-200`
   - Community Badge: `bg-gold-100 text-gold-800 border border-gold-300`
   - County Location Badge: `bg-navy-100 text-navy-900 border border-navy-200`
5. **Brand Logo Usage**:
   - Display [`logo.jpg`](file:///home/alpha/projects/civic-watch-ai/frontend/src/assets/logo.jpg) as circular emblem with subtle gold border in Navbar, Sidebar, and Auth headers.
