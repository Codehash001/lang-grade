interface GoogleBookInfo {
  title: string;
  authors?: string[];
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
}

interface GoogleBooksResponse {
  items?: Array<{
    volumeInfo: GoogleBookInfo;
  }>;
}

export async function getGoogleBookInfo(title: string): Promise<{
  coverUrl: string | null;
  author: string | null;
}> {
  if (!title) {
    return { coverUrl: null, author: null };
  }

  try {
    // Clean up the title for better search results
    const cleanTitle = title.replace(/[^\w\s]/g, ' ').trim();
    const query = encodeURIComponent(`intitle:${cleanTitle}`);
    
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1&langRestrict=en&fields=items(volumeInfo(title,authors,imageLinks))`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!response.ok) {
      console.error('Google Books API error:', response.status, response.statusText);
      return { coverUrl: null, author: null };
    }

    const data: GoogleBooksResponse = await response.json();

    if (!data?.items?.[0]?.volumeInfo) {
      return { coverUrl: null, author: null };
    }

    const bookInfo = data.items[0].volumeInfo;
    let imageUrl = bookInfo.imageLinks?.thumbnail || null;
    
    // Clean up and improve image URL if it exists
    if (imageUrl) {
      imageUrl = imageUrl
        .replace('http:', 'https:') // Ensure HTTPS
        .replace('zoom=1', 'zoom=3') // Higher quality
        .replace('&edge=curl', '') // Remove page curl effect
        .replace('&source=gbs_api', ''); // Remove API source parameter
    }
    
    return {
      coverUrl: imageUrl,
      author: bookInfo.authors?.[0] || null,
    };
  } catch (error) {
    console.error('Error fetching Google Books data:', error);
    return { coverUrl: null, author: null };
  }
}