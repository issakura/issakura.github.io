"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import Masonry from "react-masonry-css"
import { Search, ArrowUpCircle, Upload, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Lightbox } from "@/components/lightbox"
import { UploadArea } from "@/components/upload-area"
import type { ImageItem } from "@/data/images"

// 瀑布流布局的断点配置
const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
}

export default function GalleryPage() {
  const [allImages, setAllImages] = useState<ImageItem[]>([])
  const [filteredImages, setFilteredImages] = useState<ImageItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showUploadArea, setShowUploadArea] = useState(true)

  // 灯箱状态
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 处理滚动以显示/隐藏回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 根据搜索词筛选图片
  useEffect(() => {
    let filtered = [...allImages]

    if (searchTerm) {
      filtered = filtered.filter((img) => img.alt.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    setFilteredImages(filtered)
  }, [searchTerm, allImages])

  // 处理上传的图片
  const handleImagesUploaded = (newImages: ImageItem[]) => {
    setAllImages((prevImages) => [...newImages, ...prevImages])
    setShowUploadArea(false)
  }

  // 打开灯箱并设置当前图片
  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  // 关闭灯箱
  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  // 在灯箱中导航到新图片
  const navigateToImage = (newIndex: number) => {
    setCurrentImageIndex(newIndex)
  }

  // 滚动到顶部函数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // 切换上传区域显示
  const toggleUploadArea = () => {
    setShowUploadArea((prev) => !prev)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">图片查看器</h1>

            {allImages.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="搜索图片..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={toggleUploadArea} variant={showUploadArea ? "default" : "outline"}>
                  <Upload className="h-4 w-4 mr-2" />
                  {showUploadArea ? "取消" : "上传"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showUploadArea && <UploadArea onImagesUploaded={handleImagesUploaded} />}

        {allImages.length > 0 ? (
          <>
            {filteredImages.length > 0 ? (
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="flex w-auto -ml-4"
                columnClassName="pl-4 bg-clip-padding"
              >
                {filteredImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    className="mb-4 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: Math.min(index * 0.05, 1), // 限制最大延迟为1秒
                      ease: "easeOut",
                    }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="relative group cursor-pointer" onClick={() => openLightbox(index)}>
                      <Image
                        src={image.src || "/placeholder.svg"}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        unoptimized={true} // 避免Next.js的图片优化，防止本地blob URL问题
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-4 w-full">
                          <p className="text-white text-sm font-medium truncate">{image.alt}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </Masonry>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <Search className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">没有找到匹配的图片</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">请尝试其他搜索词</p>
                <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                  清除搜索
                </Button>
              </div>
            )}
          </>
        ) : !showUploadArea ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ImageIcon className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">没有图片</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-md">点击下方按钮上传图片或文件夹</p>
            <Button className="mt-6" onClick={() => setShowUploadArea(true)}>
              <Upload className="h-4 w-4 mr-2" />
              上传图片
            </Button>
          </div>
        ) : null}
      </main>

      {/* 灯箱组件 */}
      <Lightbox
        images={filteredImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onNavigate={navigateToImage}
      />

      {/* 回到顶部按钮 */}
      {allImages.length > 0 && (
        <motion.button
          className={cn(
            "fixed right-6 bottom-6 p-2 rounded-full bg-primary text-primary-foreground shadow-lg z-20",
            showScrollTop ? "flex" : "hidden",
          )}
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: showScrollTop ? 1 : 0, scale: showScrollTop ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
          aria-label="回到顶部"
        >
          <ArrowUpCircle className="h-6 w-6" />
        </motion.button>
      )}
    </div>
  )
}
