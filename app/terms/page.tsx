import Link from 'next/link';
import PageHero from '@/components/PageHero';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6">
        <PageHero
          badge="Legal"
          title="Terms of Use"
          subtitle="Rules for students, organizations, and admins using LocalLink. Last updated July 2026."
          imageSrc="/images/students-local.jpg"
        />

        <article className="space-y-8 rounded-3xl border border-blue-100 bg-white p-8 text-gray-800 shadow-sm leading-relaxed sm:p-10">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Service</h2>
            <p>
              LocalLink helps users discover local scholarships and contacts. Listings are
              informational; award decisions belong solely to the funding organizations. We do not
              guarantee funding outcomes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Accounts</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Students</strong> may use demo matcher freely; full contact tools, network
                match, and cloud saves require sign-in.
              </li>
              <li>
                <strong>Organizations</strong> must sign in before submitting scholarships.
                Submissions may be reviewed before publication.
              </li>
              <li>
                <strong>Admins</strong> are provisioned staff accounts for moderation only.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Acceptable use</h2>
            <p>
              Do not scrape the site, submit fraudulent awards, harvest contacts for spam, or upload
              data you are not allowed to process. Respect organization and student privacy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Accuracy</h2>
            <p>
              Deadlines, amounts, and contacts can change. Always verify details on the official
              organization page before applying or emailing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Limitation</h2>
            <p>
              LocalLink is provided as-is without warranties of uninterrupted service or perfect
              match accuracy. To the fullest extent permitted by law, liability is limited to the
              amount you paid us (if any) in the prior twelve months.
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
