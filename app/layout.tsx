import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css";
import "yet-another-react-lightbox/styles.css";

import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s - InstaApp',
    default: 'InstaApp by Hafizh Kennandya Maulana',
  },
  description: 'Fullstack Developer - Technical Test SEVIMA',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster /> 
        </ThemeProvider>
      </body>
    </html>
  );
}