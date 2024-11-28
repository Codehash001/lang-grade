import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import { convertEPUBtoPDF } from '@/lib/epubConverter';
import { ensureDirectoriesExist, clearRequiredDirectories } from '@/lib/ensureDirectories';

// Utility to write a buffer to a file
async function writeBufferToFile(buffer: Uint8Array, filePath: string) {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(filePath, buffer, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

export async function POST(req: NextRequest) {
  await ensureDirectoriesExist();
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const fileName = file.name.replace(/\s/g, '_'); // Replace spaces with underscores
  const fileExt = path.extname(fileName).toLowerCase();
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  // Handle different file types
  try {
    let finalFilePath: string;
    let finalBuffer: Buffer;

    if (fileExt === '.epub') {
      // Save EPUB temporarily
      const tempEpubPath = path.join(process.cwd(), 'tmp', `temp_${fileName}`);
      await writeBufferToFile(fileBuffer, tempEpubPath);

      // Convert EPUB to PDF
      const { pdfPath, metadata } = await convertEPUBtoPDF(tempEpubPath);
      
      // Read the converted PDF
      finalBuffer = await fs.promises.readFile(pdfPath);
      finalFilePath = path.join(process.cwd(), 'docs', 'uploaded', `${path.parse(fileName).name}.pdf`);

      // Clean up temp EPUB file
      await fs.promises.unlink(tempEpubPath);
    } else if (fileExt === '.pdf') {
      finalBuffer = fileBuffer;
      finalFilePath = path.join(process.cwd(), 'docs', 'uploaded', fileName);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF or EPUB files.' },
        { status: 400 }
      );
    }

    // Load the PDF (whether original or converted from EPUB)
    const pdf = await PDFDocument.load(finalBuffer);

    // Check if the PDF has pages
    const totalPages = pdf.getPageCount();
    if (totalPages === 0) {
      return NextResponse.json({ error: 'Document contains no pages' }, { status: 400 });
    }

    // Create a new PDF for the first 25 pages (or fewer if the PDF has less than 25 pages)
    const newPdf = await PDFDocument.create();
    const pagesToCopy = Math.min(25, totalPages);
    const copiedPages = await newPdf.copyPages(pdf, Array.from({ length: pagesToCopy }, (_, i) => i));
    copiedPages.forEach((page) => newPdf.addPage(page));

    // Save the new PDF
    const newPdfBuffer = await newPdf.save();
    await writeBufferToFile(newPdfBuffer, finalFilePath);

    // Clear directories after successful processing
    clearRequiredDirectories();

    return NextResponse.json({
      message: 'File processed successfully',
      fileName: path.basename(finalFilePath),
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Error processing file. Please try again.' },
      { status: 500 }
    );
  }
}
