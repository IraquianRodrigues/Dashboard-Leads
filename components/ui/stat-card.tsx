import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    iconColor: "text-zinc-500 dark:text-zinc-400",
  },
  primary: {
    iconColor: "text-[#25D366]",
  },
  success: {
    iconColor: "text-emerald-500",
  },
  warning: {
    iconColor: "text-amber-500",
  },
  danger: {
    iconColor: "text-red-500",
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
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn("h-4 w-4", styles.iconColor)}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs font-medium">
            <span
              className={cn(
                trend.value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              )}
            >
              {trend.value > 0 ? "+" : ""}{trend.value}%
            </span>
            <span className="text-muted-foreground/60 ml-1">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
