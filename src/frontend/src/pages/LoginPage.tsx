import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { MapPin } from "lucide-react";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import loginBg from "../assets/login-bg.png";

// Validation Schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" }
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      onNavigate("dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.name });
      onNavigate("dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create an account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-white">
      {/* Left Pane - Premium Imagery */}
      <div 
        className="flex max-lg:hidden flex-col justify-center items-center relative w-full h-full overflow-hidden bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${loginBg})`,
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
      <div className="flex flex-col justify-center items-center w-full p-6 sm:p-12 relative bg-zinc-50">
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
          <Button variant="ghost" onClick={() => onNavigate("home")} className="text-zinc-500 hover:text-primary hover:bg-zinc-100">
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
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-zinc-900">Welcome to the journey</h2>
            <p className="text-zinc-500">Sign in to your account and continue exploring.</p>
          </div>

          <div className="bg-white text-zinc-900 rounded-2xl border border-zinc-200 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="px-6 py-6 sm:px-8 sm:py-8">
              {error && (
                <div className="p-3 mb-6 text-sm text-red-600 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <span className="font-semibold">Error:</span> {error}
                </div>
              )}

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 p-1 bg-zinc-100 rounded-xl mb-6">
                  <TabsTrigger value="login" className="rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
                </TabsList>

                {/* LOGIN TAB */}
                <TabsContent value="login" className="animate-in fade-in-50 duration-500">
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="login-email" className="text-sm font-semibold text-zinc-700">Email address</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="ahmed@example.com"
                        {...loginForm.register("email")}
                        className={`h-11 bg-zinc-50 focus-visible:ring-primary transition-all ${loginForm.formState.errors.email ? "border-red-500" : "border-zinc-200"}`}
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-red-500 text-xs font-medium">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-sm font-semibold text-zinc-700">Password</Label>
                        <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        {...loginForm.register("password")}
                        className={`h-11 bg-zinc-50 focus-visible:ring-primary transition-all ${loginForm.formState.errors.password ? "border-red-500" : "border-zinc-200"}`}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-red-500 text-xs font-medium">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full h-11 mt-6 text-base font-semibold shadow-md active:scale-[0.98] transition-all" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In to LahoreLens"}
                    </Button>
                  </form>
                </TabsContent>

                {/* SIGNUP TAB */}
                <TabsContent value="signup" className="animate-in fade-in-50 duration-500">
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-name" className="text-sm font-semibold text-zinc-700">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Ahmed Khan"
                        {...signupForm.register("name")}
                        className={`h-11 bg-zinc-50 focus-visible:ring-primary transition-all ${signupForm.formState.errors.name ? "border-red-500" : "border-zinc-200"}`}
                      />
                      {signupForm.formState.errors.name && (
                        <p className="text-red-500 text-xs font-medium">{signupForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-email" className="text-sm font-semibold text-zinc-700">Email address</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="ahmed@example.com"
                        {...signupForm.register("email")}
                        className={`h-11 bg-zinc-50 focus-visible:ring-primary transition-all ${signupForm.formState.errors.email ? "border-red-500" : "border-zinc-200"}`}
                      />
                      {signupForm.formState.errors.email && (
                        <p className="text-red-500 text-xs font-medium">{signupForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-password" className="text-sm font-semibold text-zinc-700">Password <span className="text-xs text-zinc-500 font-normal">(Min 6 chars)</span></Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        {...signupForm.register("password")}
                        className={`h-11 bg-zinc-50 focus-visible:ring-primary transition-all ${signupForm.formState.errors.password ? "border-red-500" : "border-zinc-200"}`}
                      />
                      {signupForm.formState.errors.password && (
                        <p className="text-red-500 text-xs font-medium">{signupForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full h-11 mt-6 text-base font-semibold shadow-md active:scale-[0.98] transition-all" disabled={loading}>
                       {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <p className="text-center text-sm text-zinc-500 mt-8">
            By continuing, you agree to LahoreLens's <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
