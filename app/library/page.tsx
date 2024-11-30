'use client';

import { getAllBooks } from '@/lib/bookService';
import LazyBookCover from '@/components/LazyBookCover';
import LibraryFilter, { isInRange } from '@/components/LibraryFilter';
import LanguageFilter from '@/components/LanguageFilter';
import BookDetailsPanel from '@/components/BookDetailsPanel';
import { useState, useEffect, Suspense } from 'react';
import type { GradedBook } from '@/types/database.types';
import { slugify } from '@/lib/urlUtils';
import { useRouter, useSearchParams } from 'next/navigation';

function LibraryContent() {
  const [books, setBooks] = useState<GradedBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<GradedBook | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getAllBooks();
        setBooks(data);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const getRelatedBooks = (book: GradedBook) => {
    return books
      .filter(b => b.languagelevel === book.languagelevel && b.id !== book.id)
      .slice(0, 3);
  };

  const handleBookClick = (book: GradedBook) => {
    const titleSlug = slugify(book.bookname);
    const levelSlug = slugify(book.languagelevel);
    router.push(`/library/${titleSlug}/${levelSlug}/${book.id}`);
  };

  const level = searchParams.get('level');
  const filteredBooks = level && level !== 'all'
    ? books.filter(book => isInRange(book.languagelevel, level))
    : books;

  const language = searchParams.get('language');
  const languageFilteredBooks = language
    ? filteredBooks.filter(book => book.booklanguage === language)
    : filteredBooks;

  return (
    <>
      {/* Fixed Header */}
      <div className="flex-none sm:px-8 px-5 py-4 shadow backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="sm:text-4xl text-xl font-bold text-gray-800">LangGrade Library</h1>
          <div className="sm:w-96 w-32 flex items-center justify-end gap-4">
            <LibraryFilter />
            <LanguageFilter />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-grow overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600">Loading books...</div>
            </div>
          ) : languageFilteredBooks.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600">No books found</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-10">
              {languageFilteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="relative border border-white backdrop-blur-sm rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105 p-2 cursor-pointer"
                  onClick={() => handleBookClick(book)}
                >
                  <div className="relative aspect-[3/4]">
                    <LazyBookCover 
                      title={book.bookname}
                      author={book.author}
                      bookId={book.id}
                      coverUrl={book.cover_url}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-gray-800 line-clamp-2">
                      {book.bookname}
                    </h3>
                    <p className="text-sm text-gray-600">
                      <span className='text-black'>By</span> {book.author}
                    </p>
                    {book.booklanguage && (
                    <span className="p-1 bg-green-100 text-green-800 rounded-lg text-xs">
                        {book.booklanguage}
                      </span>)}
                    <div className="flex items-center justify-between absolute -top-2 -right-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm">
                        {book.languagelevel}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer (BookDetailsPanel) */}
      <div className="flex-none">
        <BookDetailsPanel
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          relatedBooks={selectedBook ? getRelatedBooks(selectedBook) : []}
        />
      </div>
    </>
  );
}

export default function LibraryPage() {
  return (
    <div className="flex flex-col h-screen">
      <Suspense fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      }>
        <LibraryContent />
      </Suspense>
    </div>
  );
}
