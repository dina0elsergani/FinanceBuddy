import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Key } from "lucide-react";
import { z } from "zod";

const profileSchema = insertUserSchema.pick({
  name: true,
  email: true,
}).extend({
  username: insertUserSchema.shape.username,
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      username: user?.username || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      // Note: In a real app, you'd have a dedicated profile update endpoint
      // For now, we'll use a placeholder that would need to be implemented
      const res = await apiRequest("PUT", "/api/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header title="Profile" subtitle="Manage your account settings" />
        
        <div className="p-6 space-y-6">
          {/* Profile Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                    {user?.name ? getUserInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user?.name || "User"}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">@{user?.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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

                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="w-full"
                    >
                      {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Profile
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-muted-foreground">
                        Last updated: Never
                      </p>
                    </div>
                    <Button variant="outline" disabled>
                      Change Password
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Button variant="outline" disabled>
                      Enable 2FA
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about your finances
                      </p>
                    </div>
                    <Button variant="outline" disabled>
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Budget Alerts</h4>
                      <p className="text-sm text-muted-foreground">
                        Get notified when approaching budget limits
                      </p>
                    </div>
                    <Button variant="outline" disabled>
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Data & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" disabled>
                  Export Data
                </Button>
                <Button variant="outline" disabled>
                  Import Data
                </Button>
                <Button variant="destructive" disabled>
                  Delete Account
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                These features are coming soon. Export your data, import from other services, 
                or permanently delete your account and all associated data.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
