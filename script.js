document.getElementById('scholarshipForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const origin = document.getElementById('origin').value.trim().toLowerCase();
  const school = document.getElementById('school').value.trim();
  const excelled = Array.from(document.getElementById('excelled').selectedOptions).map(opt => opt.value);
  const chars = Array.from(document.getElementById('characteristics').selectedOptions).map(opt => opt.value);

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '<h2>Your Matches</h2>';

  // Hardcoded real scholarships – expand this list! Focus on ones with contacts.
  const scholarships = [
    {
      name: "Philadelphia Foundation Scholarships",
      desc: "Multiple awards for Philly-area students based on academics, need, and background. Great for building local connections.",
      amount: "Varies ($1,000–$20,000)",
      link: "https://www.philafound.org/scholarships/",
      contact: "Scholarship Team – scholarships@philafound.org – Email to introduce yourself and share your story!"
    },
    {
      name: "Bold.org Personalized Scholarships",
      desc: "Platform with location/major/background matches. Many allow direct chats with creators.",
      amount: "Varies",
      link: `https://bold.org/scholarships/?search=${encodeURIComponent(origin + ' ' + excelled.join(' '))}`,
      contact: "Use Bold.org messaging – connect with scholarship creators to discuss your fit and character."
    },
    {
      name: "Scholarships.com Location & Background Search",
      desc: "Search tailored to your city/state and characteristics for real opportunities.",
      amount: "Varies",
      link: `https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/?search=${encodeURIComponent(origin)}`,
      contact: "Results include sponsor contacts – reach out personally to ask questions and showcase your demeanor."
    },
    // Add more here, e.g., national ones like Horatio Alger for low-income, or veteran-specific if chars includes "Military/Veteran"
    {
      name: "Horatio Alger National Scholarship",
      desc: "For students with financial need, perseverance, and strong character – nationwide but very obtainable.",
      amount: "$25,000",
      link: "https://scholars.horatioalger.org/",
      contact: "Scholarship Department – scholarships@horatioalger.org – Reach out to build rapport!"
    }
  ];

  // Simple filter: show all if Philly-ish, else prioritize national + search links
  let filtered = scholarships;
  if (!origin.includes('philadelphia') && !origin.includes('pa')) {
    filtered = scholarships.filter(s => s.name.includes('National') || s.name.includes('Bold') || s.name.includes('Scholarships.com'));
    resultsDiv.innerHTML += '<p><em>Showing broader/national matches since you\'re not from the Philly area. Refine inputs for more!</em></p>';
  }

  if (filtered.length === 0) {
    resultsDiv.innerHTML += '<p>No direct matches yet—try national searches above or add more details!</p>';
    return;
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
