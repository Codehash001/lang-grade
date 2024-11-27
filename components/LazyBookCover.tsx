'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchBookCover } from '@/lib/openLibraryService';
import { updateBookCoverUrl } from '@/lib/bookService';

interface LazyBookCoverProps {
  title: string;
  author?: string;
  bookId?: string;
  coverUrl?: string | null;
  className?: string;
}

export default function LazyBookCover({ 
  title, 
  author, 
  bookId,
  coverUrl: initialCoverUrl,
  className = '' 
}: LazyBookCoverProps) {
  const [coverUrl, setCoverUrl] = useState<string>(initialCoverUrl || '/images/placeholder-book.png');
  const [isLoading, setIsLoading] = useState(!initialCoverUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchCover = async () => {
      if (initialCoverUrl || !title) {
        setIsLoading(false);
        return;
      }

      try {
        const newCoverUrl = await fetchBookCover(title, author);
        
        if (newCoverUrl) {
          setCoverUrl(newCoverUrl);
          setHasError(false);
          
          // Update the database with the new cover URL if we have a book ID
          if (bookId) {
            await updateBookCoverUrl(bookId, newCoverUrl);
          }
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error('Error fetching book cover:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoading) {
      fetchCover();
    }
  }, [title, author, bookId, initialCoverUrl, isLoading]);

  const handleImageError = () => {
    console.error('Image failed to load:', coverUrl);
    setHasError(true);
    setCoverUrl('/images/placeholder-book.png');
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isLoading ? (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg" />
      ) : (
        <Image
          src={hasError ? '/images/placeholder-book.png' : coverUrl}
          alt={`${title} cover`}
          fill
          className="object-cover rounded-lg"
          onError={handleImageError}
          unoptimized={coverUrl.includes('openlibrary.org')}
        />
      )}
    </div>
  );
}