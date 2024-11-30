import { supabase } from './supabase';
import type { Database, GradedBook } from '@/types/database.types';
import { fetchBookCover } from './openLibraryService';

export async function saveGradedBook(book: Omit<GradedBook, 'id' | 'created_at' | 'cover_url'> & { booklanguage: string }) {
  try {
    console.log('Checking for existing book:', book.bookname);
    
    // Normalize the book name and author for comparison
    const normalizedBookName = book.bookname.toLowerCase().trim();
    const normalizedAuthor = book.author.toLowerCase().trim();
    
    // Check if a book with the same name and author already exists
    const { data: existingBooks, error: searchError } = await supabase
      .from('graded_books')
      .select('*')
      .or(`bookname.ilike.${normalizedBookName},author.ilike.${normalizedAuthor}`);

    if (searchError) {
      console.error('Error checking for existing book:', searchError);
      throw searchError;
    }

    // Check for exact matches (case-insensitive)
    const exactMatch = existingBooks?.find(existing => 
      existing.bookname.toLowerCase().trim() === normalizedBookName &&
      existing.author.toLowerCase().trim() === normalizedAuthor
    );

    if (exactMatch) {
      console.log('Book already exists:', exactMatch);
      
      // If the existing book doesn't have a cover URL, try to fetch one
      if (!exactMatch.cover_url) {
        const coverUrl = await fetchBookCover(exactMatch.bookname, exactMatch.author);
        if (coverUrl) {
          const { data: updatedBook } = await supabase
            .from('graded_books')
            .update({ cover_url: coverUrl })
            .eq('id', exactMatch.id)
            .select()
            .single();
          
          return updatedBook || exactMatch;
        }
      }
      
      return exactMatch;
    }

    // If no exact match found, proceed with saving the new book
    console.log('Book does not exist, saving new book:', book);
    const coverUrl = await fetchBookCover(book.bookname, book.author);
    
    const { data, error } = await supabase
      .from('graded_books')
      .insert({ ...book, cover_url: coverUrl })
      .select()
      .single();

    if (error) {
      console.error('Error saving book to Supabase:', error);
      throw error;
    }

    console.log('Successfully saved book:', data);
    return data;
  } catch (error) {
    console.error('Failed to save book:', error);
    throw error;
  }
}

export async function getAllBooks() {
  const { data, error } = await supabase
    .from('graded_books')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getBookById(id: string): Promise<GradedBook | null> {
  try {
    const { data, error } = await supabase
      .from('graded_books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching book by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching book by ID:', error);
    return null;
  }
}

export async function getBookByIdSupabase(id: string) {
  const { data, error } = await supabase
    .from('graded_books')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateBookCoverUrl(bookId: string, coverUrl: string | null) {
  const { data, error } = await supabase
    .from('graded_books')
    .update({ cover_url: coverUrl })
    .eq('id', bookId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Search books by name, author, or language level
export async function searchBooks(query: string) {
  const { data, error } = await supabase
    .from('graded_books')
    .select('*')
    .or(`bookname.ilike.%${query}%,author.ilike.%${query}%,languagelevel.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getUserBooks(userEmail: string) {
  const { data, error } = await supabase
    .from('graded_books')
    .select('*')
    .eq('useremail', userEmail)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}
