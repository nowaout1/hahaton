import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

type Color = "primary";
type Size = "sm" | "md" | "lg";

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

const select = tv({
  base: "rounded-full outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
  variants: {
    color: {
      primary: "text-gray-900 border",
    },
    size: {
      sm: "text-sm px-3 py-1.5",
      md: "text-base px-6 py-3",
      lg: "text-lg px-6 py-3",
    },
  },
  defaultVariants: {
    size: "md",
    color: "primary",
  },
});

export function Select({
  color = "primary",
  size = "md",
  options = [],
  placeholder = "Выберите опцию",
  value,
  onChange,
  disabled = false,
  className,
  ...props
}: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  color?: Color;
  size?: Size;
  options?: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}) {
  return (
    <select
      {...props}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={twMerge(select({ color, size }), className)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
