"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { FilePlus, ImagePlusIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner';

export default function InitGradeUI() {
  const [file, setFile] = useState<File | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [summaryLength, setSummaryLength] = useState<string>("medium")
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file type
      const fileType = selectedFile.type
      if (fileType === 'application/pdf' || fileType === 'application/epub+zip') {
        setFile(selectedFile)
      } else {
        toast.error('Please upload a PDF or EPUB file')
      }
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      const imageFiles = Array.from(selectedFiles).filter(file => 
        file.type.startsWith('image/')
      )
      if (imageFiles.length === 0) {
        toast.error('Please select valid image files')
        return
      }
      setImages(imageFiles)
      setFile(null) // Clear any previously selected single file
    }
  }

  const handleSubmit = async () => {
    if (!file && images.length === 0) {
      toast.error('Please upload a file or images first')
      return
    }

    setIsUploading(true)
    const formData = new FormData()

    try {
      if (images.length > 0) {
        // Upload images to be converted to PDF
        const imageFormData = new FormData()
        images.forEach((image, index) => {
          imageFormData.append('images', image)
        })

        const imageResponse = await fetch('/api/convert-images', {
          method: 'POST',
          body: imageFormData,
        })

        if (!imageResponse.ok) {
          throw new Error('Failed to convert images to PDF')
        }

        const pdfArrayBuffer = await imageResponse.arrayBuffer();
        const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' } as BlobPropertyBag);
        const pdfFile = new File([pdfBlob], 'converted-images.pdf', { type: 'application/pdf' } as FilePropertyBag);
        formData.append('file', pdfFile)
      } else {
        formData.append('file', file as Blob)
      }

      formData.append('length', summaryLength)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      router.push(`/graded/${data.fileName}?length=${summaryLength}`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="lg:w-1/2 w-full flex justify-center h-full">
    <div 
      className="w-full max-w-md p-8 bg-white md:rounded-3xl rounded-t-[50px] shadow-2xl"
      // onDragOver={handleDragOver}
      // onDrop={handleDrop}
    >
      <div className="text-center mb-6">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Upload your document</h3>
        <p className="mt-1 text-xs text-gray-500">PDF, EPUB upto 50MB</p>
      </div>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center flex flex-col items-center">
          <FilePlus className='w-10 h-10 text-gray-400'/>
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-700"
            >
              <span>Upload a file</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className='text-xs font-semibold'>OR</p>
          <div className='w-full flex items-center justify-center mt-4'>
            <label htmlFor="image-upload">
              <span className='flex items-center justify-center border-2 border-trasparent cursor-pointer px-4 py-2 text-xs rounded-3xl bg-transparent border hover:bg-transparent hover:border-2 hover:border-gray-300 hover:shadow text-black'>
                <ImagePlusIcon className="mr-2 w-5 h-5" /> Upload Book Images
              </span>
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                className="sr-only"
                onChange={handleImageUpload}
              />
            </label>
          </div>
        </div>
      </div>
      {(file || images.length > 0) && (
        <div className="mt-4 text-sm text-gray-500 flex gap-2 p-2 rounded-lg shadow">
          <FilePlus className="h-4 w-4" />
          <span>{file ? file.name : `${images.length} images selected`}</span>
        </div>
      )}
      <div className='flex space-x-2 items-center justify-center mt-4'>
      <Select onValueChange={setSummaryLength} defaultValue={summaryLength}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Summary Length" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Choose Summary Length</SelectLabel>
          <SelectItem value="short">Short</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="long">Long</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
    <Button 
      className="w-full" 
      onClick={handleSubmit} 
      disabled={isUploading || (!file && images.length === 0)}
    >
      {isUploading ? 'Processing...' : 'Grade Document'}
    </Button>
      </div>
    </div>
  </div>
  )
}
