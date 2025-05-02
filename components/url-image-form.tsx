"use client"

import type React from "react"

import { useState } from "react"
import { LinkIcon, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { ImageItem } from "@/data/images"

interface UrlImageFormProps {
  onImageAdded: (newImage: ImageItem) => void
}

export function UrlImageForm({ onImageAdded }: UrlImageFormProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageUrl.trim()) {
      setError("请输入有效的图片URL")
      return
    }

    // 检查URL是否是图片格式
    const isImageUrl = /\.(jpeg|jpg|gif|png|webp|avif|svg)(\?.*)?$/i.test(imageUrl)
    if (!isImageUrl) {
      setError("URL必须是图片格式 (JPEG, PNG, GIF, WEBP, AVIF, SVG)")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 获取图片尺寸
      const dimensions = await getImageDimensions(imageUrl)

      // 创建新的图片项
      const newImage: ImageItem = {
        id: Date.now(),
        src: imageUrl,
        width: dimensions.width,
        height: dimensions.height,
        alt: `URL Image ${new Date().toLocaleString()}`,
        tags: ["网络图片"],
      }

      onImageAdded(newImage)
      setImageUrl("")
    } catch (err) {
      setError("无法加载图片，请检查URL是否有效且可访问")
      console.error("加载图片出错:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // 获取图片尺寸
  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()

      // 设置跨域属性以避免CORS问题
      img.crossOrigin = "anonymous"

      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }

      img.onerror = () => {
        reject(new Error(`无法加载图片: ${url}`))
      }

      img.src = url
    })
  }

  return (
    <div className="w-full mb-6 p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-medium mb-4">通过URL添加图片</h3>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder="输入图片URL (例如: https://example.com/image.jpg)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "加载中..." : "添加图片"}
          {!isLoading && <PlusCircle className="ml-2 h-4 w-4" />}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground mt-2">支持JPEG, PNG, GIF, WEBP, AVIF, SVG格式的图片URL</p>
    </div>
  )
}
