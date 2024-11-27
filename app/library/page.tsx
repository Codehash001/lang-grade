'use client';

import { getAllBooks } from '@/lib/bookService';
import LazyBookCover from '@/components/LazyBookCover';
import LibraryFilter, { isInRange } from '@/components/LibraryFilter';
import BookDetailsPanel from '@/components/BookDetailsPanel';
import { useState, useEffect } from 'react';
import type { GradedBook } from '@/types/database.types';

export default function LibraryPage({
  searchParams,
}: {
  searchParams: { level?: any };
}) {
  const [books, setBooks] = useState<GradedBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<GradedBook | null>(null);
  const [loading, setLoading] = useState(true);

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
    setSelectedBook(book);
  };

  const filteredBooks = searchParams?.level && searchParams.level !== 'all'
    ? books.filter(book => isInRange(book.languagelevel, searchParams.level))
    : books;

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <div className="flex-none sm:px-8 px-5 py-6 shadow backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="sm:text-4xl text-xl font-bold text-gray-800">Library</h1>
          <div className="sm:w-64 w-32">
            <LibraryFilter />
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
          ) : filteredBooks.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600">No books found</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 md:gap-10">
              {filteredBooks.map((book) => (
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
    </div>
  );
}
