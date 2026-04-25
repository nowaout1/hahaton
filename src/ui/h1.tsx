import { twMerge } from "tailwind-merge";

export function H1({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      {...props}
      className={twMerge(
        "text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl",
        className,
      )}
    >
      {children}
    </h1>
  );
}
