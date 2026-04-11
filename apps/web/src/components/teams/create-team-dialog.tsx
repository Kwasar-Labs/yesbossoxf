"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTeamStore } from "@/stores/team-store";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function CreateTeamDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createTeam } = useTeamStore();
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!user?.organizationId) {
       toast.error("Organization ID missing");
       return;
    }

    try {
      setIsSubmitting(true);
      await createTeam({
        name: name.trim(),
        description: description.trim(),
      });
      toast.success("Team created successfully");
      setOpen(false);
      setName("");
      setDescription("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create team");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" /> Create Team
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Custom Team</DialogTitle>
          <DialogDescription>
            Create a new team for your organization to start assigning members and projects.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Team Name</label>
            <Input 
              id="name" 
              placeholder="e.g. Engineering, Sales" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="desc" className="text-sm font-medium">Description (Optional)</label>
            <Textarea 
              id="desc" 
              placeholder="What is this team responsible for?" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3} 
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
