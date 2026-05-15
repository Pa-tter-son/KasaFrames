import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-kasa-black/10 bg-kasa-black text-kasa-cream dark:border-white/10 dark:bg-white dark:text-kasa-black",
        outline:
          "border-kasa-black/10 text-kasa-black dark:border-white/15 dark:text-kasa-cream",
        gold: "border-kasa-gold/40 bg-kasa-gold/10 text-kasa-black dark:text-kasa-cream",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
