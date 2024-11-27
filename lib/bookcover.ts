import { z } from 'zod';

export const getCoverUrl = async (title: string, author: string): Promise<string> => {
  try {
    const searchQuery = encodeURIComponent(`${title} ${author}`);
    const response = await fetch(`https://openlibrary.org/search.json?q=${searchQuery}&limit=1`);
    const data = await response.json();

    if (data.docs && data.docs.length > 0 && data.docs[0].cover_i) {
      return `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-L.jpg`;
    }
    
    // Return placeholder if no cover found
    return '/images/placeholder-book.png';
  } catch (error) {
    console.error('Error fetching book cover:', error);
    return '/images/placeholder-book.png';
  }
}
