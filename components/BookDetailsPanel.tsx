'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import LazyBookCover from './LazyBookCover';
import { slugify } from '@/lib/urlUtils';
import type { GradedBook } from '@/types/database.types';

interface BookDetailsPanelProps {
  book: GradedBook | null;
  relatedBooks: GradedBook[];
  onClose: () => void;
}

export default function BookDetailsPanel({ book, relatedBooks, onClose }: BookDetailsPanelProps) {
  if (!book) return null;

  const handleBookClick = (book: GradedBook) => {
    const titleSlug = slugify(book.bookname);
    const levelSlug = slugify(book.languagelevel);
    window.location.href = `/library/${titleSlug}/${levelSlug}/${book.id}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed right-0 top-0 h-full md:w-1/2 w-full bg-white shadow-xl z-50 overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="flex gap-8">
            <div className="w-1/3">
              <div className="aspect-[3/4] relative">
                <LazyBookCover 
                  title={book.bookname}
                  author={book.author}
                  bookId={book.id}
                  coverUrl={book.cover_url}
                />
              </div>
            </div>
            <div className="w-2/3 space-y-4">
              <h2 className="text-3xl font-bold text-gray-800">{book.bookname}</h2>
              <p className="text-xl text-gray-600">By {book.author}</p>
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                Level {book.languagelevel}
              </div>
            </div>
          </div>

          <div className='mt-2'>
          <p className="text-gray-700 mt-4">
                {book.summary || 'No summary available for this book.'}
              </p>
          </div>

          <div className="mt-12 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              More books at {book.languagelevel} level
            </h3>
            <div className="grid grid-cols-3 gap-6">
              {relatedBooks.map((relatedBook) => (
                <div
                  key={relatedBook.id}
                  className="relative border border-white backdrop-blur-sm rounded-lg shadow-md overflow-hidden p-2 cursor-pointer"
                  onClick={() => handleBookClick(relatedBook)}
                >
                  <div className="relative aspect-[3/4]">
                    <LazyBookCover 
                      title={relatedBook.bookname}
                      author={relatedBook.author}
                      bookId={relatedBook.id}
                      coverUrl={relatedBook.cover_url}
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-gray-800 line-clamp-2">
                      {relatedBook.bookname}
                    </h3>
                    <p className="text-sm text-gray-600">
                      <span className="text-black">By</span> {relatedBook.author}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
