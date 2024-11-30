import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Library - Easy Input Language Grader',
  description: 'Browse our extensive collection of graded reading materials. Find books and articles suitable for every language level.',
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden w-screen bg-lightblue">
      {children}
    </div>
  );
}
