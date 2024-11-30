'use client';

import { useEffect, useState } from 'react';
import { getUserBooks } from '@/lib/bookService';
import LazyBookCover from '@/components/LazyBookCover';
import BookDetailsPanel from '@/components/BookDetailsPanel';
import LibraryFilter, { isInRange } from '@/components/LibraryFilter';
import InitGradeUI from '@/components/hero/InitGradeUI';
import { Button } from "@/components/ui/button";
import type { GradedBook } from '@/types/database.types';
import { UserInfo } from "@/lib/authUtils";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from 'next/navigation'
import UpdateBookCover from '@/components/UpdateBookCover';
import SearchBooks from '@/components/SearchBooks';

interface HeroLeftProps {
  user: UserInfo | null;
}

export default function MyBooksPage({
  searchParams,
}: {
  searchParams: { level?: any };
}) {
  const [books, setBooks] = useState<GradedBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<GradedBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGradeUI, setShowGradeUI] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [filteredBooks, setFilteredBooks] = useState<GradedBook[]>([]);

  const router = useRouter();
  
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUser(JSON.parse(storedUserInfo));
    }
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!user?.email) return;
      try {
        setLoading(true);
        const data = await getUserBooks(user.email);
        setBooks(data);
        setFilteredBooks(data);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [user?.email]);

  const getRelatedBooks = (book: GradedBook) => {
    return books
      .filter(b => b.languagelevel === book.languagelevel && b.id !== book.id)
      .slice(0, 3);
  };

  const handleBookClick = (book: GradedBook) => {
    setSelectedBook(book);
  };

  const handleSearch = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    const filtered = books.filter(book => 
      book.bookname.toLowerCase().includes(lowercaseQuery) ||
      book.author.toLowerCase().includes(lowercaseQuery) ||
      book.booklanguage.toLowerCase().includes(lowercaseQuery) ||
      book.languagelevel.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredBooks(filtered);
  };

  const filteredBooksByLevel = searchParams?.level && searchParams.level !== 'all'
    ? filteredBooks.filter(book => isInRange(book.languagelevel, searchParams.level))
    : filteredBooks;

    if(!user){
      return(
        <div className='flex flex-col h-screen w-screen overflow-hidden items-center justify-center'>
          <h1>Please sign in to view your books.</h1>
        </div>
      )
    }
  

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <div className="flex-none sm:px-8 px-5 py-6 shadow backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className='flex items-center space-x-4'>
          <div className="bg-white text-white rounded-full border border-gray-200 shadow-xl w-12 h-12 flex items-center justify-center">
        <span className="text-xs font-bold">
          <img src="/images/logo.png" alt="Logo" className="w-10 h-auto"/>
        </span>
      </div>
      <h1 className="sm:text-4xl text-xl font-bold text-gray-800">My Books</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-auto">
            <SearchBooks onSearch={handleSearch} />
            </div>
            <Button 
              onClick={() => setShowGradeUI(true)}
              className="whitespace-nowrap"
            >
              Grade New Book
            </Button>
            
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-grow overflow-y-auto pb-10">
        <div className="container mx-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600">Loading books...</div>
            </div>
          ) : filteredBooksByLevel.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
              <div className="text-gray-600">No books found</div>
              <Button onClick={() => setShowGradeUI(true)}>
                Grade Your First Book
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {filteredBooksByLevel.map((book) => (
                <div
                  key={book.id}
                  className="relative border border-white backdrop-blur-sm rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105 p-2"
                >
                  <div className="relative aspect-[3/4]">
                    <LazyBookCover 
                      title={book.bookname}
                      author={book.author}
                      bookId={book.id}
                      coverUrl={book.cover_url}
                      className="w-full h-full"
                    />
                    <div className='absolute top-2 right-2'>
                    <UpdateBookCover
                        bookId={book.id}
                        currentCoverUrl={book.cover_url}
                        onUpdate={(newCoverUrl) => {
                          if (newCoverUrl && typeof newCoverUrl === 'string') {
                            setBooks(prevBooks =>
                              prevBooks.map(b =>
                                b.id === book.id
                                  ? { ...b, cover_url: newCoverUrl }
                                  : b
                              )
                            );
                          }
                        }}
                      />
                      </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-gray-800 line-clamp-2">
                      {book.bookname}
                    </h3>
                    <p className="text-sm text-gray-600">
                      <span className='text-black'>By</span> {book.author}
                    </p>
                    <div className="flex items-center justify-between space-x-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm">
                        {book.languagelevel}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm">
                        {book.booklanguage}
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

      {/* Grade UI Sliding Panel */}
      <AnimatePresence>
        {showGradeUI && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 h-full md:w-[800px] w-full bg-gray-100/60 backdrop-blur-xl shadow-xl z-50 overflow-y-auto"
          >
            <button
              onClick={() => setShowGradeUI(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="w-full flex flex-col items-center justify-center md:py-32">
              <InitGradeUI/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
