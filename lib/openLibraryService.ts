const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchBookCover(title: string, author?: string): Promise<string | null> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // First try to search by title and author
      const query = `${title} ${author || ''}`.trim();
      const searchResponse = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=key,cover_i`
      );

      if (!searchResponse.ok) {
        throw new Error(`Open Library search error: ${searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();
      
      if (searchData.docs && searchData.docs.length > 0) {
        const coverId = searchData.docs[0].cover_i;
        
        if (coverId) {
          // Use the large size cover for better quality
          return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
        }
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
