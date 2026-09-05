import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/providers/StoreProvider";

export const metadata: Metadata = {
  title: "Workspace Manager — The All-In-One Workspace for Modern Teams",
  description: "Organize projects, track tasks, and collaborate effortlessly. Combines the visual simplicity of Notion with the power of Jira, backed by Supabase cloud sync.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
