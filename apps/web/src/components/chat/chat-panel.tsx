"use client";

import { useUIStore } from "@/stores/ui-store";
import { useChatStore } from "@/stores/chat-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Bot } from "lucide-react";

export function ChatPanel() {
  const { chatOpen, setChatOpen } = useUIStore();
  const { messages, isLoading } = useChatStore();

  return (
    <Sheet open={chatOpen} onOpenChange={setChatOpen}>
      <SheetContent className="w-[400px] sm:w-[450px] flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-2 border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Bot className="h-5 w-5 text-primary" />
            AI Assistant
          </SheetTitle>
        </SheetHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground text-sm">
              <Bot className="mb-2 h-10 w-10" />
              <p className="font-medium">YesBoss AI Assistant</p>
              <p className="text-xs mt-1">Ask me to create tasks, generate reports, or manage your projects.</p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
              </div>
              <span>Thinking...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <ChatInput />
        </div>
      </SheetContent>
    </Sheet>
  );
}
