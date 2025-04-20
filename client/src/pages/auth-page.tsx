import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2, TrendingUp } from "lucide-react";

const loginSchema = insertUserSchema.pick({ username: true, password: true });
const registerSchema = insertUserSchema;

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
    },
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white text-xl" />
              </div>
              <h1 className="text-2xl font-bold">FinanceBuddy</h1>
            </div>
            <h2 className="text-xl font-semibold">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin 
                ? "Sign in to manage your finances" 
                : "Join FinanceBuddy to start tracking your money"
              }
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isLogin ? "Sign In" : "Sign Up"}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLogin ? (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </Form>
              )}

              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-8 text-white">
        <div className="max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
            <TrendingUp className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-bold">Take Control of Your Finances</h3>
          <p className="text-lg text-blue-100">
            Track expenses, manage budgets, and achieve your financial goals with FinanceBuddy's 
            comprehensive personal finance management tools.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="font-semibold">Budget Tracking</div>
              <div className="text-blue-100">Monitor spending by category</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="font-semibold">Account Management</div>
              <div className="text-blue-100">Multiple account support</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="font-semibold">Recurring Transactions</div>
              <div className="text-blue-100">Automate regular payments</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="font-semibold">Financial Insights</div>
              <div className="text-blue-100">Charts and analytics</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
