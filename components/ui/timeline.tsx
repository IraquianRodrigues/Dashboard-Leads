import * as React from "react"
import { cn } from "@/lib/utils"

interface TimelineProps {
  children: React.ReactNode
  className?: string
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div className={cn("relative space-y-4", className)}>
      {children}
    </div>
  )
}

interface TimelineItemProps {
  children: React.ReactNode
  icon?: React.ReactNode
  iconColor?: string
  isLast?: boolean
  className?: string
}

export function TimelineItem({
  children,
  icon,
  iconColor = "bg-[var(--whatsapp-green)]",
  isLast = false,
  className,
}: TimelineItemProps) {
  return (
    <div className={cn("relative flex gap-4", className)}>
      {/* Icon and line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg",
            iconColor
          )}
        >
          {icon}
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-border mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        {children}
      </div>
    </div>
  )
}

interface TimelineContentProps {
  title: string
  description?: string
  timestamp: string
  children?: React.ReactNode
  className?: string
}

export function TimelineContent({
  title,
  description,
  timestamp,
  children,
  className,
}: TimelineContentProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold leading-none">{title}</h4>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <time className="text-xs text-muted-foreground whitespace-nowrap">
          {timestamp}
        </time>
      </div>
      {children}
    </div>
  )
}
