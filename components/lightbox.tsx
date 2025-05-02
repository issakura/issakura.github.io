"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import type { ImageItem } from "@/data/images"

interface LightboxProps {
  images: ImageItem[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate: (newIndex: number) => void
}

export function Lightbox({ images, currentIndex, isOpen, onClose, onNavigate }: LightboxProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const currentImage = images[currentIndex]

  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)

  // 处理键盘导航
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowLeft") {
        navigatePrev()
      } else if (e.key === "ArrowRight") {
        navigateNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentIndex])

  // 防止滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // 导航到上一张图片
  const navigatePrev = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1)
    } else {
      // 循环到最后一张
      onNavigate(images.length - 1)
    }
  }

  // 导航到下一张图片
  const navigateNext = () => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1)
    } else {
      // 循环到第一张
      onNavigate(0)
    }
  }

  // 下载当前图片
  const downloadImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentImage) return

    // 如果是文件对象，直接下载
    if (currentImage.file) {
      const url = URL.createObjectURL(currentImage.file)
      const a = document.createElement("a")
      a.href = url
      a.download = currentImage.alt || "image"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return
    }

    // 否则，尝试从URL下载
    const a = document.createElement("a")
    a.href = currentImage.src
    a.download = currentImage.alt || "image"
    a.target = "_blank"
    a.rel = "noopener noreferrer"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // 触摸滑动处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      navigateNext()
    } else if (isRightSwipe) {
      navigatePrev()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  // 处理缩放
  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    setScale((prev) => Math.min(prev + 0.5, 5))
    setPosition({ x: 0, y: 0 }) // 重置位置
  }

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    setScale((prev) => {
      if (prev <= 1) return 1
      return prev - 0.5
    })
    setPosition({ x: 0, y: 0 }) // 重置位置
  }

  const resetZoom = (e: React.MouseEvent) => {
    e.stopPropagation()
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // 处理图片拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault()
      e.stopPropagation()

      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      setPosition((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }))

      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDragging(false)
  }

  // 处理双击放大/缩小
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (scale > 1) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    } else {
      setScale(2)
    }
  }

  // 处理鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation()
    if (e.deltaY < 0) {
      // 向上滚动，放大
      setScale((prev) => Math.min(prev + 0.2, 5))
    } else {
      // 向下滚动，缩小
      setScale((prev) => {
        if (prev <= 1) return 1
        return prev - 0.2
      })
    }
  }

  // 在关闭灯箱时重置缩放
  useEffect(() => {
    if (!isOpen) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 关闭按钮 */}
        <button
          className="absolute top-4 right-4 z-50 p-2 text-white bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">关闭</span>
        </button>

        {/* 下载按钮 */}
        <button
          className="absolute top-4 right-16 z-50 p-2 text-white bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          onClick={downloadImage}
        >
          <Download className="h-6 w-6" />
          <span className="sr-only">下载</span>
        </button>

        {/* 缩放控制按钮 */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <button
            className="p-2 text-white bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-5 w-5" />
            <span className="sr-only">放大</span>
          </button>
          <button
            className="p-2 text-white bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-5 w-5" />
            <span className="sr-only">缩小</span>
          </button>
          <button
            className="p-2 text-white bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            onClick={resetZoom}
          >
            <RotateCw className="h-5 w-5" />
            <span className="sr-only">重置</span>
          </button>
        </div>

        {/* 导航按钮 - 上一张 */}
        <button
          className="absolute left-4 z-50 p-2 text-white bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            navigatePrev()
          }}
        >
          <ChevronLeft className="h-8 w-8" />
          <span className="sr-only">上一张</span>
        </button>

        {/* 导航按钮 - 下一张 */}
        <button
          className="absolute right-4 z-50 p-2 text-white bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            navigateNext()
          }}
        >
          <ChevronRight className="h-8 w-8" />
          <span className="sr-only">下一张</span>
        </button>

        {/* 图片容器 */}
        <div className="relative max-w-[90vw] max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="relative flex items-center justify-center"
              style={{
                cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <Image
                ref={imageRef}
                src={currentImage.src || "/placeholder.svg"}
                alt={currentImage.alt}
                width={currentImage.width * 2}
                height={currentImage.height * 2}
                className="max-h-[85vh] w-auto object-contain"
                style={{
                  transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                  transition: isDragging ? "none" : "transform 0.2s",
                  transformOrigin: "center",
                }}
                priority
                unoptimized={true}
                onDoubleClick={handleDoubleClick}
                draggable={false}
              />

              {/* 图片信息 */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4">
                <h3 className="text-lg font-medium">{currentImage.alt}</h3>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 图片计数 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
