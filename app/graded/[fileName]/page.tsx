'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { notFound } from 'next/navigation';
import LazyBookCover from '@/components/LazyBookCover';
import { saveGradedBook } from '@/lib/bookService';
import { UserInfo } from "@/lib/authUtils"

interface HeroLeftProps {
  user: UserInfo | null;
}


interface GradePageProps {
  params: { fileName: string };
  searchParams: { length?: 'short' | 'medium' | 'long' };
}

interface ParsedContent {
  originalText: string;
  summary: string;
  metadata?: any;
}

// Memoized components
const LoadingState = React.memo(function LoadingState() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-xl font-semibold text-gray-700">Processing your document...</h2>
        <p className="text-gray-500">This may take a few moments. The page will automatically update when ready.</p>
        <div className="text-sm text-gray-400 mt-4">
          <p>Donot close the page or refresh the page.</p>
        </div>
      </div>
    </div>
  );
});

const ErrorState = React.memo(function ErrorState({ error }: { error: string }) {
  return (
    <div className="container mx-auto p-4">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-xl font-semibold text-red-700">Error Processing Document</h1>
        </div>
        <p className="mt-2 text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
});

const ResultView = React.memo(function ResultView({ content }: { content: ParsedContent }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUser(JSON.parse(storedUserInfo));
    }
  }, []);

  React.useEffect(() => {
    if (user?.email && content) {
      saveGradedBook({
        useremail: user.email,
        bookname: content.metadata.bookName || 'Unknown',
        author: content.metadata.author || 'Unknown',
        summary: content.summary,
        languagelevel: content.metadata.languageLevel,
        booklanguage: content.metadata.bookLanguage || 'English',
        coverimageurl: content.metadata.coverImageUrl || ''
      }).catch(console.error);
    }
  }, [user, content]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 text-center md:text-start">LangGrade</h1>
      </div>

      <div className="flex-1 overflow-auto md:overflow-hidden pb-10">
        <div className="md:flex md:p-10 rounded-lg h-full">
          <div className="md:w-1/2 md:p-6 p-3 flex flex-col md:h-full">
            <div className="flex flex-col items-start">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {content.metadata.bookName || "Not available"}
                </h2>
                <p className="text-xl text-gray-600">
                  by {content.metadata.author || "Not available"}
                </p>
                <div className="inline-block">
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                    Language Level: {content.metadata.languageLevel || "Not available"}
                  </span>
                </div>
              </div>
              <div className="mt-6 w-64 h-96">
                <LazyBookCover
                  title={content.metadata.bookName}
                  author={content.metadata.author}
                  className="w-64 h-96 mx-auto"
                />
              </div>
            </div>
          </div>

          <div className="md:w-1/2 md:p-6 p-3 md:h-full">
            <div className="flex flex-col h-full">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Book Summary
              </h2>
              <div className="overflow-y-auto pr-4 pb-8 flex-1">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {content.summary}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function GradePage({ params, searchParams }: GradePageProps) {
  const [content, setContent] = useState<ParsedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchContent = useCallback(async () => {
    if (isLoading) return; // Prevent double fetching if already loading
    
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: params.fileName,
          length: searchParams.length || undefined
        }),
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process document');
      }

      const data = await response.json();
      setContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [params.fileName, searchParams.length, isLoading]);

  useEffect(() => {
    if (!content && !error) {
      fetchContent();
    }
  }, [fetchContent, content, error]);

  if (error) {
    return <ErrorState error={error} />;
  }

  if (isLoading || !content) {
    return <LoadingState />;
  }

  return <ResultView content={content} />;
}
