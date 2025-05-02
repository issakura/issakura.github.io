"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FolderUp, X, AlertCircle, FileImage, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import type { ImageItem } from "@/data/images"

interface UploadAreaProps {
  onImagesUploaded: (newImages: ImageItem[]) => void
}

export function UploadArea({ onImagesUploaded }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploadStats, setUploadStats] = useState({ total: 0, processed: 0 })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  // 处理拖放事件
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  // 处理文件上传
  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setProgress(0)
    setError(null)

    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(
      (file) => file.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(file.name),
    )

    if (imageFiles.length === 0) {
      setError("未找到图片文件。请上传JPG、PNG、GIF、WEBP或SVG格式的图片。")
      setIsUploading(false)
      return
    }

    setUploadStats({ total: imageFiles.length, processed: 0 })

    const newImages: ImageItem[] = []
    let processedCount = 0

    for (const file of imageFiles) {
      try {
        // 创建文件的URL
        const fileUrl = URL.createObjectURL(file)

        // 获取图片尺寸
        const dimensions = await getImageDimensions(file)

        // 提取文件路径（如果是从文件夹上传）
        const filePath = file.webkitRelativePath || file.name

        // 创建新的图片项
        const newImage: ImageItem = {
          id: Date.now() + processedCount, // 使用时间戳+索引作为唯一ID
          src: fileUrl,
          width: dimensions.width,
          height: dimensions.height,
          alt: filePath,
          tags: [],
          file: file, // 保存原始文件引用
        }

        newImages.push(newImage)
        processedCount++

        // 更新进度
        setUploadStats((prev) => ({ ...prev, processed: processedCount }))
        setProgress(Math.round((processedCount / imageFiles.length) * 100))

        // 模拟网络延迟，使进度条更平滑
        await new Promise((resolve) => setTimeout(resolve, 50))
      } catch (err) {
        console.error("处理图片时出错:", file.name, err)
      }
    }

    // 完成上传
    setIsUploading(false)

    if (newImages.length > 0) {
      onImagesUploaded(newImages)
    } else {
      setError("无法处理上传的图片。请尝试其他图片。")
    }
  }

  // 获取图片尺寸
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
        URL.revokeObjectURL(img.src) // 释放URL
      }
      img.onerror = () => {
        reject(new Error(`无法加载图片: ${file.name}`))
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const { files } = e.dataTransfer
    processFiles(files)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
  }

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
  }

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const triggerFolderUpload = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click()
    }
  }

  const cancelUpload = () => {
    setIsUploading(false)
    setProgress(0)
    setError(null)
  }

  return (
    <div className="w-full mb-8">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>上传错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isUploading ? (
        <div className="w-full p-6 border-2 border-dashed rounded-lg bg-muted/50">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <FileImage className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">
                正在处理图片 ({uploadStats.processed}/{uploadStats.total})
              </span>
            </div>
            <Progress value={progress} className="w-full h-2" />
            <Button variant="outline" size="sm" onClick={cancelUpload}>
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "w-full p-8 border-2 border-dashed rounded-lg transition-colors duration-200",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 bg-muted/20",
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-muted p-3">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-lg font-semibold">上传图片</h3>
              <p className="text-sm text-muted-foreground">拖放图片文件或文件夹到此处，或点击下方按钮选择</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={triggerFileUpload}>
                <Upload className="h-4 w-4 mr-2" />
                选择文件
              </Button>
              <Button variant="outline" onClick={triggerFolderUpload}>
                <FolderUp className="h-4 w-4 mr-2" />
                选择文件夹
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">支持JPG、PNG、GIF、WEBP、SVG格式</p>
          </div>

          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {/* 隐藏的文件夹输入 */}
          <input
            ref={folderInputRef}
            type="file"
            // @ts-ignore - webkitdirectory属性在标准TypeScript类型中不存在
            webkitdirectory=""
            directory=""
            multiple
            className="hidden"
            onChange={handleFolderInputChange}
          />
        </div>
      )}
    </div>
  )
}
