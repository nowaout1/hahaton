import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

type Color = "primary" | "blue-light" | "blue-dark" | "lime" | "ghost";
type Size = "sm" | "md" | "lg";

const button = tv({
  base: "rounded-full hover:opacity-85",
  variants: {
    color: {
      primary: "",
      ghost: "hover:bg-black/5",
      lime: "bg-lime-400 text-black",
      "blue-light": "bg-blue-400 text-white",
      "blue-dark": "bg-blue-600 text-black",
    },
    size: {
      sm: "",
      md: "px-8 py-3",
      lg: "",
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
