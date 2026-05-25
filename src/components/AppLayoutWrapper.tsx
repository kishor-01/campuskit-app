'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname === '/onboarding';
  const isRootPage = pathname === '/';

  const isRoadmapDetail = pathname.startsWith('/roadmaps/') && pathname.split('/').length === 3;
  const isFullScreenCanvas = isRoadmapDetail;

  if (isOnboarding) {
    return (
      <main className="flex-grow min-h-screen bg-slate-950">
        {children}
      </main>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${isFullScreenCanvas ? '' : isRootPage ? '' : 'pb-16 md:pb-0'}`}>
      <Navbar />
      <main className="flex-grow">{children}</main>
      {!isFullScreenCanvas && !isRootPage && <Footer />}
      {!isFullScreenCanvas && !isRootPage && <MobileBottomNav />}
    </div>
  );
}
