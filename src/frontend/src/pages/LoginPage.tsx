import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { MapPin } from "lucide-react";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The AuthContext will automatically detect the login and sync with the backend
      onNavigate("dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Add the user's name to their Firebase profile
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // The AuthContext will catch this and sync the new user to MongoDB
      onNavigate("dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create an account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full flex-col lg:flex-row bg-background">
      {/* Left Pane - Premium Imagery */}
      <div 
        className="hidden lg:flex flex-col justify-center items-center w-1/2 relative overflow-hidden bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1586015555651-409a2baf45a0?q=80&w=2574&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-blue-900/90 mix-blend-multiply transition-opacity duration-1000" />
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Floating animated elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 text-center px-12 text-white flex flex-col items-center transform transition-transform duration-700 hover:scale-105">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/30 mb-8 shadow-2xl">
            <MapPin className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100 drop-shadow-lg">
            Experience Lahore
          </h1>
          <p className="text-lg font-medium text-blue-50/90 max-w-md leading-relaxed">
            Unlock AI-powered travel intelligence, build custom itineraries, and seamlessly explore the cultural heart of Pakistan.
          </p>
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-6 sm:p-12 relative bg-zinc-50 dark:bg-zinc-950">
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
          <Button variant="ghost" onClick={() => onNavigate("home")} className="text-muted-foreground hover:text-primary">
            Back to Home
          </Button>
        </div>
        
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden justify-center hover:opacity-80 transition-opacity cursor-pointer" onClick={() => onNavigate("home")}>
            <MapPin className="h-8 w-8 text-primary" />
            <span className="text-primary font-bold text-2xl tracking-tight">LahoreLens</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Welcome to the journey</h2>
            <p className="text-muted-foreground">Sign in to your account and continue exploring.</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 text-card-foreground rounded-2xl border shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="px-6 py-6 sm:px-8 sm:py-8">
              {error && (
                <div className="p-3 mb-6 text-sm text-red-600 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <span className="font-semibold">Error:</span> {error}
                </div>
              )}

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl mb-6">
                  <TabsTrigger value="login" className="rounded-lg transition-all data-[state=active]:shadow-sm">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg transition-all data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
                </TabsList>

                {/* LOGIN TAB */}
                <TabsContent value="login" className="animate-in fade-in-50 duration-500">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-semibold">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ahmed@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 bg-muted/30 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                        <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 bg-muted/30 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11 mt-6 text-base font-semibold shadow-md active:scale-[0.98] transition-all" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In to LahoreLens"}
                    </Button>
                  </form>
                </TabsContent>

                {/* SIGNUP TAB */}
                <TabsContent value="signup" className="animate-in fade-in-50 duration-500">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-name" className="text-sm font-semibold">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Ahmed Khan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-11 bg-muted/30 focus-visible:ring-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-email" className="text-sm font-semibold">Email address</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="ahmed@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 bg-muted/30 focus-visible:ring-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-password" className="text-sm font-semibold">Password <span className="text-xs text-muted-foreground font-normal">(Min 6 chars)</span></Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        required
                        className="h-11 bg-muted/30 focus-visible:ring-primary transition-all"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11 mt-6 text-base font-semibold shadow-md active:scale-[0.98] transition-all" disabled={loading}>
                       {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-8">
            By continuing, you agree to LahoreLens's <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
