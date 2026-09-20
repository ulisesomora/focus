import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";

type MobileLayoutProps = {
  children: ReactNode;
};

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <DesktopSidebar />

      <main className="mx-auto min-h-screen w-full max-w-md px-4 pb-24 pt-5 lg:ml-72 lg:max-w-none lg:px-8 lg:pb-10 lg:pt-8 xl:px-10">
        <div className="mx-auto w-full lg:max-w-[1180px]">{children}</div>
      </main>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
