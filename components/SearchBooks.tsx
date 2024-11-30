'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';

interface SearchBooksProps {
  onSearch: (query: string) => void;
}

export default function SearchBooks({ onSearch }: SearchBooksProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle dialog close
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      onSearch(query);
    }, 300);
  }, [onSearch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsOpen(false);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      onSearch(searchQuery);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    setIsOpen(false);
    setSearchQuery('');
    onSearch('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {searchQuery ? (
        <Button 
          variant="outline" 
          size="icon"
          className="rounded-full"
          onClick={handleReset}
        >
          <X className="h-4 w-4" />
        </Button>
      ) : (
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-full"
          >
            <Search className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] top-[100px] bg-transparent border-none shadow-none [&>button]:text-white">
        <div className="flex items-center gap-2 text-white">
          <Search className="h-5 w-5 text-white  mb-2" />
          <Input
            ref={inputRef}
            placeholder="Search books by name, author, or language level..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent rounded-none text-white border-b-2 border-b-white"
            autoFocus
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
