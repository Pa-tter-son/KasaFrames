import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-kasa-black/10 bg-white/80 px-4 text-sm text-kasa-black shadow-sm outline-none transition placeholder:text-kasa-muted focus:border-kasa-gold/50 focus:ring-2 focus:ring-kasa-gold/20 dark:border-white/10 dark:bg-white/5 dark:text-kasa-cream dark:placeholder:text-kasa-sand/60",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
