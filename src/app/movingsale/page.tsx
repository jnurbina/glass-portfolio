"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, Instagram, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Item {
  id: number
  name: string
  price: number
  description: string
  imageUrl: string
  bgColor: string
  layout?: "row-span-2" | "col-span-2"
}

const items: Item[] = [
  {
    id: 1,
    name: "Modern Sofa",
    price: 450,
    description: "Comfortable 3-seater sofa, gray fabric, excellent condition. A centerpiece for any living room.",
    imageUrl: "/placeholder.svg?height=800&width=800",
    bgColor: "bg-[#E8DED1]",
    layout: "row-span-2",
  },
  {
    id: 2,
    name: "Dining Table",
    price: 300,
    description: "Solid wooden dining table, seats 6 comfortably. Perfect for family dinners. Minor wear.",
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-[#1A1A2E]",
  },
  {
    id: 3,
    name: "Bookshelf",
    price: 120,
    description: "5-tier bookshelf, dark wood finish. Sturdy construction, great for books or display items.",
    imageUrl: "/placeholder.svg?height=400&width=800",
    bgColor: "bg-[#6B2C2C]",
    layout: "col-span-2",
  },
  {
    id: 4,
    name: "Office Chair",
    price: 180,
    description: "Ergonomic office chair, black leather with adjustable height and tilt. Like new.",
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-black",
  },
  {
    id: 5,
    name: "Coffee Table",
    price: 90,
    description: "Sleek glass top coffee table with a minimalist metal frame. Adds a modern touch.",
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-[#FFB5C5]",
  },
  {
    id: 6,
    name: "Floor Lamp",
    price: 60,
    description: "Modern floor lamp with an adjustable arm and warm light. Works perfectly.",
    imageUrl: "/placeholder.svg?height=800&width=800",
    bgColor: "bg-white",
    layout: "row-span-2",
  },
  {
    id: 7,
    name: "Bed Frame",
    price: 250,
    description: "Queen size bed frame, sturdy metal construction, easy to assemble. No mattress.",
    imageUrl: "/placeholder.svg?height=400&width=800",
    bgColor: "bg-[#2C3E50]",
    layout: "col-span-2",
  },
  {
    id: 8,
    name: "TV Stand",
    price: 140,
    description: 'TV stand with ample storage, fits up to a 55" TV. Clean and functional design.',
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-[#E8DED1]",
  },
  {
    id: 9,
    name: "Nightstand",
    price: 75,
    description: "Two-drawer nightstand, matches the bed frame. Perfect for bedside essentials.",
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-[#6B2C2C]",
  },
  {
    id: 10,
    name: "Desk",
    price: 200,
    description: "Large work desk with built-in cable management. Ideal for a home office setup.",
    imageUrl: "/placeholder.svg?height=400&width=400",
    bgColor: "bg-black",
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
    <div className="min-h-screen bg-[#F5F5F0] p-4 font-sans text-stone-900 md:p-8 lg:p-12">
      <div className="mx-auto max-w-7xl">
        <nav className="flex justify-between items-center mb-12">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Return to Portfolio
          </Link>
          <button
            onClick={() => setShowContactModal(true)}
            className="text-sm font-medium hover:underline underline-offset-4 text-stone-600 hover:text-stone-900 transition-colors"
          >
            Inquiries
          </button>
        </nav>

        <header className="mb-12 md:mb-16 text-center">
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-bold uppercase tracking-tight leading-none">
            Moving Sale
          </h1>
          <p className="mt-2 text-base md:text-lg text-stone-500">All items must go by December. Pick-up in North Hollywood.</p>
        </header>

        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-8 rounded-lg flex flex-col justify-center items-center text-center aspect-square md:aspect-auto">
            <h2 className="text-xl font-bold uppercase tracking-tight text-stone-800">Furniture</h2>
            <h2 className="text-xl font-bold uppercase tracking-tight text-stone-800">Electronics</h2>
            <h2 className="text-xl font-bold uppercase tracking-tight text-stone-800">& Clothing</h2>
          </div>
          <div className="bg-black text-white p-8 rounded-lg flex flex-col justify-center items-center text-center aspect-square md:aspect-auto">
            <h2 className="text-3xl font-bold uppercase tracking-tight">By Dec</h2>
            <p className="text-lg font-medium text-neutral-300">Everything Must Go</p>
          </div>
          <div className="bg-[#2C3E50] text-white p-8 rounded-lg flex flex-col justify-center items-center text-center aspect-square md:aspect-auto">
            <h2 className="text-2xl font-bold uppercase tracking-tight">Pick-Ups</h2>
            <p className="font-semibold">NoHo Arts District</p>
            <div className="mt-2 text-sm text-slate-300">
              <p>@doscmusic</p>
              <p>doscmusic@gmail.com</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-[minmax(300px,_auto)]">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={cn(
                "rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group relative flex flex-col justify-end",
                item.bgColor,
                item.layout,
              )}
            >
              <div className="absolute inset-0">
                <img
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                />
              </div>
              <div className="relative p-4 space-y-1 bg-gradient-to-t from-black/60 via-black/30 to-transparent text-white">
                <h3 className="font-bold text-lg uppercase tracking-wide text-shadow-md">{item.name}</h3>
                <p className="text-sm opacity-90 text-shadow-sm line-clamp-2">{item.description}</p>
                <p className="font-bold text-xl text-shadow-sm">${item.price} OBO</p>
              </div>
            </div>
          ))}
        </div>
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
        <DialogContent className="sm:max-w-md bg-white text-black border-2 border-gray-300">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {selectedItem ? `Interested in ${selectedItem.name}?` : "Get in Touch"}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              {selectedItem
                ? `Choose how you'd like to reach out about this item ($${selectedItem.price} OBO)`
                : "Choose how you'd like to reach out about the moving sale"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              size="lg"
              onClick={() => (selectedItem ? handleEmailInquiry(selectedItem) : handleGeneralEmailInquiry())}
              className="w-full gap-2 bg-stone-900 hover:bg-stone-800 text-white"
            >
              <Mail className="h-5 w-5" />
              Email Inquiry
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleInstagramInquiry}
              className="w-full gap-2 border-stone-300 text-stone-800 hover:bg-stone-100"
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
