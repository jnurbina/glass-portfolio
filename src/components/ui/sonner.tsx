"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { useMediaQuery } from "@/hooks/use-media-query"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const position = isDesktop ? "top-center" : "bottom-center"

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group z-[100]"
      position={position}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg bg-black",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
