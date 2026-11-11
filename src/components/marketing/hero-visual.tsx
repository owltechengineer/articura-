import Image from "next/image";

export function HeroVisual() {
  return (
    <div className="relative w-full overflow-hidden">
      <Image
        src="/marketing/hero-articura.png"
        alt="Dashboard Articura, software aziendali e produzione industriale"
        width={1024}
        height={523}
        priority
        className="h-auto w-full object-cover object-right"
        sizes="(max-width: 1024px) 100vw, 56vw"
      />
    </div>
  );
}
