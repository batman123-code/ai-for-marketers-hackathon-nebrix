"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-6 max-w-4xl">
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
    </div>
  );
}
