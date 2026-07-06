export default function Manifesto() {
  return (
    <div className="min-h-screen bg-neutral py-16 px-6">
      <div className="max-w-3xl mx-auto prose prose-lg">
        <h1 className="text-5xl font-bold text-primary mb-8">Our Manifesto</h1>
        
        <p className="text-2xl text-gray-700 mb-12">
          Higher win rates aren’t luck. They come from focusing on real, local, obtainable scholarships and building genuine relationships.
        </p>

        <div className="space-y-12">
          <section>
            <h2 className="text-3xl font-semibold mb-4">The Problem</h2>
            <p>National scholarship databases are overwhelming. Students waste time on highly competitive awards with thousands of applicants. Local scholarships — the ones with smaller pools and higher success odds — are hidden.</p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4">Our Solution</h2>
            <p>LocalLink connects students to <strong>real local opportunities</strong> and gives them direct contacts to reach out to. We believe relationships matter more than random applications.</p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4">Why Local Wins</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li>Smaller applicant pools = better odds</li>
              <li>Organizations want students who show genuine interest</li>
              <li>Personal outreach builds your network for future opportunities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4">Our Promise</h2>
            <p>We will only feature verified scholarships with real contact people. Every submission is reviewed. Every match is designed to help students stand out — not just apply.</p>
          </section>
        </div>

        <div className="mt-16 text-center">
          <a href="/login" className="btn-primary inline-block text-lg px-10 py-4 rounded-2xl">
            Join the Movement — Get Started Today
          </a>
        </div>
      </div>
    </div>
  );
}