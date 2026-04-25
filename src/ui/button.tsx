import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

type Color =
  | "primary"
  | "blue-light"
  | "blue-dark"
  | "lime"
  | "ghost"
  | "magenta"
  | "black";
type Size = "sm" | "md" | "lg";

const button = tv({
  base: "rounded-full transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  variants: {
    color: {
      primary: "bg-black text-white focus-visible:ring-black",
      black: "bg-black text-white focus-visible:ring-black",
      ghost: "text-black hover:bg-black/5 focus-visible:ring-black/25",
      lime: "bg-lime-400 text-black",
      "blue-light": "bg-blue-400 text-white",
      "blue-dark": "bg-blue-600 text-black",
      magenta:
        "bg-[#FF3495] text-white shadow-[0_10px_30px_rgba(255,52,149,0.28)] hover:brightness-95 focus-visible:ring-[#FF3495]",
    },
    size: {
      sm: "px-4 py-2 text-sm",
      md: "px-8 py-3 text-base",
      lg: "px-10 py-4 text-lg",
    },
  },
  defaultVariants: {
    size: "md",
    color: "primary",
  },
});

export function Button({
  color = "primary",
  size = "md",
  children,
  ...attr
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: Color;
  size?: Size;
  children: React.ReactNode;
}) {
  return (
    <button
      {...attr}
      className={twMerge(button({ color, size }), attr?.className)}
    >
      {children}
    </button>
  );
}
