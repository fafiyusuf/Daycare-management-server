import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-yellow-500 text-yellow-100 hover:bg-yellow-600 dark:bg-blue-500 dark:text-blue-100 dark:hover:bg-blue-600",
        secondary:
          "border-transparent bg-yellow-400 text-yellow-900 hover:bg-yellow-500 dark:bg-blue-400 dark:text-blue-900 dark:hover:bg-blue-500",
        outline: "text-yellow-600 dark:text-blue-600 border border-yellow-500 dark:border-blue-500 hover:bg-yellow-50/10 dark:hover:bg-blue-50/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
