import type React from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
// import { Metadata } from "next";
// import { auth } from "@/lib/auth";
// import { headers } from "next/headers";

// const user = await auth.api.getSession({
//   headers: await headers(),
// });

// export const metadata: Metadata = {
//   title: `Messages | ${user?.user.username}`,
// };


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
