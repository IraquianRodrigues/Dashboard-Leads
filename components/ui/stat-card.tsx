import * as React from "react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
  }
  className?: string
  variant?: "default" | "primary" | "success" | "warning" | "danger"
}

const variantStyles = {
  default: {
    iconBg: "bg-muted/50",
    iconColor: "text-foreground",
    border: "border-l-border",
  },
  primary: {
    iconBg: "bg-[var(--whatsapp-light-green)]",
    iconColor: "text-[var(--whatsapp-green)]",
    border: "border-l-[var(--whatsapp-green)]",
  },
  success: {
    iconBg: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-500",
    border: "border-l-green-500",
  },
  warning: {
    iconBg: "bg-orange-50 dark:bg-orange-950/30",
    iconColor: "text-orange-500",
    border: "border-l-orange-500",
  },
  danger: {
    iconBg: "bg-red-50 dark:bg-red-950/30",
    iconColor: "text-red-500",
    border: "border-l-red-500",
  },
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  variant = "default",
}: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-l-4 bg-card p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        styles.border,
        className
      )}
    >
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110",
              styles.iconBg
            )}
          >
            <div className={cn("h-5 w-5", styles.iconColor)}>{icon}</div>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 text-xs font-medium">
            <span
              className={cn(
                trend.value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}
            >
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  )
}
