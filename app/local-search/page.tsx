import LocalSearch from '@/components/LocalSearch';
import PageHero from '@/components/PageHero';

export default function LocalSearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-10 sm:px-6">
        <PageHero
          badge="Discover nearby"
          title="Local scholarship finder"
          subtitle="Select your city and state to discover real awards nearby. Smaller applicant pools mean higher chances — and every opportunity is meant to include a contact you can reach."
          imageSrc="/images/students-local.jpg"
        />

        <LocalSearch />

        <div className="rounded-2xl border border-blue-100 bg-white/80 p-5 text-center text-sm text-gray-600 shadow-sm">
          Pro tip: After finding matches, use the email draft on each card to introduce yourself
          professionally to the listed contact person.
        </div>
      </div>
    </div>
  );
}
