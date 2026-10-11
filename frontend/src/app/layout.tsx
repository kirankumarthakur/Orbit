import type { Metadata } from "next";
import { Noto_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@descope/nextjs-sdk";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orbit",
  description: "Talk to an agent that can work your calendar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const projectId: string = process.env.NEXT_PUBLIC_PROJECT_ID ?? "";
  const cookieOptions = {
    sameSite: "Lax" as const,
  };

  return (
    <AuthProvider
      projectId={projectId}
      sessionTokenViaCookie={cookieOptions}
      refreshTokenViaCookie={cookieOptions}
    >
      <html
        lang="en"
        className={cn(
          "dark h-full antialiased font-sans scroll-smooth",
          notoSans.variable,
          geistMono.variable,
        )}
      >
        <body className="min-h-full flex flex-col bg-black text-white">{children}</body>
      </html>
    </AuthProvider>
  );
}
