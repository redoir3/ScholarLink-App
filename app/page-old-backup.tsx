// app/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Users, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold">LS</div>
            <span className="font-semibold text-2xl">LocalLink Scholar</span>
          </div>
          <div className="flex gap-6">
            <Link href="/local-search" className="font-medium hover:text-blue-600">Find Local Scholarships</Link>
            <Link href="#questionnaire" className="font-medium hover:text-blue-600">Full Matching Form</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1 mb-6 shadow">
          <Award className="text-amber-500" /> Higher Win Rates for Local Scholarships
        </div>
        <h1 className="text-7xl font-bold tracking-tight text-gray-900 mb-6">
          Real Scholarships.<br />Real Connections.<br />
          <span className="bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">Right in Your City.</span>
        </h1>
        <p className="text-2xl text-gray-600 max-w-2xl mx-auto mb-10">
          Stop guessing. Get matched to obtainable local awards and reach out directly to organizers.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/local-search">
            <Button size="lg" className="text-lg px-10 py-7 rounded-2xl">
              🌍 Find Scholarships in My City <ArrowRight className="ml-2" />
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="outline" className="text-lg px-10 py-7 rounded-2xl">
              Start Full Matching Questionnaire
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <MapPin className="w-16 h-16 mx-auto text-blue-600 mb-6" />
            <h3 className="text-2xl font-semibold mb-3">Hyper-Local</h3>
            <p className="text-gray-600">City and town specific scholarships with smaller applicant pools.</p>
          </div>
          <div className="text-center">
            <Users className="w-16 h-16 mx-auto text-amber-600 mb-6" />
            <h3 className="text-2xl font-semibold mb-3">Build Relationships</h3>
            <p className="text-gray-600">Direct contacts + personalized email drafts for every opportunity.</p>
          </div>
          <div className="text-center">
            <Award className="w-16 h-16 mx-auto text-emerald-600 mb-6" />
            <h3 className="text-2xl font-semibold mb-3">Higher Success Rate</h3>
            <p className="text-gray-600">Focus on real, obtainable awards tailored to you.</p>
          </div>
        </div>
      </section>

      {/* CTA to Questionnaire */}
      <section id="questionnaire" className="py-24 bg-gradient-to-br from-blue-600 to-amber-600 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-6">Ready for Personalized Matches?</h2>
          <p className="text-xl mb-10">Answer a few questions about your background and strengths.</p>
          <Link href="app/page.tsx.bak"> {/* or wherever your form is */}
            <Button size="lg" variant="secondary" className="text-xl px-12 py-8 rounded-2xl">
              Start the Scholarship Matcher
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}