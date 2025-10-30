import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import logo from "figma:asset/cff10961812a9c5fb76a38299a6c96f962dbce8e.png";

interface LoginPageProps {
  onLogin: (accessToken: string) => void;
  onNeedSetup?: () => void;
}

export function LoginPage({ onLogin, onNeedSetup }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call MySQL login API
      const response = await fetch('/api/auth/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error("Login error:", data.message);
        setError(data.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      console.log("Login successful, token received:", !!data.token);
      if (data.token) {
        // Store token in localStorage
        localStorage.setItem('auth_token', data.token);
        onLogin(data.token);
      } else {
        setError("Failed to get authentication token");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Network error during login:", err);
      setError(err.message || "Network error. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-2">
              <img src={logo} alt="True Light Christian Assembly" className="h-20 w-auto" />
              <h1 className="text-xl font-semibold">True Light Christian Assembly</h1>
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl">True Light Christian Assembly</CardTitle>
            <CardDescription>Expense Tracker - Sign In</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            
            {onNeedSetup && (
              <div className="text-center">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={onNeedSetup}
                  className="text-xs"
                >
                  No account? Run setup
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
