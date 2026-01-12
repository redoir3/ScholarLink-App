document.getElementById('scholarshipForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const originInput = document.getElementById('origin').value.trim().toLowerCase();
  const school = document.getElementById('school').value.trim();
  const excelled = Array.from(document.getElementById('excelled').selectedOptions).map(opt => opt.value.toLowerCase());
  const chars = Array.from(document.getElementById('characteristics').selectedOptions).map(opt => opt.value.toLowerCase());

  // Parse origin: assume "City, State" – split for matching
  const [city, state] = originInput.split(',').map(part => part.trim());

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '<h2>Your Matches</h2>';

  // Expanded database: Real scholarships with locations (array for city/state), plus contacts for outreach
  const scholarships = [
    // Pennsylvania/Philly-specific
    {
      name: "Aaron Libson Champion of Human Rights Scholarship",
      desc: "For first-generation college students from Philadelphia committed to social work, education, healthcare, public service, environmental studies, or law.",
      amount: "$1,000",
      link: "https://bold.org/scholarships/aaron-libson-champion-of-human-rights-scholarship/",
      contact: "Bold.org Support – support@bold.org – Email to discuss your commitment and build a connection!",
      locations: ["philadelphia", "pa", "pennsylvania"]
    },
    {
      name: "Bobie Bao Memorial Scholarship",
      desc: "For driven students from Gateway High School (PA) with a GPA of 3.0+ excelling in academics.",
      amount: "$2,000",
      link: "https://bold.org/scholarships/bobie-bao-memorial-scholarship/",
      contact: "Bold.org Team – support@bold.org – Reach out to share your story and demeanor.",
      locations: ["pa", "pennsylvania"]
    },
    {
      name: "Peter J. Musto Memorial Scholarship",
      desc: "For Pennsylvania students affected by cancer (personal or family) with GPA 3.0+.",
      amount: "$1,500",
      link: "https://bold.org/scholarships/peter-j-musto-memorial-scholarship/",
      contact: "Bold.org Support – support@bold.org – Connect personally to showcase your resilience.",
      locations: ["pa", "pennsylvania"]
    },
    // New York/NYC-specific
    {
      name: "William T. Sullivan Memorial Scholarship",
      desc: "For New York students embodying community involvement, great for leadership excellence.",
      amount: "$1,250",
      link: "https://bold.org/scholarships/william-t-sullivan-memorial-scholarship/",
      contact: "Meaghan Sullivan – Contact via Bold.org form – Introduce yourself and discuss your service.",
      locations: ["new york", "ny", "nyc"]
    },
    {
      name: "Claremont International High School Scholarship",
      desc: "For students from Claremont International High School (NYC) pursuing higher education.",
      amount: "$2,500",
      link: "https://bold.org/scholarships/claremont-international-high-school-scholarship/",
      contact: "Thomas and Linda Ross – Reach out via Bold.org to build rapport.",
      locations: ["new york", "ny", "nyc"]
    },
    // California/LA/SF-specific
    {
      name: "DC's Opportunity Grant",
      desc: "For low-income, first-generation students in Greater Los Angeles pursuing trade careers.",
      amount: "$2,000",
      link: "https://bold.org/scholarships/DCs-opportunity-grant/",
      contact: "Bold.org Support – support@bold.org – Email to share your background and goals.",
      locations: ["los angeles", "la", "california", "ca"]
    },
    {
      name: "The Chosen Family Fund Scholarship",
      desc: "For students from Oakland, Berkeley, or San Francisco Bay Area preparing for college.",
      amount: "$2,000",
      link: "https://bold.org/scholarships/the-chosen-family-fund-scholarship/",
      contact: "Bold.org Team – support@bold.org – Connect to discuss your story.",
      locations: ["san francisco", "oakland", "berkeley", "ca", "california"]
    },
    {
      name: "Joe Massaro Achievement Scholarship",
      desc: "For music program participants from Arroyo High School (CA).",
      amount: "$1,020",
      link: "https://bold.org/scholarships/joe-massaro-achievement-scholarship/",
      contact: "Bold.org Support – support@bold.org – Reach out about your arts excellence.",
      locations: ["arroyo", "ca", "california"]
    },
    // Texas/Houston/Austin-specific
    {
      name: "Dr. Tujuana Hunter Memorial Scholarship",
      desc: "For students from East Houston-area school districts, great for community service.",
      amount: "$1,500",
      link: "https://bold.org/scholarships/dr-tujuana-hunter-memorial-scholarship/",
      contact: "Darius Provost-Evans – Contact via Bold.org – Build a relationship by sharing your drive.",
      locations: ["houston", "tx", "texas"]
    },
    {
      name: "Glenn Ehlers Memorial Scholarship",
      desc: "For high school seniors from Conroe (TX) beginning college.",
      amount: "$7,500",
      link: "https://bold.org/scholarships/glenn-ehlers-memorial-scholarship/",
      contact: "Ehlers Family – Reach out via Bold.org to introduce yourself.",
      locations: ["conroe", "tx", "texas"]
    },
    {
      name: "Kelly Smith Memorial Scholarship",
      desc: "For students in San Antonio (TX) exemplifying key attributes in education.",
      amount: "$4,000",
      link: "https://bold.org/scholarships/kelly-smith-memorial-scholarship/",
      contact: "Northside ISD – Contact via Bold.org form – Showcase your character.",
      locations: ["san antonio", "tx", "texas"]
    },
    // Illinois/Chicago-specific
    {
      name: "Vernardo Book Scholarship",
      desc: "For first-generation BIPOC, low-income students from South Side Chicago attending 4-year universities.",
      amount: "$1,000",
      link: "https://bold.org/scholarships/vernardo-book-scholarship/",
      contact: "Bold.org Support – support@bold.org – Email to discuss your background and build rapport.",
      locations: ["chicago", "il", "illinois"]
    },
    {
      name: "West Pullman Scholarship",
      desc: "For Black students from Chicago passionate about English, Theater, or Film.",
      amount: "$4,985",
      link: "https://bold.org/scholarships/west-pullman-scholarship/",
      contact: "Bold.org Team – support@bold.org – Reach out to share your arts story.",
      locations: ["chicago", "il", "illinois"]
    },
    {
      name: "Compass Scholarship",
      desc: "For African-American college students in Illinois facing high costs.",
      amount: "$2,050",
      link: "https://bold.org/scholarships/compass-scholarship/",
      contact: "Bold.org Support – support@bold.org – Connect personally about your perseverance.",
      locations: ["il", "illinois"]
    },
    // National fallbacks with dynamic links
    {
      name: "Horatio Alger National Scholarship",
      desc: "Nationwide for students with financial need and strong character—perfect for low-income or first-gen.",
      amount: "$25,000",
      link: "https://scholars.horatioalger.org/",
      contact: "Scholarship Department – scholarships@horatioalger.org – Reach out to build rapport and showcase your demeanor!",
      locations: ["national"]
    },
    {
      name: "Bold.org Personalized Search",
      desc: "Tailored matches based on your location, excellence areas, and characteristics.",
      amount: "Varies",
      link: `https://bold.org/scholarships/?search=${encodeURIComponent(originInput + ' ' + excelled.join(' ') + ' ' + chars.join(' '))}`,
      contact: "Bold.org Support – support@bold.org – Use the platform to message creators and build connections.",
      locations: ["national"]
    },
    {
      name: "Scholarships.com Custom Search",
      desc: "Location and background-specific opportunities nationwide.",
      amount: "Varies",
      link: `https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/?search=${encodeURIComponent(originInput)}`,
      contact: "Sponsors listed in results – Email contacts to ask questions and introduce yourself.",
      locations: ["national"]
    },
    {
      name: "UNCF Ahmanson Foundation Scholarship",
      desc: "For undergrad/grad students from greater Los Angeles area at UNCF schools—minority-focused.",
      amount: "Varies",
      link: "https://opportunities.uncf.org/s/program-landing-page?id=a2iVJ00000fceKzYAI",
      contact: "UNCF Scholarships – scholarships@uncf.org – Reach out to discuss your fit and story.",
      locations: ["los angeles", "ca", "california", "national"]
    }
  ];

  // Filter: Prioritize if location matches user's city/state; include excelled/chars if possible (basic keyword match for now)
  let filtered = scholarships.filter(sch => {
    const locLower = sch.locations.map(l => l.toLowerCase());
    return locLower.some(l => city?.includes(l) || state?.includes(l) || originInput.includes(l)) ||
           locLower.includes('national');  // Always include nationals as fallback
  });

  // Bonus: Loose match on excelled/chars to refine (e.g., if desc mentions 'stem' and user selected STEM)
  filtered = filtered.filter(sch => {
    const descLower = sch.desc.toLowerCase();
    return excelled.some(ex => descLower.includes(ex)) || chars.some(ch => descLower.includes(ch)) || true;  // Loose or always show
  });

  if (filtered.length === 0) {
    resultsDiv.innerHTML += '<p>No direct city-specific matches—showing national options. Try refining your origin or add more details!</p>';
    filtered = scholarships.filter(sch => sch.locations.includes("national"));
  } else if (!filtered.some(sch => !sch.locations.includes("national"))) {
    resultsDiv.innerHTML += '<p><em>Showing city/state matches plus nationals for more options. If you need deeper search, copy this prompt for Grok AI: "Grok, find real scholarships for a student from ' + originInput + ' excelling in ' + excelled.join(', ') + ' with characteristics ' + chars.join(', ') + ' – include contacts to reach out and build relationships."</em></p>';
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
});
