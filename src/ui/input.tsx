import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

type Color = "primary";

const input = tv({
  base: "rounded-full px-6 py-3 border",
  variants: {
    color: {
      primary: "",
    },
  },
  defaultVariants: {
    color: "primary",
  },
});

export function Input({
  color = "primary",
  ...attr
}: React.InputHTMLAttributes<HTMLInputElement> & {
  color?: Color;
}) {
  return (
    <input {...attr} className={twMerge(input({ color }), attr?.className)} />
  );
}
