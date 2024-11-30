'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import DefaultBookCover from './DefaultBookCover';
import { toast } from 'sonner';

interface LazyBookCoverProps {
  title: string;
  author?: string;
  bookId?: string;
  coverUrl?: string | null;
  className?: string;
}

export default function LazyBookCover({ 
  title, 
  author = 'Unknown Author',
  coverUrl: initialCoverUrl,
  className = '' 
}: LazyBookCoverProps) {
  const [showDefault, setShowDefault] = useState(!initialCoverUrl);

  // Reset state when initialCoverUrl changes
  useEffect(() => {
    setShowDefault(!initialCoverUrl);
  }, [initialCoverUrl]);

  const handleImageError = () => {
    console.error('Image failed to load:', initialCoverUrl);
    setShowDefault(true);
    toast.error('Image failed to load');
  };

  if (showDefault) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <DefaultBookCover title={title} author={author} />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Image
        src={initialCoverUrl!}
        alt={`${title} cover`}
        fill
        className="object-cover rounded-lg"
        onError={handleImageError}
        unoptimized={true}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}