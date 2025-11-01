// Simple build-time flag to enable demo behavior across the app
// Set VITE_DEMO_MODE=true in your .env (Vite) to enable
// Vite exposes env on import.meta.env with typed access in TS projects
// Use optional chaining in case of atypical build contexts
export const DEMO_MODE: boolean = typeof import.meta !== 'undefined'
	&& (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_DEMO_MODE === 'true';
