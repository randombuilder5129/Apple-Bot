
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, Shield } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated, login } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const urlParams = new URLSearchParams(window.location.search);
    const authError = urlParams.get('error');
    
    let errorMessage = '';
    if (authError === 'access_denied') {
      errorMessage = 'Access was denied. Please try again and authorize the application.';
    } else if (authError === 'invalid_request') {
      errorMessage = 'Invalid request. Please try again.';
    } else if (authError === 'state_mismatch') {
      errorMessage = 'Security error. Please try again.';
    } else if (authError === 'auth_failed') {
      errorMessage = 'Authentication failed. Please try again.';
    }

    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Apple Bot Dashboard</CardTitle>
            <CardDescription>
              Sign in with Discord to access your server dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <p className="text-red-400 text-sm">{errorMessage}</p>
              </div>
            )}
            <Button 
              onClick={login}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
              size="lg"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign in with Discord
            </Button>
            <p className="text-xs text-gray-400 mt-4 text-center">
              You'll only see servers where you have moderator permissions and Apple Bot is present.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
