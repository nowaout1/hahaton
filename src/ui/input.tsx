import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

type Color = "primary";

const input = tv({
  base: "min-w-0 rounded-full border border-black bg-white px-6 py-3 text-base text-black outline-none transition placeholder:text-black/45 focus:border-[#FF3495] focus:ring-4 focus:ring-[#FF3495]/15",
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
