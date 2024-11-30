import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Background from "./background";
import { Footer } from "@/components/footer";
import { Toaster } from 'sonner';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: 'Easy Input Language Grader',
  description: 'AI-powered language grading tool that helps educators and learners assess and analyze text difficulty levels 30x faster than traditional methods.',
  keywords: ['language grading', 'AI language analysis', 'text difficulty assessment', 'educational tool', 'language learning'],
  authors: [{ name: 'Easy Input Language Grader' }],
  openGraph: {
    title: 'Easy Input Language Grader',
    description: 'AI-powered language grading tool that helps educators and learners assess and analyze text difficulty levels 30x faster than traditional methods.',
    type: 'website',
  },
  twitter: {
    title: 'Easy Input Language Grader',
    description: 'AI-powered language grading tool that helps educators and learners assess and analyze text difficulty levels 30x faster than traditional methods.',
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Background/>
        {children}
        <Toaster />
        <div className="absolute bottom-3 w-full">
        <Footer/>
        </div>
      </body>
    </html>
  );
}