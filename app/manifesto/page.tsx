import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PageHero from '@/components/PageHero';

export default function Manifesto() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50/40">
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:px-6">
        <PageHero
          badge="Why LocalLink exists"
          title="Our manifesto"
          subtitle="Higher win rates aren’t luck. They come from focusing on real, local, obtainable scholarships and building genuine relationships."
          imageSrc="/images/community-handshake.jpg"
        />

        <article className="space-y-10 rounded-3xl border border-blue-100 bg-white p-8 shadow-lg sm:p-12">
          <section>
            <h2 className="text-2xl font-bold text-primary">The problem</h2>
            <p className="mt-3 text-lg leading-relaxed text-gray-700">
              National scholarship databases are overwhelming. Students waste time on highly
              competitive awards with thousands of applicants. Local scholarships — the ones with
              smaller pools and higher success odds — are hidden.
            </p>
          </section>

          <div className="relative h-48 overflow-hidden rounded-2xl sm:h-64">
            <Image
              src="/images/students-local.jpg"
              alt="Students in community"
              fill
              className="object-cover"
              sizes="800px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/50 to-transparent" />
          </div>

          <section>
            <h2 className="text-2xl font-bold text-primary">Our solution</h2>
            <p className="mt-3 text-lg leading-relaxed text-gray-700">
              LocalLink connects students to <strong>real local opportunities</strong> and gives
              them direct contacts to reach out to. We believe relationships matter more than
              random applications — including warm intros from people already in your network.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary">Why local wins</h2>
            <ul className="mt-4 space-y-3 text-lg text-gray-700">
              {[
                'Smaller applicant pools = better odds',
                'Organizations want students who show genuine interest',
                'Personal outreach builds your network for future opportunities',
                'Your LinkedIn and community ties can surface awards national lists miss',
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3"
                >
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary">Our promise</h2>
            <p className="mt-3 text-lg leading-relaxed text-gray-700">
              We feature verified scholarships with real contact people when available. Submissions
              are reviewed. We grow our database carefully through organization submissions, human
              research of primary sources, community partnerships, and limited collection of public
              listing data for local niche awards — always for student discovery, not affiliation
              with any sponsor.
            </p>
          </section>

          <div className="flex flex-col gap-3 border-t border-blue-50 pt-8 sm:flex-row sm:justify-center">
            <Link href="/matcher">
              <Button size="lg" className="w-full rounded-2xl sm:w-auto">
                Start matching
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full rounded-2xl sm:w-auto">
                Back to home
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
