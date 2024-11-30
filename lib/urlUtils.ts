import type { GradedBook } from '@/types/database.types'

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '')          // Trim - from end of text
}

export function generateBookUrl(book: GradedBook): string {
  const titleSlug = slugify(book.bookname)
  const levelSlug = slugify(book.languagelevel)
  return `/library/${titleSlug}/${levelSlug}/${book.id}`
}
