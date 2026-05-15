import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-2xl border border-kasa-black/10 bg-white/80 px-4 py-3 text-sm text-kasa-black shadow-sm outline-none transition placeholder:text-kasa-muted focus:border-kasa-gold/50 focus:ring-2 focus:ring-kasa-gold/20 dark:border-white/10 dark:bg-white/5 dark:text-kasa-cream dark:placeholder:text-kasa-sand/60",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
