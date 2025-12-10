import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { FloatingAgentBubble } from "@/components/agent/floating-agent-bubble";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1720] to-[#15213C] text-white">
      <TopNav />
      <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-6 py-6">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
      <FloatingAgentBubble />
    </div>
  );
}

