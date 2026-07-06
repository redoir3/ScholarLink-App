'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Users, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-2xl flex items-center justify-center text-white font-bold">LS</div>
            <span className="font-semibold text-2xl tracking-tight">LocalLink</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium">
            <Link href="/local-search" className="hover:text-primary transition">Discover</Link>
            <Link href="/matcher" className="hover:text-primary transition">Match Me</Link>
            <Link href="/submit" className="hover:text-primary transition">For Organizations</Link>
            <Link href="/login">
              <Button variant="outline" size="sm" className="rounded-full">Sign in</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2 mb-8 shadow border">
          <Award className="text-amber-500" size={20} /> Higher win rates for local scholarships
        </div>

        <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-gray-900 mb-6">
          Local scholarships.<br />
          Real connections.<br />
          <span className="bg-gradient-to-r from-primary via-blue-600 to-accent bg-clip-text text-transparent">Higher chances of winning.</span>
        </h1>

        <p className="text-2xl text-gray-600 max-w-2xl mx-auto mb-12">
          Stop scrolling through national lists. Get matched to obtainable opportunities in your city and reach out directly to the people who award them.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="text-lg px-10 py-7 rounded-2xl font-semibold">
              Find Scholarships Near Me <ArrowRight className="ml-2" />
            </Button>
          </Link>
          <Link href="/submit">
            <Button size="lg" variant="outline" className="text-lg px-10 py-7 rounded-2xl font-semibold">
              Submit an Opportunity
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mb-6">
              <MapPin className="w-11 h-11 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Hyper-Local</h3>
            <p className="text-gray-600">Scholarships from your community, school, and region — smaller pools, better odds.</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mb-6">
              <Users className="w-11 h-11 text-accent" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Personal Connections</h3>
            <p className="text-gray-600">Every opportunity includes a real contact person so you can stand out.</p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6">
              <Award className="w-11 h-11 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Higher Success Rate</h3>
            <p className="text-gray-600">Focus on real, winnable awards instead of national lotteries.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-primary text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-6">Start winning local scholarships today</h2>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="text-xl px-12 py-8 rounded-2xl font-semibold">
              Get Personalized Matches
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}