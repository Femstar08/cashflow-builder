"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Collaborator = {
  email: string;
  role?: string;
  status?: "pending" | "accepted";
};

type CollaboratorPanelProps = {
  initialCollaborators?: Collaborator[];
  profileName: string;
};

export function CollaboratorPanel({ initialCollaborators = [], profileName }: CollaboratorPanelProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(initialCollaborators);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleInvite = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) {
      setMessage("Please enter an email.");
      return;
    }

    setCollaborators((prev) => [...prev, { email, role, status: "pending" }]);
    setEmail("");
    setRole("");
    setMessage(`Invitation queued for ${email}. (Stubbed – connect InstantDB function later)`);
  };

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Collaboration</p>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Invite teammates</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-300">
          Share {profileName} with your accountant or client. Invitations are sequential (one person edits at a time).
        </p>
      </div>
      <form onSubmit={handleInvite} className="mt-4 flex flex-col gap-3 md:flex-row">
        <input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <input
          type="text"
          placeholder="Role (optional)"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <Button type="submit" size="sm">
          Invite
        </Button>
      </form>
      {message && <p className="mt-2 text-xs text-amber-600">{message}</p>}
      <ul className="mt-4 divide-y divide-neutral-100 text-sm dark:divide-neutral-800">
        {collaborators.map((collaborator) => (
          <li key={`${collaborator.email}-${collaborator.role}`} className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-neutral-900 dark:text-white">{collaborator.email}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{collaborator.role || "Collaborator"}</p>
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {collaborator.status === "pending" ? "Pending" : "Active"}
            </span>
          </li>
        ))}
        {collaborators.length === 0 && <li className="py-2 text-neutral-500 dark:text-neutral-400">No collaborators yet.</li>}
      </ul>
    </section>
  );
}

