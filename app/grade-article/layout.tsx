import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grade Articles - Easy Input Language Grader',
  description: 'Use AI to analyze and grade articles by language difficulty level. Get instant assessment of text complexity and readability.',
};

export default function GradeArticleLayout({
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
