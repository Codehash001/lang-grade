import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { ensureDirectoryExists } from '@/lib/ensureDirectories';

export async function POST(req: NextRequest) {
  try {
    // Ensure temp directory exists
    ensureDirectoryExists('tmp');

    const formData = await req.formData();
    const images = formData.getAll('images') as File[];

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Process each image
    for (const image of images) {
      try {
        const imageBuffer = Buffer.from(await image.arrayBuffer());
        
        // Convert image to PNG format
        const pngBuffer = await sharp(imageBuffer)
          .png()
          .toBuffer();

        // Embed the PNG image in the PDF
        const pngImage = await pdfDoc.embedPng(pngBuffer);
        
        // Add a new page with the image
        const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: pngImage.width,
          height: pngImage.height,
        });
      } catch (imageError) {
        console.error(`Error processing image ${image.name}:`, imageError);
        // Continue with next image instead of failing completely
        continue;
      }
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Return the PDF directly
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="converted-images.pdf"',
      },
    });
  } catch (error) {
    console.error('Error converting images to PDF:', error);
    return NextResponse.json(
      { error: 'Failed to convert images to PDF' },
      { status: 500 }
    );
  }
}
