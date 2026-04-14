"use client";

import { useEffect, useState } from "react";
import { Users, Building } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTeamStore } from "@/stores/team-store";
import { useUserStore } from "@/stores/user-store";
import { CreateTeamDialog } from "@/components/teams/create-team-dialog";
import { AddMemberDialog } from "@/components/teams/add-member-dialog";

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState("members");
  const { teams, fetchTeams, isLoading: teamsLoading } = useTeamStore();
  const { users, fetchUsers, isLoading: usersLoading } = useUserStore();

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, [fetchTeams, fetchUsers]);

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Directory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization's teams and members.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "members" ? (
            <AddMemberDialog />
          ) : (
            <CreateTeamDialog />
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="bg-muted/50 border h-10 w-fit rounded-md justify-start gap-1 p-1">
          <TabsTrigger value="members" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded flex items-center gap-2 px-4 py-1.5 transition-all">
            <Users className="h-4 w-4" />
            Members ({users.length})
          </TabsTrigger>
          <TabsTrigger value="teams" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded flex items-center gap-2 px-4 py-1.5 transition-all">
            <Building className="h-4 w-4" />
            Teams ({teams.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="flex-1 overflow-y-auto border-0 p-0 mt-6">
          <div className="bg-background rounded-lg border shadow-sm">
            <div className="p-4 border-b bg-muted/20">
              <h3 className="font-semibold">All Members</h3>
            </div>
            {usersLoading && users.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Loading members...</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No members found. Add your first member to get started.</div>
            ) : (
              <div className="divide-y">
                {users.map((user) => (
                  <div key={user._id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-muted/30 text-muted-foreground">
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="flex-1 overflow-y-auto border-0 p-0 mt-6">
          {teamsLoading && teams.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Loading teams...</div>
          ) : teams.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No teams found. Create your first team to start organizing members.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <div key={team._id} className="bg-background rounded-lg border shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <Building className="h-5 w-5" />
                    </div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {team.memberIds?.length || 0} Members
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{team.name}</h3>
                  <p className="text-sm text-muted-foreground flex-1 mb-4 line-clamp-2">
                    {team.description || "No description provided."}
                  </p>
                  <Button variant="outline" className="w-full">View Team</Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
