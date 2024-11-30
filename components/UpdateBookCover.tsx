'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

interface UpdateBookCoverProps {
  bookId: string;
  currentCoverUrl: string | null | undefined;
  onUpdate: (newCoverUrl: string) => void;
}

export default function UpdateBookCover({ bookId, currentCoverUrl, onUpdate }: UpdateBookCoverProps) {
  const [coverUrl, setCoverUrl] = useState(currentCoverUrl || '');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Subscribe to real-time updates for this specific book
    const channel = supabase
      .channel(`book-${bookId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'graded_books',
          filter: `id=eq.${bookId}`
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          if (payload.new && payload.new.cover_url) {
            onUpdate(payload.new.cover_url);
          }
        }
      )
      .subscribe();

    return () => {
      // Cleanup subscription when component unmounts
      supabase.removeChannel(channel);
    };
  }, [bookId, supabase, onUpdate]);

  const handleUpdateCover = async () => {
    console.log('Starting update process...');
    console.log('Updating cover URL:', coverUrl);
    console.log('Book ID:', bookId);

    if (!coverUrl.trim()) {
      toast.error('Please enter a valid cover URL');
      return;
    }

    setIsLoading(true);
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (!storedUserInfo) {
        toast.error('Please sign in to update book covers');
        return;
      }

      const userInfo = JSON.parse(storedUserInfo);
      console.log('User info:', userInfo);

      if (!userInfo.email) {
        toast.error('User email not found. Please sign in again.');
        return;
      }

      console.log('Attempting update with user:', userInfo.email);

      const { data, error } = await supabase
        .from('graded_books')
        .update({ cover_url: coverUrl })
        .eq('id', bookId)
        .eq('useremail', userInfo.email)
        .select();

      console.log('Update response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No rows updated - permission denied or book not found');
        toast.error('You do not have permission to update this book cover');
        return;
      }

      console.log('Update successful:', data);
      setIsOpen(false);
      toast.success('Book cover has been updated successfully');
    } catch (error) {
      console.error('Error updating book cover:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update book cover');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUpdateCover();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil/>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Book Cover</DialogTitle>
          <DialogDescription>
            Enter a new URL for the book cover image. Make sure it's a valid image URL.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-4">
            <Input
              ref={inputRef}
              placeholder="Enter cover image URL"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button 
              onClick={handleUpdateCover} 
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Cover"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
