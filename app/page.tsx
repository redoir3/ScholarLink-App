import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Award,
  HeartHandshake,
  MapPin,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';

/**
 * Server Component homepage — stable HTML for hydration.
 * No framer-motion / client-only auth branches here.
 */
export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-blue-50/50">
      {/* Hero: relative + min-height so Image fill is valid */}
      <section className="relative h-[560px] overflow-hidden sm:h-[640px]">
        <Image
          src="/images/students-local.jpg"
          alt="Students in a local community"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-blue-950/75" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/50 to-blue-950/40"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-md">
            <Award className="size-4 shrink-0 text-amber-600" />
            Higher win rates for local scholarships
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
            Local scholarships.
            <br />
            Real connections.
            <br />
            <span className="text-amber-200">Higher chances of winning.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-white sm:text-xl">
            Stop scrolling national lists. Get matched to obtainable awards in your city — and use
            your network for warm intros to the people who award them.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/matcher">
              <Button
                size="lg"
                className="rounded-2xl bg-white px-8 py-7 text-base font-semibold text-primary hover:bg-blue-50"
              >
                Try matcher (demo free) <ArrowRight className="ml-1" />
              </Button>
            </Link>
            <Link href="/login?next=/network">
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl border-2 border-white bg-transparent px-8 py-7 text-base font-semibold text-white hover:bg-white/15 hover:text-white"
              >
                <Share2 className="mr-1" /> Network (sign in)
              </Button>
            </Link>
          </div>

          <p className="mt-10 text-sm font-medium text-white">
            New here? Read{' '}
            <Link
              href="/manifesto"
              className="font-bold text-amber-200 underline decoration-amber-300 underline-offset-4 hover:text-white"
            >
              our manifesto
            </Link>{' '}
            on why local + relationships win.
          </p>
        </div>
      </section>

      {/* Features — large gap from hero + between cards */}
      <section className="px-6 pb-10 pt-28 sm:pt-36">
        <div className="mx-auto mb-16 max-w-2xl space-y-5 text-center sm:mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Built for real odds, not lottery lists
          </h2>
          <p className="text-lg leading-relaxed text-gray-700">
            Three equal pillars — local discovery, real people, and network advantage.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3 md:gap-12">
          {[
            {
              icon: MapPin,
              title: 'Hyper-local',
              body: 'Community clubs, VFW posts, foundations, and county awards — smaller pools, better odds.',
              color: 'from-blue-500 to-primary',
            },
            {
              icon: HeartHandshake,
              title: 'Real contacts',
              body: 'Full access unlocks people you can email — not just a faceless national form.',
              color: 'from-amber-500 to-orange-500',
            },
            {
              icon: Share2,
              title: 'Network advantage',
              body: 'Signed-in students can scan LinkedIn exports for orgs tied to awards.',
              color: 'from-emerald-500 to-teal-600',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-blue-100 bg-white p-8 shadow-lg shadow-blue-900/5 sm:p-10"
            >
              <div
                className={`mb-6 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-md`}
              >
                <f.icon className="size-7" aria-hidden />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-3 leading-relaxed text-gray-700">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Paths */}
      <section className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <div className="mb-16 space-y-5 text-center sm:mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Three ways to find money near you
          </h2>
          <p className="text-lg text-gray-700">Pick the path that fits how you search.</p>
        </div>
        <div className="grid gap-10 md:grid-cols-3 md:gap-12">
          {[
            {
              href: '/matcher',
              icon: Sparkles,
              title: 'Matcher',
              body: 'Demo free with fit scores. Sign in for contacts, save, and outreach.',
              bar: 'from-primary to-blue-400',
            },
            {
              href: '/local-search',
              icon: MapPin,
              title: 'City search',
              body: 'Jump to awards near a city and state you care about.',
              bar: 'from-emerald-500 to-teal-400',
            },
            {
              href: '/network',
              icon: Users,
              title: 'Network scan',
              body: 'Sign in required. Upload LinkedIn Connections or type orgs you know.',
              bar: 'from-sky-500 to-blue-600',
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`h-2 bg-gradient-to-r ${item.bar}`} />
              <div className="p-8 sm:p-10">
                <item.icon className="mb-5 size-8 text-primary" aria-hidden />
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">{item.body}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Manifesto */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-amber-100 bg-white p-10 shadow-md sm:p-14">
          <div className="relative z-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">
              Our manifesto
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              Relationships beat random applications.
            </h2>
            <p className="mt-5 leading-relaxed text-gray-700">
              National databases bury the best odds — local clubs, nonprofits, and foundations with
              real people behind them. Read why we built LocalLink this way.
            </p>
            <Link href="/manifesto" className="mt-8 inline-block">
              <Button className="rounded-xl">Read the manifesto</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary via-blue-700 to-emerald-800 py-24 text-center">
        <div className="mx-auto max-w-2xl space-y-6 px-6">
          <h2 className="text-3xl font-bold text-white sm:text-5xl">
            Start winning local scholarships today
          </h2>
          <p className="text-lg font-medium text-white">
            Free student demo. Full tools with a free account. Organizations sign in to list awards.
          </p>
          <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
            <Link href="/login?mode=signup">
              <Button
                size="lg"
                className="rounded-2xl bg-white px-10 py-7 text-base font-semibold text-primary hover:bg-blue-50"
              >
                Create free student account
              </Button>
            </Link>
            <Link href="/login?next=/submit">
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl border-2 border-white bg-transparent px-10 py-7 text-base font-semibold text-white hover:bg-white/15 hover:text-white"
              >
                Org sign in to submit
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
