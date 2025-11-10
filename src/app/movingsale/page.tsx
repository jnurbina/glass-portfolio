"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, Instagram } from "lucide-react"
import Link from "next/link"

interface Item {
  id: number
  name: string
  price: number
  description: string
  imageUrl: string
  bgColor: string
  textColor: string
}

const items: Item[] = [
  {
    id: 1,
    name: "Modern Sofa",
    price: 450,
    description: "Comfortable 3-seater sofa, gray fabric, excellent condition",
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-[#E8DED1]",
    textColor: "text-black",
  },
  {
    id: 2,
    name: "Dining Table",
    price: 300,
    description: "Wooden dining table, seats 6, minor scratches",
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-[#1A1A2E]",
    textColor: "text-white",
  },
  {
    id: 3,
    name: "Bookshelf",
    price: 120,
    description: "5-tier bookshelf, dark wood, sturdy construction",
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-[#6B2C2C]",
    textColor: "text-white",
  },
  {
    id: 4,
    name: "Office Chair",
    price: 180,
    description: "Ergonomic office chair, black leather, adjustable",
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-black",
    textColor: "text-white",
  },
  {
    id: 5,
    name: "Coffee Table",
    price: 90,
    description: "Glass top coffee table with metal frame",
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-[#FFB5C5]",
    textColor: "text-black",
  },
  {
    id: 6,
    name: "Floor Lamp",
    price: 60,
    description: "Modern floor lamp, adjustable arm, works perfectly",
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-white",
    textColor: "text-black",
  },
  {
    id: 7,
    name: "Bed Frame",
    price: 250,
    description: "Queen size bed frame, metal construction, no mattress",
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-[#2C3E50]",
    textColor: "text-white",
  },
  {
    id: 8,
    name: "TV Stand",
    price: 140,
    description: 'TV stand with storage, fits up to 55" TV',
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-[#E8DED1]",
    textColor: "text-black",
  },
  {
    id: 9,
    name: "Nightstand",
    price: 75,
    description: "Two-drawer nightstand, matches bed frame",
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-[#6B2C2C]",
    textColor: "text-white",
  },
  {
    id: 10,
    name: "Desk",
    price: 200,
    description: "Large work desk with cable management",
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-black",
    textColor: "text-white",
  },
  {
    id: 11,
    name: "Dresser",
    price: 220,
    description: "6-drawer dresser, white finish, spacious",
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-white",
    textColor: "text-black",
  },
  {
    id: 12,
    name: "Area Rug",
    price: 110,
    description: "8x10 area rug, geometric pattern, clean",
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-[#FFB5C5]",
    textColor: "text-black",
  },
]

export default function MovingSalePage() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)

  const handleEmailInquiry = (item: Item) => {
    const subject = encodeURIComponent(`Inquiry about ${item.name}`)
    const body = encodeURIComponent(`Hi! I'm interested in your ${item.name} listed at $${item.price} OBO.\n\n`)
    window.location.href = `mailto:doscmusic@gmail.com?subject=${subject}&body=${body}`
  }

  const handleGeneralEmailInquiry = () => {
    const subject = encodeURIComponent(`Moving Sale Inquiry`)
    const body = encodeURIComponent(`Hi! I'm interested in learning more about your moving sale.\n\n`)
    window.location.href = `mailto:doscmusic@gmail.com?subject=${subject}&body=${body}`
  }

  const handleInstagramInquiry = () => {
    window.open("https://instagram.com/doscmusic", "_blank")
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] p-4 md:p-8 lg:p-12">
      <div className="flex justify-between items-start mb-8">
        <Link
          href="https://onejas.one"
          className="text-sm md:text-base font-medium hover:underline underline-offset-4 transition-all"
        >
          Return to 1J1
        </Link>
        <button
          onClick={() => setShowContactModal(true)}
          className="text-sm md:text-base font-medium hover:underline underline-offset-4 transition-all"
        >
          inquiries
        </button>
      </div>

      <header className="mb-8 md:mb-12 text-center">
        <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-bold uppercase tracking-tighter leading-none text-balance">
          Moving
          <br />
          Sale
        </h1>
      </header>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-8 md:p-12 rounded-lg flex items-center justify-center min-h-[200px] md:min-h-[250px]">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Furniture</h2>
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Electronics</h2>
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Clothing</h2>
          </div>
        </div>

        <div className="bg-black text-white p-8 md:p-12 rounded-lg flex items-center justify-center min-h-[200px] md:min-h-[250px]">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">By Dec</h2>
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Everything Must</h2>
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Go</h2>
          </div>
        </div>

        <div className="bg-[#2C3E50] text-white p-8 md:p-12 rounded-lg flex items-center justify-center min-h-[200px] md:min-h-[250px] md:col-span-2 lg:col-span-1">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">Pick-Ups</h2>
            <p className="text-lg md:text-xl font-semibold">North Hollywood,</p>
            <p className="text-lg md:text-xl font-semibold">NoHo Arts Dist</p>
            <div className="pt-4 space-y-1 text-sm md:text-base opacity-90">
              <p>@doscmusic</p>
              <p>doscmusic@gmail.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[280px]">
        {items.map((item, index) => {
          let spanClass = ""
          if (index === 0 || index === 5) spanClass = "md:row-span-2"
          if (index === 2 || index === 7) spanClass = "md:col-span-2"

          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`${item.bgColor} ${item.textColor} ${spanClass} rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-[0.98] hover:shadow-xl group relative`}
            >
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 relative overflow-hidden">
                  <img
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-lg uppercase tracking-wide">{item.name}</h3>
                  <p
                    className={`text-sm ${item.textColor === "text-white" ? "opacity-80" : "opacity-60"} line-clamp-2`}
                  >
                    {item.description}
                  </p>
                  <p className="font-bold text-xl">${item.price} OBO</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog
        open={!!selectedItem || showContactModal}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null)
            setShowContactModal(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedItem ? `Interested in ${selectedItem.name}?` : "Get in Touch"}
            </DialogTitle>
            <DialogDescription className="text-base">
              {selectedItem
                ? `Choose how you'd like to reach out about this item ($${selectedItem.price} OBO)`
                : "Choose how you'd like to reach out about the moving sale"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              size="lg"
              onClick={() => (selectedItem ? handleEmailInquiry(selectedItem) : handleGeneralEmailInquiry())}
              className="w-full gap-2"
            >
              <Mail className="h-5 w-5" />
              Email Inquiry
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleInstagramInquiry}
              className="w-full gap-2 bg-transparent"
            >
              <Instagram className="h-5 w-5" />
              Message on Instagram
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
