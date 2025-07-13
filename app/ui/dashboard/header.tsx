import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <div className="flex flex-row h-16 w-full border-b border-gray-border overflow-hidden items-center justify-between pl-3 pr-6 md:pl-4 md:pr-8">
      <Link href="/">
        <div className="relative h-8 aspect-[631/211] hidden md:block">
          <Image
            src="/OMP_logo_rsz-removebg.png"
            alt="Logo"
            fill
            className="object-contain"
          />
        </div>
      </Link>
      <div className="relative w-auto flex flex-row items-center gap-2">
        <div className="relative px-4 py-2 bg-brand-main hover:bg-brand-600 rounded-xl text-white">
          Fai cose
        </div>
        <div className=" relative w-10 h-10 rounded-full bg-gray-user" />
      </div>
    </div>
  )
}