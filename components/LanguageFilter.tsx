'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from 'react';
import { getAllBooks } from '@/lib/bookService';

export default function LanguageFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLanguage = searchParams.get('language') || 'all';
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    const fetchLanguages = async () => {
      const books = await getAllBooks();
      const uniqueLanguages = [...new Set(books.map(book => book.booklanguage))];
      setLanguages(uniqueLanguages);
    };
    fetchLanguages();
  }, []);

  const handleLanguageChange = (language: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (language === 'all') {
      params.delete('language');
    } else {
      params.set('language', language);
    }
    router.push(`/library?${params.toString()}`);
  };

  return (
    <Select value={currentLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Languages</SelectItem>
        {languages.map((language) => (
          <SelectItem key={language} value={language}>
            {language}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
