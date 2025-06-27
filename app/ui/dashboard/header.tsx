import Image from 'next/image';

export default function Header() {
  return (
    <div className="flex flex-row h-20 w-full border-b border-gray-border overflow-hidden items-center justify-between pl-3 pr-6 md:pl-4 md:pr-8">
      <div className="relative h-10 aspect-[631/211] hidden md:block">
        <Image
          src="/OMP_logo_rsz-removebg.png"
          alt="Logo"
          fill
          className="object-contain"
        />
      </div>
      <div className="relative h-12 aspect-[631/211] hidden md:block">
        <Image
          src="/OMP_logo_rsz-removebg.png"
          alt="Logo"
          fill
          className="object-contain"
        />
      </div>
    </div>
  )
}