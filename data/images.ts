// 图片数据存储在单独的文件中，便于维护
export interface ImageItem {
  id: number
  src: string
  width: number
  height: number
  alt: string
  tags: string[]
  file?: File // 可选的原始文件引用，用于用户上传的图片
}

// 示例图片数据 - 在实际应用中，这些数据可以从API获取
export const galleryImages: ImageItem[] = [
  {
    id: 1,
    src: "/placeholder.svg?height=400&width=300",
    width: 300,
    height: 400,
    alt: "Gallery image 1",
    tags: ["nature"],
  },
  {
    id: 2,
    src: "/placeholder.svg?height=300&width=300",
    width: 300,
    height: 300,
    alt: "Gallery image 2",
    tags: ["urban"],
  },
  {
    id: 3,
    src: "/placeholder.svg?height=500&width=300",
    width: 300,
    height: 500,
    alt: "Gallery image 3",
    tags: ["portrait"],
  },
  {
    id: 4,
    src: "/placeholder.svg?height=350&width=300",
    width: 300,
    height: 350,
    alt: "Gallery image 4",
    tags: ["nature"],
  },
  {
    id: 5,
    src: "/placeholder.svg?height=450&width=300",
    width: 300,
    height: 450,
    alt: "Gallery image 5",
    tags: ["urban"],
  },
  {
    id: 6,
    src: "/placeholder.svg?height=380&width=300",
    width: 300,
    height: 380,
    alt: "Gallery image 6",
    tags: ["portrait"],
  },
  {
    id: 7,
    src: "/placeholder.svg?height=320&width=300",
    width: 300,
    height: 320,
    alt: "Gallery image 7",
    tags: ["nature"],
  },
  {
    id: 8,
    src: "/placeholder.svg?height=400&width=300",
    width: 300,
    height: 400,
    alt: "Gallery image 8",
    tags: ["urban"],
  },
  {
    id: 9,
    src: "/placeholder.svg?height=360&width=300",
    width: 300,
    height: 360,
    alt: "Gallery image 9",
    tags: ["portrait"],
  },
  {
    id: 10,
    src: "/placeholder.svg?height=420&width=300",
    width: 300,
    height: 420,
    alt: "Gallery image 10",
    tags: ["nature"],
  },
  {
    id: 11,
    src: "/placeholder.svg?height=380&width=300",
    width: 300,
    height: 380,
    alt: "Gallery image 11",
    tags: ["urban"],
  },
  {
    id: 12,
    src: "/placeholder.svg?height=340&width=300",
    width: 300,
    height: 340,
    alt: "Gallery image 12",
    tags: ["portrait"],
  },
  {
    id: 13,
    src: "/placeholder.svg?height=410&width=300",
    width: 300,
    height: 410,
    alt: "Gallery image 13",
    tags: ["nature"],
  },
  {
    id: 14,
    src: "/placeholder.svg?height=370&width=300",
    width: 300,
    height: 370,
    alt: "Gallery image 14",
    tags: ["urban"],
  },
  {
    id: 15,
    src: "/placeholder.svg?height=430&width=300",
    width: 300,
    height: 430,
    alt: "Gallery image 15",
    tags: ["portrait"],
  },
  {
    id: 16,
    src: "/placeholder.svg?height=390&width=300",
    width: 300,
    height: 390,
    alt: "Gallery image 16",
    tags: ["nature"],
  },
]
