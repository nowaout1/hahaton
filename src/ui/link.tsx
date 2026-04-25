import { default as NextLink } from "next/link";

export function Link({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <NextLink className="hover:opacity-85" href={href}>
      {children}
    </NextLink>
  );
}
