'use client';

interface DefaultBookCoverProps {
  title: string;
  author: string;
  className?: string;
}

export default function DefaultBookCover({ title, author, className = '' }: DefaultBookCoverProps) {
  // Generate a random gradient color for the cover
  const gradients = [
    'from-blue-400 to-purple-500',
    'from-green-400 to-blue-500',
    'from-purple-400 to-pink-500',
    'from-yellow-400 to-red-500',
    'from-pink-400 to-red-500',
  ];

  // Use the first character of the title as a hash to consistently get the same gradient
  const gradientIndex = title.charCodeAt(0) % gradients.length;
  const gradient = gradients[gradientIndex];

  return (
    <div 
      className={`relative w-full h-full rounded-lg shadow-lg overflow-hidden`}
    >
        <div className="max-w-sm mx-auto" id="bookCover">
   <div className="grid grid-cols-12 text-white">
    <div className="col-span-1 flex border-r border-gray-400 py-64"></div>
    <div className="col-span-11 flex flex-col justify-between p-6">
     <div className="mt-8">
      <p className="font-bold">{title}</p>
      <p className="text-xs mt-2 text-gray-100">By {author}</p>
     </div>
    </div>
   </div>
  </div>
    </div>

  );
}
