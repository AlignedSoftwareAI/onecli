"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Plus, Trash2, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@onecli/ui/components/dialog";
import { Button } from "@onecli/ui/components/button";
import { Input } from "@onecli/ui/components/input";
import { ScrollArea } from "@onecli/ui/components/scroll-area";
import {
  useAgentAllowlist,
  useAddAllowlistEntry,
  useDeleteAllowlistEntry,
} from "@/hooks/use-agents";

interface AllowlistEntry {
  id: string;
  domain: string;
  createdAt: Date;
}

interface ManageAllowlistDialogProps {
  agent: { id: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageAllowlistDialog = ({
  agent,
  open,
  onOpenChange,
}: ManageAllowlistDialogProps) => {
  const { data, isLoading } = useAgentAllowlist(agent.id);
  const entries: AllowlistEntry[] = (data as AllowlistEntry[] | undefined) ?? [];
  const addMutation = useAddAllowlistEntry();
  const deleteMutation = useDeleteAllowlistEntry();
  const [domain, setDomain] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDomain("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleAdd = () => {
    const trimmed = domain.trim().toLowerCase();
    if (!trimmed) return;
    addMutation.mutate(
      { agentId: agent.id, domain: trimmed },
      { onSuccess: () => setDomain("") },
    );
  };

  const handleDelete = (entryId: string) => {
    deleteMutation.mutate({ agentId: agent.id, entryId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Domain allowlist for {agent.name}</DialogTitle>
          <p className="text-muted-foreground text-xs leading-relaxed">
            When the list is non-empty, the gateway will only forward requests
            to listed domains. Use <code className="font-mono">*.example.com</code> to
            match any subdomain.
          </p>
        </DialogHeader>

        {/* Add entry */}
        <div className="flex gap-2 px-6 pb-4">
          <Input
            ref={inputRef}
            placeholder="api.example.com or *.example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && domain.trim()) handleAdd();
            }}
            className="h-8 text-sm"
          />
          <Button
            size="sm"
            onClick={handleAdd}
            loading={addMutation.isPending}
            disabled={!domain.trim()}
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>

        {/* List */}
        <div className="border-border/50 border-t">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="text-muted-foreground size-4 animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="bg-muted mb-3 flex size-10 items-center justify-center rounded-full">
                <ShieldCheck className="text-muted-foreground size-4" />
              </div>
              <p className="text-sm font-medium">No restrictions</p>
              <p className="text-muted-foreground mt-1 text-xs">
                All outbound domains are allowed. Add an entry to restrict access.
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[260px]">
              <ul className="divide-border divide-y">
                {entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center gap-3 px-6 py-2.5"
                  >
                    <code className="min-w-0 flex-1 truncate font-mono text-sm">
                      {entry.domain}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="text-muted-foreground hover:text-destructive shrink-0 transition-colors"
                      aria-label={`Remove ${entry.domain}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="border-border/50 border-t px-6 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
