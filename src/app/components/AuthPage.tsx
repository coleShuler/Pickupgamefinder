import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useAuth } from "../AuthContext";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "success" | "failed">("unknown");

  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({ email: "", password: "", name: "" });

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus("unknown");
    try {
      const response = await fetch(window.location.origin + "/.well-known/make-info.json");
      const info = await response.json();
      const healthUrl = `https://${info.projectId}.supabase.co/functions/v1/make-server-7718d69f/health`;
      
      console.log("Testing connection to:", healthUrl);
      
      const healthResponse = await fetch(healthUrl, {
        headers: {
          "Authorization": `Bearer ${info.publicAnonKey}`,
        },
      });
      
      if (healthResponse.ok) {
        setConnectionStatus("success");
        setServerError(false);
        toast.success("Backend server is ready!");
      } else {
        throw new Error(`Health check returned ${healthResponse.status}`);
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      setConnectionStatus("failed");
      toast.error("Backend server not ready yet. Please wait and try again.");
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError(false);
    try {
      await signIn(signInData.email, signInData.password);
      toast.success("Welcome back!");
      setRetryCount(0);
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error.message?.includes("Unable to connect to server") || error.message?.includes("initializing")) {
        setServerError(true);
        setRetryCount(prev => prev + 1);
        toast.error("Server is initializing. The app will retry automatically.");
      } else {
        toast.error(error.message || "Failed to sign in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError(false);
    try {
      await signUp(signUpData.email, signUpData.password, signUpData.name);
      toast.success("Account created successfully!");
      setRetryCount(0);
    } catch (error: any) {
      console.error("Sign up error:", error);
      if (error.message?.includes("Unable to connect to server") || error.message?.includes("initializing")) {
        setServerError(true);
        setRetryCount(prev => prev + 1);
        toast.error("Server is initializing. The app will retry automatically.");
      } else {
        toast.error(error.message || "Failed to sign up");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">PickupSports</h1>
          <p className="text-muted-foreground mt-2">Find and join pickup games near you</p>
        </div>

        {serverError && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Backend Initializing:</strong> The Supabase Edge Function is starting up. 
              This can take 30-90 seconds on first load.
            </p>
            <div className="flex items-center gap-2 text-xs text-yellow-700">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Automatic retry in progress... (Attempt {retryCount})</span>
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              💡 The signup/signin includes 3 automatic retry attempts with 2-second delays.
              Please be patient on first use.
            </p>
          </div>
        )}

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Sign in to your account to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Get started with PickupSports</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your name"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}