import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isFirebaseConfig = this.state.error?.message?.includes('Firebase');
      
      return (
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <Alert variant="destructive" className="bg-card border-red-500/50">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-xl font-bold mb-2">
                {isFirebaseConfig ? 'Configuration Required' : 'Something went wrong'}
              </AlertTitle>
              <AlertDescription className="space-y-4">
                <p className="text-sm text-gray-300">
                  {isFirebaseConfig ? (
                    <>
                      Firebase environment variables are not configured. Please set the following variables in your deployment environment:
                    </>
                  ) : (
                    this.state.error?.message || 'An unexpected error occurred'
                  )}
                </p>
                
                {isFirebaseConfig && (
                  <div className="bg-black/30 p-4 rounded-md text-xs font-mono overflow-x-auto">
                    <div>VITE_FIREBASE_API_KEY</div>
                    <div>VITE_FIREBASE_AUTH_DOMAIN</div>
                    <div>VITE_FIREBASE_PROJECT_ID</div>
                    <div>VITE_FIREBASE_APP_ID</div>
                    <div>VITE_FIREBASE_MESSAGING_SENDER_ID</div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Reload Page
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="default"
                  >
                    Go Home
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
