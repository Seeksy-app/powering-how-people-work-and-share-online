import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordValidation } from "@/components/auth/PasswordValidation";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setIsLogin(false);
    } else if (mode === "login") {
      setIsLogin(true);
    }

    // Check if this is a password reset link
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    if (type === "recovery") {
      setShowResetPassword(true);
    }
  }, [searchParams]);

  const validatePassword = (pwd: string): boolean => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /\d/.test(pwd) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    );
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        
        // Check for signup intent and redirect
        const intent = localStorage.getItem("signupIntent");
        if (intent) {
          localStorage.removeItem("signupIntent");
          navigate(intent);
        } else {
          navigate("/dashboard");
        }
      } else {
        // Validate password
        if (!validatePassword(password)) {
          throw new Error("Password does not meet all requirements");
        }

        // Check passwords match
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        // Password-based signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;
        
        // Send welcome email
        if (data.user) {
          try {
            await supabase.functions.invoke('send-welcome-email', {
              body: { 
                email,
                name: fullName,
              },
            });
          } catch (emailError) {
            // Don't block signup if email fails
            console.error('Welcome email failed:', emailError);
          }
        }

        toast({
          title: "Account created!",
          description: "Check your email to confirm your account.",
        });
        
        // Mark that user just signed up to show welcome modal on first login
        localStorage.setItem("justSignedUp", "true");
        
        // Check for signup intent and redirect
        const intent = localStorage.getItem("signupIntent");
        if (intent) {
          localStorage.removeItem("signupIntent");
          navigate(intent);
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent!",
        description: "Check your email for the password reset link.",
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate password
      if (!validatePassword(newPassword)) {
        throw new Error("Password does not meet all requirements");
      }

      // Check passwords match
      if (newPassword !== confirmNewPassword) {
        throw new Error("Passwords do not match");
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated!",
        description: "Your password has been successfully reset.",
      });
      
      setShowResetPassword(false);
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 shadow-soft">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Seeksy
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? "Welcome back" : "Create your account"}
          </p>
        </div>

        {showResetPassword ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <PasswordInput
                id="newPassword"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Enter your new password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <PasswordInput
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={setConfirmNewPassword}
                placeholder="Confirm your new password"
              />
            </div>

            {newPassword && (
              <PasswordValidation 
                password={newPassword}
                confirmPassword={confirmNewPassword}
              />
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !validatePassword(newPassword) || newPassword !== confirmNewPassword}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </form>
        ) : showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setShowForgotPassword(false);
                setEmail("");
              }}
            >
              Back to login
            </Button>
          </form>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  placeholder="Your name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Confirm your password"
                  />
                </div>

                {password && (
                  <PasswordValidation 
                    password={password}
                    confirmPassword={confirmPassword}
                  />
                )}
              </>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || (!isLogin && (!validatePassword(password) || password !== confirmPassword))}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Sign In" : "Create Account"}
            </Button>

            {isLogin && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-primary hover:underline w-full text-center"
              >
                Forgot password?
              </button>
            )}
          </form>
        )}

        {!showForgotPassword && !showResetPassword && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Auth;
