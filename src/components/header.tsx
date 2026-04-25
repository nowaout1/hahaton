import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="absolute left-5 top-5 z-30 sm:left-8 sm:top-6">
      <Link href="/">
        <Image
          src="/logo/t2_Logo_Black_sRGB.svg"
          alt="t2 logo"
          width={42}
          height={42}
        />
      </Link>
    </header>
  );
}
