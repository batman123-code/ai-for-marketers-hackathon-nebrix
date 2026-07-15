"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const queryClient = useQueryClient();

  // Local Form state
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");

  // 1. Fetch Profile User details
  const { data: meResponse, isLoading: isMeLoading } = useQuery({
    queryKey: ["current-user-settings"],
    queryFn: async () => {
      const res = await apiClient.get("/auth/me");
      return res.data;
    }
  });

  // 2. Fetch Company details
  const { data: companyResponse, isLoading: isCompanyLoading } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const res = await apiClient.get("/auth/company");
      return res.data;
    }
  });

  // Populate local state when data is loaded
  useEffect(() => {
    if (meResponse?.data?.user) {
      setFullName(meResponse.data.user.user_metadata?.full_name || meResponse.data.user.email?.split("@")[0] || "");
    }
  }, [meResponse]);

  useEffect(() => {
    if (companyResponse?.data) {
      setCompanyName(companyResponse.data.name || "");
      setIndustry(companyResponse.data.industry || "");
      setWebsite(companyResponse.data.website || "");
    }
  }, [companyResponse]);

  // 3. Save Profile Mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (updatedName: string) => {
      const res = await apiClient.post("/auth/profile", { full_name: updatedName });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["current-user-settings"] });
    },
    onError: () => {
      toast.error("Failed to update profile.");
    }
  });

  // 4. Save Company Mutation
  const saveCompanyMutation = useMutation({
    mutationFn: async (companyPayload: { name: string; industry: string; website: string }) => {
      const res = await apiClient.post("/auth/company", companyPayload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Company settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
    },
    onError: () => {
      toast.error("Failed to update company settings.");
    }
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    saveProfileMutation.mutate(fullName);
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    saveCompanyMutation.mutate({
      name: companyName,
      industry,
      website
    });
  };

  const isLoading = isMeLoading || isCompanyLoading;

  return (
    <div className="flex-1 space-y-6 max-w-4xl">
<<<<<<< HEAD
      <div className="flex flex-col gap-4 rounded-[32px] border border-border bg-card p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Preferences</p>
        <h2 className="mt-1 text-3xl font-medium tracking-[-0.02em] text-foreground">Settings</h2>
        <p className="text-sm leading-6 text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="John Doe" className="max-w-md" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="john@example.com" className="max-w-md" />
            </div>
            <Button className="rounded-full">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage your Nebrix API keys for external integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-background/60 p-4">
              <div>
                <p className="font-medium text-foreground">Production Key</p>
                <p className="mt-1 font-mono text-sm text-muted-foreground">sk_prod_*********************</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full">Reveal</Button>
            </div>
            <Button variant="outline" className="rounded-full">Generate New Key</Button>
          </CardContent>
        </Card>
      </motion.div>
=======
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your company credentials and personal configurations.</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-48 bg-card/40 border border-border/50 animate-pulse rounded-2xl" />
          <div className="h-64 bg-card/40 border border-border/50 animate-pulse rounded-2xl" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Card */}
          <form onSubmit={handleProfileSubmit}>
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="max-w-md bg-muted/30 border-border/60" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={meResponse?.data?.user?.email || ""} 
                    disabled 
                    className="max-w-md bg-muted/20 border-border/40 text-muted-foreground cursor-not-allowed" 
                  />
                </div>
                <Button type="submit" disabled={saveProfileMutation.isPending}>
                  {saveProfileMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </form>

          {/* Company Card */}
          <form onSubmit={handleCompanySubmit}>
            <Card className="bg-card/50 backdrop-blur-xl border-border/50">
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
                <CardDescription>Configure your active marketing company context.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input 
                    id="company-name" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="max-w-md bg-muted/30 border-border/60" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input 
                    id="industry" 
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="max-w-md bg-muted/30 border-border/60" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input 
                    id="website" 
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="max-w-md bg-muted/30 border-border/60" 
                  />
                </div>
                <Button type="submit" disabled={saveCompanyMutation.isPending}>
                  {saveCompanyMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Company Settings
                </Button>
              </CardContent>
            </Card>
          </form>
        </motion.div>
      )}
>>>>>>> bf37c5909541ae5551f45803b9cfd61427c7bb43
    </div>
  );
}
