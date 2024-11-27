'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languageLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function isInRange(bookLevel: string, filterLevel: string): boolean {
  if (filterLevel === 'all') return true;
  
  // If book level is a single level (e.g., "B1")
  if (!bookLevel.includes('-')) {
    return bookLevel === filterLevel;
  }
  
  // If book level is a range (e.g., "B2-C1")
  const [start, end] = bookLevel.split('-').map(l => l.trim());
  
  // Helper function to convert level to numeric value for comparison
  const levelToNumber = (level: string) => {
    const base = level.charAt(0).charCodeAt(0) - 'A'.charCodeAt(0);
    return base * 2 + (level.charAt(1) === '2' ? 1 : 0);
  };

  const startNum = levelToNumber(start);
  const endNum = levelToNumber(end);
  const filterNum = levelToNumber(filterLevel);

  // Check if filter level falls within the book's range (inclusive)
  return filterNum >= startNum && filterNum <= endNum;
}

export default function LibraryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLevel = searchParams.get('level') || 'all';

  const handleLevelChange = (level: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (level === 'all') {
      params.delete('level');
    } else {
      params.set('level', level);
    }
    router.push(`/library?${params.toString()}`);
  };

  return (
    <Select value={currentLevel} onValueChange={handleLevelChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Level" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Levels</SelectItem>
        {languageLevels.map((level) => (
          <SelectItem key={level} value={level}>
            {level}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
