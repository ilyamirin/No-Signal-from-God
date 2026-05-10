# Project Agent Notes

## Nano Banana Sprite Backgrounds

When using Nano Banana or Nano Banana Pro for sprite generation, do not ask for a transparent background. The model does not reliably produce real alpha transparency and may render a checkerboard instead.

Ask for a solid chroma key background, then remove that background and align or normalize the sprite frames manually or with a project script.
