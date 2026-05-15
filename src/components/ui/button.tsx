import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kasa-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-kasa-cream disabled:pointer-events-none disabled:opacity-40 dark:focus-visible:ring-offset-kasa-charcoal [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-kasa-black text-kasa-cream shadow-lift hover:-translate-y-0.5 hover:bg-kasa-charcoal dark:bg-kasa-cream dark:text-kasa-black dark:hover:bg-white",
        secondary:
          "border border-kasa-black/10 bg-white/70 text-kasa-black backdrop-blur hover:border-kasa-gold/40 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-kasa-cream dark:hover:bg-white/10",
        ghost: "text-kasa-black hover:bg-kasa-black/5 dark:text-kasa-cream dark:hover:bg-white/10",
        gold: "bg-kasa-gold text-kasa-black hover:bg-kasa-goldsoft shadow-card",
        outline:
          "border border-kasa-black/15 bg-transparent text-kasa-black hover:border-kasa-black/40 dark:border-white/15 dark:text-kasa-cream dark:hover:border-white/35",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
