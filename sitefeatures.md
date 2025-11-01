
Here’s a concise, skimmable rundown of what this app is, how it works end-to-end, what tech powers it, and where it’s useful.
what it is (at a glance)
Form Mitra Smart is a web app that helps citizens prepare government documents and fill out forms correctly the first time. It validates uploaded documents (size, brightness, resolution, etc.), gives actionable AI tips, guides users through post-submission “next steps,” and can save their info to autofill future forms. Notifications (renewals/status) can be emailed to users.
how it works (user flow)
Browse forms
On the Form Library, citizens browse Nepal-specific services (e.g., NID, Passport, Citizenship, Voter Card) with difficulty and department filters.
Upload and validate documents
On SmartSearch/Document flows, users upload each required document.
Client instantly checks file type/size/brightness/resolution/aspect ratio and shows pass/fail badges.
Optional AI checks (via a Firebase Function + Hugging Face) add extra signals (background, face detection, sharpness), with concise advice (e.g., “Use a light background,” “Retake sharper photo”).
Verify and save
A “Verify All Documents” action summarizes results.
Logged-in users can save documents to their profile to reuse later.
Autofill
In the Form Filler, the app loads saved profile data (name, DOB, contacts, etc.) and offers one-click Autofill for common fields.
Next steps and notifications
Each form shows compact “What to do next” steps (e.g., visit ward office, biometrics).
Users or admins can trigger emails like renewal reminders or status updates via a server function that uses Resend.
architecture and tech
Frontend (React 18 + TypeScript, Vite)
UI: shadcn/ui (Radix primitives), Tailwind CSS, Lucide icons, Sonner toasts
Routing: React Router
State/Data: Local state and React Query for async flows
Key components/pages:
SmartSearch.tsx: per-document file inputs, validation, AI insights, verify all, save to profile, next steps
FormFiller.tsx: loads profile and offers Autofill; hooks to email notifications
FormLibrary.tsx: search/filter of government forms (local + Firestore)
Services layer (src/services/*):
documentValidation.ts: client-side checks for brightness, resolution, dimensions, size, type
notificationService.ts: wraps callable function to send emails via Resend
userProfileService.ts: save/load profile, get autofill data
Mock/real variants for other services (form scraping, AI generators)
Firebase client init: firebase.ts
Connects to Auth/Firestore/Functions; uses local emulators when VITE_USE_FIREBASE_EMULATORS is true
Functions emulator port is configurable via VITE_FUNCTIONS_EMULATOR_PORT
Backend (Firebase Functions, Node 20 ESM)
Entry: index.js
Callables:
validateDocument: receives base64 image + doc type; calls Hugging Face models (DETR/ViT/Swin via Hugging Face Inference endpoint) to infer face/background/quality; returns structured checks, gracefully degrades if token missing
sendEmailNotification: sends renewal/status/custom emails using Resend (server-side; keeps API key secret)
Utilities/generation:
generateCheatSheet.js, generateFormAnnotations.js, generateSimplifiedForm.js
scrapeGovernmentForm.js (scraper functionality)
Admin SDK init is idempotent; Functions emulator supported
Data
Forms and metadata (departments, required docs, next steps) live locally and in Firestore where available
Nepal-focused dataset with 4 core services, each having next steps and required documents
deployment & environments
Frontend on Vercel (SPA)
vercel.json ensures the Vite dist build is served and all routes rewrite to / for client-side routing.
Set VITE_FIREBASE_* env vars in Vercel. Omit VITE_USE_FIREBASE_EMULATORS in production.
Backend on Firebase Functions
Secrets (Hugging Face token, Resend API key) live in Functions env—not in the frontend.
Local dev uses Firebase emulators by default if config is missing; Functions emulator port is configurable and documented.
security and privacy posture
No server secrets in the browser; all sensitive calls go through Firebase Functions.
Client-side checks are a convenience layer; authoritative checks can run server-side via Hugging Face in Functions.
Firestore security depends on your deployed rules (firestore.rules); Auth-gated persistence handles user profile data.
primary use cases
Citizens and local assistance centers (e.g., ward offices, cyber cafes) preparing:
National ID, Passport, Citizenship, Voter Card
Reducing form rejection rates:
Catch common pitfalls early (dark background, low brightness, wrong aspect ratio, poor resolution)
Speeding up repeat submissions:
Save profile once, Autofill common fields across forms
Proactive follow-ups:
Email notifications for renewals and status changes using the Resend powered server function
Admin/ops:
Use scraping and generation utilities to expand/refresh form libraries, annotations, and simplified versions
why it matters
Practical: Saves time and trips by catching issues before official submission.
Inclusive: Offers clear, action-oriented feedback for document quality in plain language.
Extensible: Mock/real services pattern enables swapping data sources and AI logic without large refactors.
Deployable: Vercel-ready SPA with Firebase backend; emulators make local work straightforward.