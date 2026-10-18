import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
        secondary:
          "border border-cyan-500/30 bg-cyan-500/10 text-cyan-800 dark:text-cyan-300",
        destructive:
          "border border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300",
        outline:
          "border border-[var(--border-default)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]",
        gold:
          "border border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300",
        purple:
          "border border-purple-500/30 bg-purple-500/10 text-purple-800 dark:text-purple-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
