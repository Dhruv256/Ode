# Template experience audit

This table mirrors `src/lib/experience.ts`. It is intentionally structural: palette, font, and template names are not used to distinguish the experiences.

| Template | Navigation | Primary signature | Secondary interactions | Transition | Finale |
| --- | --- | --- | --- | --- | --- |
| Contact Sheet | Film roll | Darkroom developing plane | Film scrub; photographer loupe | Film advance | Final frame develops: “End of roll” |
| Cut & Paste | Physical canvas | Physical paper construction | Tear reveal; peel note | Paper movement | Collage uncovers a handwritten note |
| Cover Star | Editorial spreads | Folding editorial pages | Portrait type mask; layer depth | Page fold | Back cover: “To be continued” |
| Cinema | Scene progression | Cinematic camera dolly | Scrubbed filmstrip; projector light | Film cut | Credits and a post-credit image |
| Internet Person | Desktop world | Desktop window depth | File explosion; birthday.exe | Window open | Update complete terminal state |
| Archive | Gallery rooms | Museum gallery pan | Artifact drawer; timeline lens | Drawer/catalogue | “Collection remains open” stamp |
| After Dark | Flash scenes | Flash freeze | Light trails; pulse typography | Flash cut | One final flash in darkness |
| Sunday Morning | Quiet reading | Window-light memory | Photo breathing; folded letter | Light shift | Birthday letter unfolds |
| Polaroid Wall | Spatial wall | Infinite memory wall | Pull photo; constellation | Camera pan | Pullback reveals the full wall |
| Dreamscape | Portal journey | Refractive memory portals | Floating islands; liquid distortion | Refraction | Portal contracts to a tiny image |
| Poster City | Camera street | Typographic city | Poster walls; turning billboard | Billboard turn | Aerial birthday-number view |
| Yearbook | Physical book | Page turning | Signed notes; photo pocket | Page flip | Handwritten back cover |

Automated guard: `assertUniqueSignatureEffects()` in `src/lib/experience.ts` verifies that no primary effect name is repeated.

Reduced-motion rule: every motion layer leaves its content in ordinary document or control flow; global reduced-motion CSS removes transition duration, and template components disable perspective/drag animation where interaction would otherwise be sensory-heavy.
