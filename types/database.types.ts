export type GradedBook = {
  cover_url: string | null | undefined;
  id: string;
  created_at: string;
  useremail: string;
  bookname: string;
  author: string;
  summary: string;
  languagelevel: string;
  coverimageurl?: string;
}

export type Database = {
  public: {
    Tables: {
      graded_books: {
        Row: GradedBook;
        Insert: Omit<GradedBook, 'id' | 'created_at'>;
        Update: Partial<Omit<GradedBook, 'id' | 'created_at'>>;
      };
    };
  };
};
