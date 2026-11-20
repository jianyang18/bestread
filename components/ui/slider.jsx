import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-[3px] w-full grow overflow-hidden rounded-full bg-muted-foreground/30">
      <SliderPrimitive.Range className="absolute h-full rounded-full bg-foreground" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 border-[1.5px] border-foreground bg-background [border-radius:52%_48%_55%_45%/48%_55%_45%_52%] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
