"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { Organization } from "@/types";
import { UserRole } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

export default function OrganizationPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (user && user.role !== UserRole.ADMIN) {
      router.push("/dashboard");
      return;
    }
    fetchOrgs();
  }, [user, router]);

  async function fetchOrgs() {
    setIsLoading(true);
    try {
      const res = await apiClient.get<{ data: Organization[] }>("/auth/organizations");
      setOrgs(res.data);
      if (res.data.length > 0) {
        setEditName(res.data[0].name);
      }
    } catch {
      toast.error("Failed to fetch organization");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    const org = orgs[0];
    if (!org || !editName.trim()) return;
    try {
      await apiClient.patch(`/auth/organizations/${org._id}`, { name: editName.trim() });
      toast.success("Organization updated");
      fetchOrgs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  }

  const org = orgs[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Organization Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your organization details</p>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : org ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>ID: {org._id}</p>
              <p>Created: {new Date(org.createdAt).toLocaleDateString()}</p>
            </div>

            <Separator />

            <Button onClick={handleSave} disabled={!editName.trim()}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          No organization found
        </div>
      )}
    </div>
  );
}
