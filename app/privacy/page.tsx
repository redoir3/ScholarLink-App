import Link from 'next/link';
import PageHero from '@/components/PageHero';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6">
        <PageHero
          badge="Legal"
          title="Privacy Policy"
          subtitle="How LocalLink handles student, organization, and network data. Last updated July 2026."
          imageSrc="/images/network-hero.jpg"
        />

        <article className="space-y-8 rounded-3xl border border-blue-100 bg-white p-8 text-gray-800 shadow-sm leading-relaxed sm:p-10">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">What we collect</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Account email, name, and role (student, organization, or admin)</li>
              <li>Scholarship matcher answers you choose to submit</li>
              <li>Scholarships you save to your account</li>
              <li>Organization submission details for awards you list</li>
              <li>
                Network match inputs you upload or type (LinkedIn Connections CSV is processed in
                your browser; we do not require bulk upload to our servers to parse)
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">How we use data</h2>
            <p>
              To match you with scholarships, display saved awards, review organization listings,
              improve product quality, and secure accounts. We do not sell personal contact lists.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">LinkedIn & network data</h2>
            <p>
              We do not scrape LinkedIn. Optional OAuth only receives profile identity if you
              connect it. Connection matching is designed around data you export yourself or enter
              manually. Prefer minimizing sensitive fields when uploading exports.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Storage & security</h2>
            <p>
              Accounts and saved awards are stored with Supabase (encrypted in transit). Access is
              protected by authentication and role checks. Admin accounts are restricted.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Your choices</h2>
            <p>
              You may sign out, delete saved items, or request account deletion by contacting the
              site operator. Demo matcher results hide contact details until you sign in.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Contact</h2>
            <p>
              Questions about privacy: use the contact email associated with your LocalLink
              deployment or organization listing.
            </p>
          </section>

          <Link href="/" className="inline-block font-medium text-primary underline">
            ← Back to home
          </Link>
        </article>
      </div>
    </div>
  );
}
