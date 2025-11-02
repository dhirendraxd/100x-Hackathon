# Form Mitra Smart 

Government document validation and form-filling application helping citizens get their paperwork right the first time.

• Built at the 100x Hackathon by team Control BIts

• Live Demo: https://100x-hackathon.vercel.app/

## 🚀 Features

- AI Document Validation: Upload government documents and verify they meet official requirements using AI-powered checks
- Smart Form Filling with Hints: Concise, context-aware tips per field to reduce mistakes
- Next Steps: Shows what to do after filling, tailored to the selected service (e.g., NID, Passport)
- Document Quality Precheck: Brightness, resolution, and type checks before uploading
- Profile-aware: Logged-in users won’t be prompted for documents they’ve already uploaded
- Progress Saving: Save your draft and resume later (Dashboard → Pending)
- Submissions Dashboard: Track submitted forms and download generated summaries
- Email Notifications: Optional status and renewal reminders via Firebase Functions + Resend
- Demo Mode: Explore without logging in; drafts and submissions are stored locally

## 🛠️ Tech Stack

- Frontend: React 18 + TypeScript
- Build Tool: Vite 5
- UI Components: shadcn/ui (Radix UI primitives)
- Styling: Tailwind CSS
- Backend: Firebase (Auth, Firestore, Cloud Functions)
- AI: Hugging Face models for document validation (called from Firebase Functions)
- State Management: React Query + localStorage



## 📦 Installation

The only requirement is having Node.js & npm installed - install with nvm if needed.

### Setup Steps

1. Clone the repository

   ```bash
   git clone https://github.com/dhirendraxd/100x-Hackathon.git
   cd 100x-Hackathon
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Configure environment variables (create `.env`)

   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   # Optional for local emulators
   VITE_USE_FIREBASE_EMULATORS="true"
   ```

   For the AI callable function, set your Hugging Face token as a Functions secret in production. For local development, export `HUGGING_FACE_ACCESS_TOKEN` in your shell (do not commit it).

4. Start the development server

   ```bash
   npm run dev
   ```

The app will be available at <http://localhost:8080>

## 🧪 Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run build:dev   # Build in development mode
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## 🗂️ Project Structure

```txt
100x-Hackathon/
├── src/
│   ├── pages/              # Route components
│   ├── components/         # Reusable components (shadcn/ui in components/ui)
│   ├── integrations/       # External service clients
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utility functions
├── public/                 # Static assets
└── .github/
 └── copilot-instructions.md  # AI coding guidelines
```

## 🔧 Configuration

### Adding shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

## 🎨 Design System

- Theme: Dark mode with green accent
- Primary Color: hsl(160, 84%, 39%)
- Custom Gradients: gradient-dark, gradient-primary, gradient-success
- Animations: animate-fade-in, custom transitions

## 📝 AI Document Validation

The app validates documents using Hugging Face AI models orchestrated by a Firebase Callable Function:

1. User uploads file in DocumentChecker.tsx
2. File converted to base64
3. Frontend calls a Firebase Callable Function (e.g., `validateDocument`) with `{ imageBase64, documentType }`
4. Function calls appropriate Hugging Face models (DETR for face detection, etc.)
5. Returns an array of checks: `{ check: string, passed: boolean, message: string }[]`

Supported document types:

- Passport Photo
- PAN Card Photo
- Signature
- Address Proof
- ID Proof

## 🚀 Deployment

### Frontend (Vercel or Netlify)

```bash
# Vercel
npm install -g vercel
vercel

# Netlify
npm install -g netlify-cli
netlify deploy
```

### Backend (Firebase Functions)

- Deploy callable functions via Firebase CLI after configuring your project and secrets.

Local development (Functions Emulator):

1. Install deps

```bash
cd functions
npm install
```

1. Start only Functions emulator (defaults to port 5002 in this repo)

```bash
npx firebase-tools emulators:start --only functions --project hackathon-5e406
```

1. Frontend will connect to the Functions emulator when `VITE_USE_FIREBASE_EMULATORS=true` and will honor `VITE_FUNCTIONS_EMULATOR_PORT` (defaults to 5001; we set 5002 here). Add to your `.env`:

```env
VITE_USE_FIREBASE_EMULATORS=true
VITE_FUNCTIONS_EMULATOR_PORT=5002
```

Optional: Quick curl test against the Functions emulator

```bash
# validateDocument (returns structured results; token optional in emulator)
curl -s -X POST \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer owner" \
   -d '{"data": {"imageBase64": "", "documentType": "Passport Photo"}}' \
   http://127.0.0.1:5002/hackathon-5e406/us-central1/validateDocument | jq .

# sendEmailNotification (will error if RESEND_API_KEY not set in emulator env)
curl -s -X POST \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer owner" \
   -d '{"data": {"to":"test@example.com","type":"renewal","data":{"serviceName":"NID"}}}' \
   http://127.0.0.1:5002/hackathon-5e406/us-central1/sendEmailNotification | jq .
```

### Vercel configuration (SPA routing + env)

This app is a Vite SPA. We've added `vercel.json` to ensure client-side routing works and Vercel serves the built `dist` folder.

- Build command: `npm run build`
- Output directory: `dist`
- SPA fallback: All non-file routes rewrite to `/` so React Router can handle them

Required frontend environment variables (set in Vercel Project → Settings → Environment Variables):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- Optional: `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MEASUREMENT_ID`, `VITE_FIREBASE_DATABASE_URL`
- Optional: `VITE_USE_FIREBASE_EMULATORS` should be omitted or set to `false` in production
   - If you use a non-default Functions emulator port locally, set `VITE_FUNCTIONS_EMULATOR_PORT`

Notes:

- Backend secrets like `RESEND_API_KEY` and `HUGGING_FACE_ACCESS_TOKEN` should remain in Firebase Functions (not Vercel env) if you're keeping Functions on Firebase.
- The frontend calls your Firebase Callable Functions via the Firebase SDK, so hosting the UI on Vercel and Functions on Firebase works out of the box.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with shadcn/ui
- Firebase
- AI models from Hugging Face
 - Built at the 100x Hackathon by team Control BIts

## � Project Contributors

- Shishir — https://github.com/Shishirjoshi
- Rajiv — https://github.com/rajivsthh
- Dhirendra — https://github.com/dhirendraxd
- Riten — https://github.com/RitenTam

Team: Control BIts

## 📧 Contact

Maintainer: [dhirendraxd](https://github.com/dhirendraxd)

---

Made with ♥ at the 100x Hackathon by Control BIts
