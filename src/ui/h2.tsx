import { twMerge } from "tailwind-merge";

export function H2({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 {...props} className={twMerge("text-2xl ", className)}>
      {children}
    </h2>
  );
}
