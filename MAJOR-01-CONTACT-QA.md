
## Preview 17: faster Deflect and supplied three-beat audio
- Arrival reduced from maximum 100 ms to maximum 45 ms (35% of remaining impact interval); hit validation and 320 ms return remain unchanged.
- User supplied Sekiro Deflect.mp3 / sekiro_deflect_2.mp3 / sekiro_deflect_3.mp3 mapped to chain beat 1/2/3, original pitch, gain 0.14 vs previous 0.32.
- Deflect event carries its own beat index, avoiding a next-attack index selecting the wrong sample.
- Preview audio buttons now audition each matching sample at gameplay gain.
- Checks: Deflect contact 10 passed; major-one final 41 passed at 30/60/120 FPS. Browser paused at first successful contact: three hearts, stamina 5/7, frame p95 16.8 ms. Screenshot test-screenshots/17-fast-deflect.jpg.
- User verification required for perceived smoothness and preferred loudness on phone; automated checks do not establish subjective audio quality.
