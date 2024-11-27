const GOOGLE_BOOKS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchBookCover(title: string, author?: string): Promise<string | null> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const query = `${title} ${author || ''}`.trim();
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_BOOKS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.items && data.items[0]?.volumeInfo?.imageLinks?.thumbnail) {
        // Replace http with https and remove zoom parameter for better quality
        const coverUrl = data.items[0].volumeInfo.imageLinks.thumbnail
          .replace('http://', 'https://')
          .replace('&zoom=1', '');
        
        return coverUrl;
      }

      if (attempt < MAX_RETRIES - 1) {
        console.log(`Attempt ${attempt + 1} failed, retrying after ${RETRY_DELAY}ms...`);
        await delay(RETRY_DELAY);
      }
    } catch (error) {
      console.error(`Error fetching book cover (attempt ${attempt + 1}):`, error);
      
      if (attempt < MAX_RETRIES - 1) {
        await delay(RETRY_DELAY);
      }
    }
  }

  return null;
}
