"use client";

import { PlusIcon, MessageSquareIcon, TrashIcon, MenuIcon, XIcon } from "lucide-react";
import { ChatThread } from "@/lib/use-chat-threads";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ChatSidebarProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  onNewChat: () => void;
  onSwitchThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
}

export function ChatSidebar({
  threads,
  activeThreadId,
  onNewChat,
  onSwitchThread,
  onDeleteThread,
}: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <XIcon /> : <MenuIcon />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 border-r bg-background transition-transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Qubic DeepSight</h2>
            <p className="text-xs text-muted-foreground">
              Blockchain Explorer
            </p>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <Button
              onClick={onNewChat}
              className="w-full justify-start gap-2"
              variant="default"
            >
              <PlusIcon className="size-4" />
              New Chat
            </Button>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {threads.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No chats yet. Start a new chat!
                </div>
              ) : (
                threads.map((thread) => (
                  <div
                    key={thread.id}
                    className={cn(
                      "group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                      activeThreadId === thread.id && "bg-accent"
                    )}
                  >
                    <button
                      onClick={() => onSwitchThread(thread.id)}
                      className="flex flex-1 items-center gap-2 overflow-hidden text-left"
                    >
                      <MessageSquareIcon className="size-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium">{thread.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {thread.messageCount} message
                          {thread.messageCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteThread(thread.id);
                      }}
                    >
                      <TrashIcon className="size-3 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <p className="text-xs text-muted-foreground">
              Powered by OpenAI GPT-4
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
