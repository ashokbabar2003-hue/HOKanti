import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-normal text-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "min-h-[clamp(2.25rem,5vw,2.75rem)] px-[clamp(1rem,2.5vw,1.5rem)] py-[clamp(0.5rem,1.2vw,0.75rem)] text-[clamp(0.85rem,2vw,0.95rem)]",
        sm: "min-h-[clamp(2rem,4vw,2.25rem)] rounded-md px-[clamp(0.75rem,2vw,1rem)] py-[clamp(0.35rem,1vw,0.5rem)] text-[clamp(0.75rem,1.8vw,0.85rem)]",
        lg: "min-h-[clamp(2.5rem,6vw,3.25rem)] rounded-md px-[clamp(1.5rem,4vw,2.25rem)] py-[clamp(0.65rem,1.5vw,1rem)] text-[clamp(0.95rem,2.2vw,1.1rem)]",
        icon: "h-[clamp(2rem,5vw,2.5rem)] w-[clamp(2rem,5vw,2.5rem)] shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
