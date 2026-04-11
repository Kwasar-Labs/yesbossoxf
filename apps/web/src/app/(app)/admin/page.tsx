"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useOrgStore } from "@/stores/org-store";
import { useUserStore } from "@/stores/user-store";
import { useTeamStore } from "@/stores/team-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Settings, RefreshCw, ShieldCheck, Users, Users as TeamsIcon, Plus, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/types";

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const { currentOrg, fetchOrganization, updateOrganization, isLoading: orgLoading } = useOrgStore();
  const { users, fetchUsers, isLoading: usersLoading } = useUserStore();
  const { teams, fetchTeams, isLoading: teamsLoading } = useTeamStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.organizationId) {
      fetchOrganization(user.organizationId);
      fetchUsers();
      fetchTeams();
    }
  }, [user, fetchOrganization, fetchUsers, fetchTeams]);

  useEffect(() => {
    if (currentOrg) {
      setName(currentOrg.name || "");
      setDescription(currentOrg.description || "");
    }
  }, [currentOrg]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.organizationId) return;

    try {
      setIsSubmitting(true);
      await updateOrganization(user.organizationId, { name, description });
      toast.success("Organization profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center p-8 gap-4">
        <ShieldCheck className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground w-1/2">
          You must be an organization administrator to view and modify these settings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 text-neutral-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
          <p className="text-neutral-400 mt-1">
            Manage your workspace details, users, and teams.
          </p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-[#ba9eff]/10 flex items-center justify-center border border-[#ba9eff]/20">
          <Settings className="h-6 w-6 text-[#ba9eff]" />
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full mt-4">
        <TabsList className="bg-[#141416] border border-[#232325] h-12 p-1 mb-8 w-full justify-start rounded-xl overflow-x-auto">
          <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white rounded-lg h-full px-6 transition-all">
            <Building className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white rounded-lg h-full px-6 transition-all">
            <Users className="h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="teams" className="gap-2 data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-white rounded-lg h-full px-6 transition-all">
            <TeamsIcon className="h-4 w-4" /> Teams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-0">
          <div className="bg-[#141416] rounded-xl border border-[#232325] p-6 relative">
            {orgLoading && !currentOrg && (
              <div className="absolute inset-0 bg-[#0e0e0e]/50 flex items-center justify-center backdrop-blur-sm z-10 rounded-xl">
                <RefreshCw className="h-6 w-6 animate-spin text-[#ba9eff]" />
              </div>
            )}
            <form onSubmit={handleSaveGeneral} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Building className="h-5 w-5 text-[#ba9eff]" /> Organization Profile
                </h3>
                <div className="h-px bg-[#232325] my-2" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa]">Organization Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required className="bg-[#0e0e0e] border-[#232325] text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa]">Organization ID</label>
                    <Input value={currentOrg?._id || user.organizationId} disabled className="bg-[#0a0a0a] border-[#232325] font-mono text-xs opacity-50" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa]">Description</label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="bg-[#0e0e0e] border-[#232325] text-white resize-none" />
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-[#232325] flex items-center justify-between">
                <p className="text-xs text-[#adaaaa] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Admin Access Only
                </p>
                <Button type="submit" disabled={isSubmitting || !name.trim()} className="bg-[#white] hover:bg-[#eaeaea] text-black">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-0">
          <div className="bg-[#141416] rounded-xl border border-[#232325] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#ba9eff]" /> Manage Users
                </h3>
                <p className="text-sm text-[#adaaaa] mt-1">Invite and manage members of your organization.</p>
              </div>
              <Button className="bg-gradient-to-b from-[#ba9eff] to-[#8455ef] text-[#39008c] hover:brightness-110 border-0 flex items-center gap-2">
                <Plus className="h-4 w-4" /> Invite User
              </Button>
            </div>
            
            {usersLoading ? (
              <div className="flex justify-center py-12"><RefreshCw className="h-6 w-6 animate-spin text-[#ba9eff]" /></div>
            ) : (
              <div className="rounded-xl border border-[#232325] overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#0e0e0e] text-[#adaaaa] text-[10px] uppercase font-bold tracking-wider border-b border-[#232325]">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email / Phone</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232325]">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-[#1a1a1a] transition-colors">
                        <td className="px-4 py-4 font-medium text-white">{u.name}</td>
                        <td className="px-4 py-4 text-[#adaaaa]">{u.email || "N/A"}</td>
                        <td className="px-4 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#232325] text-[#adaaaa]">{u.role}</span></td>
                        <td className="px-4 py-4 text-right">
                           <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8">
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-[#adaaaa]">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="mt-0">
          <div className="bg-[#141416] rounded-xl border border-[#232325] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <TeamsIcon className="h-5 w-5 text-[#ba9eff]" /> Manage Teams
                </h3>
                <p className="text-sm text-[#adaaaa] mt-1">Organize users into teams for better task assignment.</p>
              </div>
              <Button className="bg-gradient-to-b from-[#ba9eff] to-[#8455ef] text-[#39008c] hover:brightness-110 border-0 flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create Team
              </Button>
            </div>
            
            {teamsLoading ? (
              <div className="flex justify-center py-12"><RefreshCw className="h-6 w-6 animate-spin text-[#ba9eff]" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map(t => (
                  <div key={t._id} className="bg-[#0e0e0e] border border-[#232325] rounded-xl p-5 hover:border-[#484847] transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-white text-lg">{t.name}</h4>
                      <Button variant="ghost" size="icon" className="text-[#adaaaa] opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-[#232325] hover:text-white">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-[#adaaaa] mb-4 line-clamp-2 h-10">{t.description || "No description provided."}</p>
                    <div className="flex items-center justify-between text-xs font-semibold text-[#8a8a8a] bg-[#141416] px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> {(t.memberIds || []).length} Members</div>
                    </div>
                  </div>
                ))}
                {teams.length === 0 && (
                 <div className="col-span-full bg-[#0e0e0e] border border-dashed border-[#484847] rounded-xl p-12 text-center">
                    <p className="text-[#adaaaa]">No teams have been created yet.</p>
                 </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
