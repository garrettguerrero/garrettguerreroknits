'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PDFUploadProps {
  value?: string
  onChange: (url: string) => void
  label: string
}

export default function PDFUpload({ value, onChange, label }: PDFUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string | undefined>(
    value ? value.split('/').pop() : undefined
  )

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file')
        return
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('PDF must be less than 50MB')
        return
      }

      setUploading(true)

      try {
        // Create form data
        const formData = new FormData()
        formData.append('file', file)
        formData.append('bucket', 'patterns')

        // Upload to API
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const { path } = await response.json()

        setFileName(file.name)
        onChange(path)
        toast.success('PDF uploaded successfully')
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('Failed to upload PDF')
      } finally {
        setUploading(false)
      }
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  const removePDF = () => {
    setFileName(undefined)
    onChange('')
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {fileName ? (
        <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{fileName}</p>
                <p className="text-sm text-gray-500">PDF Pattern File</p>
              </div>
            </div>
            <button
              type="button"
              onClick={removePDF}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            isDragActive
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center">
            {uploading ? (
              <>
                <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin mb-4"></div>
                <p className="text-sm text-gray-600">Uploading PDF...</p>
              </>
            ) : (
              <>
                {isDragActive ? (
                  <FileText className="w-12 h-12 text-red-500 mb-4" />
                ) : (
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                )}
                <p className="text-sm text-gray-600 mb-2">
                  {isDragActive
                    ? 'Drop the PDF here'
                    : 'Drag and drop a PDF, or click to select'}
                </p>
                <p className="text-xs text-gray-500">PDF up to 50MB</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
