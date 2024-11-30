import { Metadata, ResolvingMetadata } from 'next'
import { getBookById } from '@/lib/bookService'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import DefaultBookCover from '@/components/DefaultBookCover'
import Link from 'next/link'

type Props = {
  params: { slug: string[] }
}

// Helper function to extract book ID from slug
function getBookIdFromSlug(slug: string[]): string {
  if (slug.length < 3) {
    notFound();
  }
  // The ID is always the last segment
  return slug[2];
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const bookId = getBookIdFromSlug(params.slug)
  const book = await getBookById(bookId)
  
  if (!book) {
    return {
      title: 'Book Not Found',
    }
  }

  return {
    title: `${book.bookname} | Language Grade`,
    description: `Read ${book.bookname} by ${book.author}. Language Level: ${book.languagelevel}`,
    openGraph: {
      title: book.bookname,
      description: `Read ${book.bookname} by ${book.author}. Language Level: ${book.languagelevel}`,
      images: [book.cover_url || ''],
    },
  }
}

export default async function BookPage({ params }: Props) {
  const bookId = getBookIdFromSlug(params.slug)
  const book = await getBookById(bookId)

  if (!book) {
    notFound()
  }

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden">
      <div className="flex-1 md:p-6 p-2 flex items-center justify-center">
        <div className="container  mx-auto">
          <div className=" shadow-xl rounded-lg h-full">
            <div className="flex flex-col md:flex-row">
              {/* Book Cover */}
              <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 p-4">
                <div className="relative aspect-[2/3] w-full rounded-md shadow">
                  {book.cover_url ? (
                    <Image
                      src={book.cover_url}
                      alt={`Cover of ${book.bookname}`}
                      fill
                      className="object-cover rounded-md shadow"
                      priority
                    />
                  ) : (
                    <DefaultBookCover
                      title={book.bookname}
                      author={book.author}
                    />
                  )}
                </div>
                <Link href={`/library/?level=${book.languagelevel}`}>
                  <div className="mt-4 w-full font-medium italic">
                    Explore similar level books →
                  </div>
                </Link>
              </div>

              {/* Book Details */}
              <div className="flex-1 p-4">
                <div className='flex flex-row space-x-4 items-center'>
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  Language Level: {book.languagelevel}
                </div>
                <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  {book.booklanguage}
                </div>
                </div>
                <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                  {book.bookname}
                </h1>
                <p className="mt-2 text-xl text-gray-600">
                  by {book.author}
                </p>
                <div className="mt-6 max-w-none">
                  <h2 className="text-2xl font-semibold text-gray-900">Summary</h2>
                  <div className=" max-h-[50vh] overflow-y-auto pr-4 mt-2">
                    <p className="text-gray-600 whitespace-pre-wrap pt-0">
                      {book.summary}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
