import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  badge?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function PageHero({
  title,
  subtitle,
  imageSrc = '/images/students-local.jpg',
  imageAlt = 'Students in a local community',
  badge,
  className,
  children,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'grid overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl lg:grid-cols-2',
        className
      )}
    >
      {/* Fixed heights only — never h-auto/min-h alone (fill needs real height) */}
      <div className="relative h-[220px] w-full shrink-0 overflow-hidden bg-slate-200 sm:h-[260px] lg:h-[320px]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      <div className="flex flex-col justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-10 sm:px-10 sm:py-12">
        {badge && (
          <span className="mb-4 inline-flex w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {badge}
          </span>
        )}
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">{subtitle}</p>
        )}
        {children && <div className="mt-6 space-y-3">{children}</div>}
      </div>
    </section>
  );
}
