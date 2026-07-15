import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-blue-100 bg-gradient-to-b from-slate-50 to-blue-50/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white">
              LS
            </div>
            <span className="text-lg font-semibold text-gray-900">LocalLink</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-700">
            Local scholarships. Real contacts. Higher chances of winning.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-gray-700">
            <li>
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link href="/matcher" className="hover:text-primary">
                Matcher
              </Link>
            </li>
            <li>
              <Link href="/local-search" className="hover:text-primary">
                Local search
              </Link>
            </li>
            <li>
              <Link href="/network" className="hover:text-primary">
                Network
              </Link>
            </li>
            <li>
              <Link href="/saved" className="hover:text-primary">
                Saved
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">About</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-gray-700">
            <li>
              <Link href="/manifesto" className="hover:text-primary">
                Manifesto
              </Link>
            </li>
            <li>
              <Link href="/submit" className="hover:text-primary">
                For organizations
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-primary">
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Legal</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-gray-700">
            <li>
              <Link href="/privacy" className="hover:text-primary">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-primary">
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-blue-100/80 py-5 text-center text-xs text-gray-600">
        © 2026 LocalLink · Verified local opportunities
      </div>
    </footer>
  );
}
