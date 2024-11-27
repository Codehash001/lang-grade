'use client';

import React, { useState, useEffect } from 'react';
import { getAllBooks } from '@/lib/bookService';
import type { GradedBook } from '@/types/database.types';
import LazyBookCover from '@/components/LazyBookCover';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const LANGUAGE_LEVELS = [
  { label: '-- Any Level --', value: '' },
  { label: 'Absolute Beginner (~A0)', value: 'A0' },
  { label: 'Beginner (~A1)', value: 'A1' },
  { label: 'Upper Beginner (~A2)', value: 'A2' },
  { label: 'Intermediate (~B1)', value: 'B1' },
  { label: 'Upper Intermediate (~B2)', value: 'B2' },
  { label: 'Advanced (~C1)', value: 'C1' },
  { label: 'Very Advanced (~C2)', value: 'C2' },
];

const BooksPage = async () => {
  const [books, setBooks] = useState<GradedBook[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
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

  const filteredBooks = selectedLevel
    ? books.filter(book => book.languagelevel.includes(selectedLevel))
    : books;

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #ebedff 0%, #dbf8ff 50%, #f3f2f8 100%)' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-800 text-center"
        >
          Library
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-xs mx-auto"
        >
          <select 
            id="languageLevel" 
            className="w-full p-3 rounded-lg bg-white/70 backdrop-blur-sm border border-gray-200 text-gray-700 focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            onChange={(e) => {
              const level = e.target.value;
              const url = new URL(window.location.href);
              if (level === 'all') {
                url.searchParams.delete('level');
              } else {
                url.searchParams.set('level', level);
              }
              window.history.pushState({}, '', url);
              window.location.reload();
            }}
          >
            <option value="all">All Levels</option>
            {LANGUAGE_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>{level.value}</option>
            ))}
          </select>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Loading books...</div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">No books found</div>
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
          >
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md overflow-hidden transition-transform duration-300"
              >
                <div className="relative aspect-[3/4]">
                  <LazyBookCover 
                    title={book.bookname} 
                    author={book.author} 
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-gray-800 line-clamp-2">
                    {book.bookname}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {book.author}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {book.languagelevel}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BooksPage;
