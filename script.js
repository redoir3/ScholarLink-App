document.getElementById('scholarshipForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const originInput = document.getElementById('origin').value.trim().toLowerCase();
  const school = document.getElementById('school').value.trim().toLowerCase();
  const excelled = Array.from(document.getElementById('excelled').selectedOptions).map(opt => opt.value.toLowerCase());
  const chars = Array.from(document.getElementById('characteristics').selectedOptions).map(opt => opt.value.toLowerCase());

  // Parse origin: assume "City, State" – split for matching
  const [city, state] = originInput.split(',').map(part => part.trim());

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '<h2>Your Deep-Cut Matches</h2><p>These are lesser-known locals tailored to your inputs—reach out to contacts to build relationships and stand out!</p>';

  // Expanded database: Deep-cut, specific locals from community orgs, foundations, and social media scans (e.g., X announcements). Prioritize hidden gems with direct contacts.
  const scholarships = [
    // Philadelphia/PA deep-cuts (e.g., from Philly Foundation, CCP, niche memorials)
    {
      name: "Catto Scholarship at Community College of Philadelphia",
      desc: "Full-tuition for Philly high school grads (first-gen/low-income focus) pursuing associate degrees—great for building local networks.",
      amount: "Full tuition + stipend",
      link: "https://www.ccp.edu/paying-college/scholarships/catto-scholarship",
      contact: "Catto Scholarship Team – catto@ccp.edu – Email to discuss your background, ask questions, and showcase your drive for a personal connection.",
      locations: ["philadelphia", "pa", "pennsylvania"]
    },
    {
      name: "Beverly J. Smith Memorial Scholarship",
      desc: "For women from nearby counties (e.g., Philly area) in business/leadership—under-the-radar memorial fund.",
      amount: "$2,500",
      link: "https://www.jefferson.edu/tuition-and-financial-aid/financial-aid-office/financial-aid-programs/private-external-scholarships-and-grants.html",
      contact: "Scholarship Committee – finaid@jefferson.edu – Reach out to introduce yourself, share your story, and build rapport.",
      locations: ["philadelphia", "pa", "pennsylvania"]
    },
    {
      name: "Etkin Scholarship Program (ULI Philadelphia)",
      desc: "For college students in built environment fields—recent X-announced opportunity for membership and networking.",
      amount: "Membership + events (value $500+)",
      link: "https://philadelphia.uli.org/etkin-scholarship-program/",
      contact: "ULI Philadelphia Team – philadelphia@uli.org – Email to apply personally, ask about fit, and start building industry relationships.",
      locations: ["philadelphia", "pa", "pennsylvania"]
    },
    {
      name: "Philadelphia Scholars Last Dollar Scholarship",
      desc: "Gap-filling aid for low-income Philly grads at local colleges—focus on perseverance and community.",
      amount: "Up to $5,000",
      link: "https://philaedfund.org/programs/college-career-resources/philadelphia-scholars",
      contact: "Philadelphia Education Fund – scholars@philaedfund.org – Contact to share your journey and demeanor for stronger consideration.",
      locations: ["philadelphia", "pa", "pennsylvania"]
    },
    // New York/NYC deep-cuts (e.g., from NY Community Trust, Central NY CF)
    {
      name: "William T. Sullivan Memorial Scholarship",
      desc: "For NYC students in community service/leadership—niche memorial with personal outreach emphasis.",
      amount: "$1,250",
      link: "https://bold.org/scholarships/william-t-sullivan-memorial-scholarship/",
      contact: "Meaghan Sullivan – support@bold.org – Email to discuss your involvement and build a meaningful connection.",
      locations: ["new york", "ny", "nyc"]
    },
    {
      name: "Claremont International High School Scholarship",
      desc: "Targeted for Bronx/NYC high school grads (immigrant/first-gen focus)—under-the-radar school-specific aid.",
      amount: "$2,500",
      link: "https://bold.org/scholarships/claremont-international-high-school-scholarship/",
      contact: "Thomas and Linda Ross – support@bold.org – Reach out to showcase your character and ask tailored questions.",
      locations: ["new york", "ny", "nyc"]
    },
    {
      name: "Northern New York Community Foundation Scholarships",
      desc: "Various locals for upstate NYC students (e.g., low-income/minority)—hidden gems with per-fund contacts.",
      amount: "Varies ($1,000–$5,000)",
      link: "https://nnycf.org/scholarships/scholarship-overview",
      contact: "Tara Hess – tara@nnycf.org – Email for specifics on your fit and to start a relationship-building conversation.",
      locations: ["new york", "ny"]
    },
    // Los Angeles/CA deep-cuts (e.g., from LACC Foundation, Angeles College)
    {
      name: "DC's Opportunity Grant",
      desc: "For low-income/first-gen in Greater LA pursuing trades—niche focus on career readiness.",
      amount: "$2,000",
      link: "https://bold.org/scholarships/DCs-opportunity-grant/",
      contact: "Bold.org Support – support@bold.org – Contact to share your goals and build rapport with the org.",
      locations: ["los angeles", "la", "california", "ca"]
    },
    {
      name: "The Chosen Family Fund Scholarship",
      desc: "For Bay Area/LA-adjacent students (e.g., Oakland ties) prepping for college—underrepresented groups.",
      amount: "$2,000",
      link: "https://bold.org/scholarships/the-chosen-family-fund-scholarship/",
      contact: "Bold.org Team – support@bold.org – Email to discuss your story and demeanor personally.",
      locations: ["los angeles", "la", "california", "ca"]
    },
    {
      name: "LACC Foundation Scholarships",
      desc: "Semester-specific for LA City College students (merit/need-based)—local hidden gems up to $1,000.",
      amount: "Up to $1,000",
      link: "https://laccfoundation.org/apply-for-scholarships",
      contact: "LACC Foundation – foundation@lacitycollege.edu – Reach out to a coordinator to ask questions and showcase your character.",
      locations: ["los angeles", "la", "california", "ca"]
    },
    {
      name: "Build Hope Inc. Scholarships",
      desc: "For low-income LA students overcoming barriers—focus on persistence with annual renewals.",
      amount: "$500–$5,000",
      link: "https://buildhopeinc.org/education",
      contact: "Build Hope Team – info@buildhopeinc.org – Email to introduce yourself and build a supportive relationship.",
      locations: ["los angeles", "la", "california", "ca"]
    },
    // Chicago/IL deep-cuts (e.g., from Chicago Scholars, ZAFEE)
    {
      name: "Vernardo Book Scholarship",
      desc: "For first-gen BIPOC/low-income from South Side Chicago—niche for 4-year university pursuits.",
      amount: "$1,000",
      link: "https://bold.org/scholarships/vernardo-book-scholarship/",
      contact: "Bold.org Support – support@bold.org – Contact to share your background and start building connections.",
      locations: ["chicago", "il", "illinois"]
    },
    {
      name: "West Pullman Scholarship",
      desc: "For Black Chicago students in arts/theater/film—under-the-radar creative focus.",
      amount: "$4,985",
      link: "https://bold.org/scholarships/west-pullman-scholarship/",
      contact: "Bold.org Team – support@bold.org – Email to discuss your passion and demeanor.",
      locations: ["chicago", "il", "illinois"]
    },
    {
      name: "ZAFEE Scholarship Program",
      desc: "For Uniting Voices Chicago participants or refugees—hidden gem for community-involved students.",
      amount: "Varies",
      link: "https://scholarshipamerica.org/scholarship/zafee",
      contact: "Scholarship America – info@scholarshipamerica.org – Reach out for personal guidance and relationship-building.",
      locations: ["chicago", "il", "illinois"]
    },
    {
      name: "Daniel Murphy Scholarship Fund",
      desc: "For high-achieving low-income Chicago students—long-term support with mentoring.",
      amount: "Varies (up to full tuition)",
      link: "https://www.dmsf.org/contact-us",
      contact: "DMSF Team – info@dmsf.org – Email or call 312-455-7800 to connect and showcase your character.",
      locations: ["chicago", "il", "illinois"]
    },
    // Houston/TX deep-cuts (e.g., from GHCF, HCC Foundation)
    {
      name: "Dr. Tujuana Hunter Memorial Scholarship",
      desc: "For East Houston district students in community service—local memorial with personal emphasis.",
      amount: "$1,500",
      link: "https://bold.org/scholarships/dr-tujuana-hunter-memorial-scholarship/",
      contact: "Darius Provost-Evans – support@bold.org – Contact to build rapport and share your story.",
      locations: ["houston", "tx", "texas"]
    },
    {
      name: "Glenn Ehlers Memorial Scholarship",
      desc: "For Conroe/Houston-area high school seniors starting college—niche family fund.",
      amount: "$7,500",
      link: "https://bold.org/scholarships/glenn-ehlers-memorial-scholarship/",
      contact: "Ehlers Family – support@bold.org – Email to introduce yourself and ask about fit.",
      locations: ["houston", "tx", "texas"]
    },
    {
      name: "Greater Houston Community Foundation Scholarships",
      desc: "Various under-the-radar locals for Houston students (e.g., need-based, merit)—custom per fund.",
      amount: "Varies ($1,000–$10,000)",
      link: "https://ghcf.org/what-we-do/scholarship-funds",
      contact: "GHCF Scholarships – scholarships@ghcf.org – Reach out or call 713-333-2230 to discuss personally.",
      locations: ["houston", "tx", "texas"]
    },
    {
      name: "HCC Foundation Scholarships",
      desc: "For Houston City College students (diverse backgrounds)—hidden gems for associate pursuits.",
      amount: "Varies",
      link: "http://www.hccs.edu/applying-and-paying/financial-aid/scholarships",
      contact: "HCC Foundation – foundation@hccs.edu – Email to connect, ask questions, and showcase your demeanor.",
      locations: ["houston", "tx", "texas"]
    },
    // National fallbacks (for non-matched cities, with deep-cut twists)
    {
      name: "Horatio Alger National Scholarship",
      desc: "Nationwide for resilient low-income students—but apply locally via state chapters for personal touch.",
      amount: "$25,000",
      link: "https://scholars.horatioalger.org/",
      contact: "Scholarship Department – scholarships@horatioalger.org – Email to build rapport and highlight your character.",
      locations: ["national"]
    },
    {
      name: "Bold.org Deep-Cut Search",
      desc: "Tailored to your specifics—uncovers lesser-known matches beyond big sites.",
      amount: "Varies",
      link: `https://bold.org/scholarships/?search=${encodeURIComponent(originInput + ' lesser-known local ' + excelled.join(' ') + ' ' + chars.join(' '))}`,
      contact: "Bold.org Support – support@bold.org – Use to message creators directly for relationships.",
      locations: ["national"]
    },
    {
      name: "Scholarships.com Hidden Gems Search",
      desc: "Filtered for underrated locals based on your location and background.",
      amount: "Varies",
      link: `https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/?search=${encodeURIComponent(originInput + ' lesser-known')}`,
      contact: "Sponsors in results – Email listed contacts to introduce yourself.",
      locations: ["national"]
    }
  ];

  // Filter: Match location first (city > state > national); refine by excelled/chars in desc
  let filtered = scholarships.filter(sch => {
    const locLower = sch.locations.map(l => l.toLowerCase());
    return locLower.some(l => city?.includes(l) || state?.includes(l) || originInput.includes(l)) ||
           locLower.includes('national');
  });

  filtered = filtered.filter(sch => {
    const descLower = sch.desc.toLowerCase();
    return excelled.some(ex => descLower.includes(ex)) || chars.some(ch => descLower.includes(ch)) || true;  // Loose match
  });

  if (filtered.length === 0 || !filtered.some(sch => !sch.locations.includes("national"))) {
    resultsDiv.innerHTML += '<p>No exact deep-cut matches in our database yet—showing nationals. For more locals, use the buttons below to simulate social media/AI search!</p>';
    filtered = scholarships.filter(sch => sch.locations.includes("national"));
  }

  filtered.forEach(sch => {
    const card = document.createElement('div');
    card.className = 'scholarship';
    card.innerHTML = `
      <h3>${sch.name}</h3>
      <p>${sch.desc}</p>
      <p><strong>Amount:</strong> ${sch.amount}</p>
      <p><strong>Apply & Learn More:</strong> <a href="${sch.link}" target="_blank">${sch.link}</a></p>
      <p><strong>Build a Relationship:</strong> ${sch.contact}</p>
    `;
    resultsDiv.appendChild(card);
  });

  // Add simulation buttons for deep social/AI search
  const deepSearchDiv = document.createElement('div');
  deepSearchDiv.innerHTML = `
    <button onclick="window.open('https://x.com/search?q=${encodeURIComponent('scholarship opportunities ' + originInput + ' college local deep-cut (contact OR email) -filter:replies')}&src=typed_query', '_blank')">Deep Search on X for More Local Gems</button>
    <p>Or copy this for Grok AI: "Grok, find deep-cut, lesser-known local scholarships for a student from ${originInput} at ${school} excelling in ${excelled.join(', ')} with characteristics ${chars.join(', ')} – include contacts to reach out and build relationships."</p>
  `;
  resultsDiv.appendChild(deepSearchDiv);
});
