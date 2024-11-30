import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Books - Easy Input Language Grader',
  description: 'Manage your personal collection of graded books. Track your reading progress and organize your learning materials.',
};

export default function MyBooksLayout({
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
