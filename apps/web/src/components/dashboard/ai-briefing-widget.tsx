"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export function AIBriefingWidget() {
  const { token } = useAuthStore();
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:4000/api/chat/insights", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setInsights(data.data.insights);
        }
      } catch (err) {
        console.error("Failed to load AI briefing", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, [token]);

  if (!insights && !loading) return null;

  return (
    <Card className="border-primary/50 bg-primary/5 shadow-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Daily Operations Briefing
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing your team's workload and active projects...
          </div>
        ) : (
          <div 
            className="prose prose-sm max-w-none text-foreground dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: insights ? insights.replace(/\n/g, '<br/>') : "No insights available." }}
          />
        )}
      </CardContent>
    </Card>
  );
}