# Design notes

## Generative project-cover system

The full project exhibition uses a small CSS animation system implemented by `ProjectVisual` in `app/page.tsx` and the `.projectVisual` rules in `app/globals.css`.

Each cover is generated deterministically from the repository name. A character-code hash selects its hue and animation delay; its category selects the visual grammar: neural orbits, playful blobs, radar rings, interface windows, geometric toys, or oversized punctuation. The covers remain distinct without requiring 52 manually maintained images.

This system should remain available for archive cards, loading states, future repositories, and projects without an appropriate screenshot. Featured projects deliberately use authentic project imagery instead.

## Hero particle neuron

The interactive neuron in the banner is adapted from `amyleesterling/amysterling/particles.html`. It keeps the original pointer-repulsion and spring-back behavior, rebuilt as a responsive canvas with a synthetic dendritic silhouette so it stays sharp and lightweight at every size.
