import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const coverSizes = ['L', 'M', 'S'];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const author = searchParams.get('author');

  if (!title) {
    return NextResponse.json({ error: 'Missing title' }, { status: 400 });
  }

  // Construct search query with title and author if available
  const query = author 
    ? `${title}`.replace(/ /g, '+')
    : title.replace(/ /g, '+');
    
  const searchUrl = `https://openlibrary.org/search.json?q=${query}`;
  console.log('Searching OpenLibrary with URL:', searchUrl);

  try {
    // Search for the book
    const searchResponse = await axios.get(searchUrl, { timeout: 5000 });
    const docs = searchResponse.data.docs;
    console.log('OpenLibrary search response:', searchResponse.data);
    
    if (docs && docs.length > 0) {
      const book = docs[0];
      const coverI = book.cover_i;
      const foundAuthor = book.author_name?.[0];
      
      if (coverI) {
        // Try to get the highest resolution image available
        for (const size of coverSizes) {
          const imageUrl = `https://covers.openlibrary.org/b/id/${coverI}-${size}.jpg`;
          console.log('Trying cover URL:', imageUrl);
          
          try {
            const imageResponse = await axios.get(imageUrl, { 
              responseType: 'arraybuffer',
              timeout: 5000,
              validateStatus: (status) => status === 200
            });
            
            console.log('Successfully found cover image:', imageUrl);
            // If we successfully got the image, return it along with the author
            return NextResponse.json({
              coverUrl: imageUrl,
              author: foundAuthor || null
            });
          } catch (error) {
            console.error(`Error fetching ${size} cover:`, error);
            // Continue to the next size if this one fails
            continue;
          }
        }
      }
    }

    console.log('No cover found, returning placeholder');
    // If we get here, no cover was found
    return NextResponse.json({
      coverUrl: '/images/placeholder-book.png',
      author: null
    });
  } catch (error) {
    console.error('Error in book API:', error);
    return NextResponse.json({ error: 'Failed to fetch book info' }, { status: 500 });
  }
}
