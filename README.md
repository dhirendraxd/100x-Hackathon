# Form Mitra Smart (SarkarSevaSaathi)

Government document validation and form-filling application helping citizens get their paperwork right the first time.

## 🚀 Features

- AI Document Validation: Upload government documents and verify they meet official requirements using AI-powered checks
- Smart Form Filling: Intelligent suggestions and real-time validation
- Progress Saving: Save your progress and resume later

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
   git clone https://github.com/dhirendraxd/form-mitra-smart.git
   cd form-mitra-smart
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
form-mitra-smart/
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

## 📧 Contact

Project maintained by [dhirendraxd](https://github.com/dhirendraxd)

---

Made with ♥ for Indian Citizens
