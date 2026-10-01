# Project Rules: Quantização da Atenção (React Mobile PWA)

## Tech Stack
- **Frontend:** React 18, TypeScript 5, Vite 6, Tailwind CSS 4, Lucide React
- **Edge AI:** MediaPipe Face Mesh (`@mediapipe/face_mesh`), Camera Utils (`@mediapipe/camera_utils`)
- **Backend/Storage:** Supabase Client (`@supabase/supabase-js`) + LocalStorage Fallback

## Commands
- Build: `npm run build`
- Dev Server: `npm run dev`
- Type Check: `npm run lint` (`tsc -b`)
- Test: `npm test`

## Code Conventions
- Mobile-first responsive views optimized for smartphones (`390x844px`).
- Functional React components with hooks.
- Strict boundary validation on untrusted user and biometrics inputs before storage.
- Uniform error handling using `APIResult<T>` and `APIError` contracts.
- Glassmorphism design system with custom CSS animations in `src/index.css`.

## Project Structure
- `src/types/`: Domain models, payload schemas, boundary validators (`validateSessionPayload`).
- `src/services/`: Storage resilience layer (Supabase + LocalStorage fallback).
- `src/hooks/`: MediaPipe face mesh tracker, EAR algorithm, gaze tracker (`useFaceTracker`).
- `src/components/`:
  - `WelcomeScreen.tsx`: Group selection & session initialization.
  - `ConditioningPhase.tsx`: Wraps `VideoFeed` (Group A) or `TextReader` (Group B).
  - `CPTTest.tsx`: Continuous Performance Test with `pointerdown` latency capture.
  - `ResultsScreen.tsx`: Participant feedback & payload payload copy.
  - `ResearcherDashboard.tsx`: A/B comparison stats, filter, search, & CSV export.

## Boundaries
- Never log or send raw video frames to external servers (privacy compliance).
- All face mesh calculations (EAR/blinks) must execute 100% locally on the device (Edge AI).
- Always ensure `npm run build` succeeds cleanly before concluding any increment.
