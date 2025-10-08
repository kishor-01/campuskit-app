// // src/app/providers.tsx

// "use client";

// import { SessionProvider } from "next-auth/react";
// import { ThemeProvider } from "next-themes"; // Corrected import path

// export default function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <SessionProvider>
//       <ThemeProvider
//         attribute="class"
//         defaultTheme="light"
//         themes={['light', 'dark', 'theme-solarized', 'theme-rose-pine']}
//       >
//         {children}
//       </ThemeProvider>
//     </SessionProvider>
//   );
// }

// src/app/providers.tsx (Temporary Test)

"use client";

import { SessionProvider } from "next-auth/react";
// We are temporarily removing ThemeProvider to isolate the issue

export default function Providers({ children }: { children: React.ReactNode }) {
  // Only render the SessionProvider for now
  return <SessionProvider>{children}</SessionProvider>;
}