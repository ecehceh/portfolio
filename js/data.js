/*
 * ✏️  EDIT THIS FILE to make the portfolio yours.
 * Everything on the page (text, projects, links, tech balls) comes from here.
 * Content is based on Christopher_Evan_Wijaksana_CV.pdf (in /assets).
 *
 * - Project images: put them in /assets and set `image: "assets/my-project.png"`.
 *   Leave `image` empty to get a generated gradient placeholder.
 * - Project links: a full URL (https://...) makes the card clickable;
 *   leave `link` empty for work that isn't public.
 */
window.PORTFOLIO = {
  firstName: "CHRISTOPHER",
  lastName: "EVAN",
  fullName: "Christopher Evan Wijaksana",
  logo: "Christopher",
  email: "evanwijaksana@gmail.com",
  resumeUrl: "assets/Christopher_Evan_Wijaksana_CV.pdf",

  // Hero reads: "<heroKicker> / <rotating heroWords> / <heroTitle>".
  heroKicker: "CS Student &",
  heroWords: ["DEVOPS", "SECURITY", "AI"],
  heroTitle: "ENGINEER",

  about:
    "I'm a Computer Science student at Bina Nusantara University working where DevOps, cybersecurity and AI meet. As an IT Developer Intern at PT Malifax I built CI/CD pipelines, ran container orchestration in production and shipped Generative AI-powered threat analysis — and I'm sharpening my deep learning skills with PyTorch, deploying models on GCP and AWS.",

  whatIDo: [
    {
      title: "DEVOPS",
      subtitle: "Ship it safely",
      text: "Automating releases end to end — CI/CD pipelines with approval gates, containerised deployments with fast rollbacks, and secure, load-balanced infrastructure.",
      skills: ["Jenkins", "Docker Swarm", "Portainer", "Harbor", "Nginx", "GitHub Actions", "Linux", "GCP"],
    },
    {
      title: "SECURITY",
      subtitle: "SecOps & SIEM",
      text: "Real-time monitoring, alert routing and AI-assisted triage — plus hardening production systems against real vulnerability findings.",
      skills: ["Wazuh SIEM", "SOC-Triage", "Threat Scoring", "Log Parsing", "Data Masking", "ISO 27001"],
    },
    {
      title: "DEVELOP",
      subtitle: "Backends, web & AI",
      text: "APIs, data models and web front-ends, and deep learning models trained with PyTorch.",
      skills: ["Python", "Java", "JavaScript", "React", "Next.js", "Strapi", "PostgreSQL", "PyTorch"],
    },
  ],

  // Oldest first — the timeline reads top to bottom.
  career: [
    {
      role: "Front-end Development Member",
      org: "BNCC Learning & Training",
      year: "2023",
      desc: "Built a responsive personal portfolio website with React.js and Tailwind CSS while learning advanced front-end concepts.",
    },
    {
      role: "Learning & Training Activist",
      org: "Bina Nusantara Computer Club",
      year: "2024",
      desc: "Technical liaison for speakers at LnT Camp 2024 and Trial Class 2024, running slides and AV for sessions of 100+ participants.",
    },
    {
      role: "Learning & Training Staff",
      org: "Bina Nusantara Computer Club",
      year: "2025",
      desc: "Vice project manager of LnT Camp 2025, LDP mentor to a team of 7, and person in charge of the Front-end Development class (30+ participants per session).",
    },
    {
      role: "IT Developer Intern",
      org: "PT Malifax",
      year: "2026",
      desc: "Built 8 Jenkins CI/CD pipelines with sub-1-minute rollbacks, Wazuh SIEM monitoring for 500–1,000+ devices and Gemini-powered SOC triage, and remediated 93% of vulnerabilities across 6 production systems.",
    },
  ],

  // Highlights from the PT Malifax internship (internal work, so no public links).
  projects: [
    {
      title: "CI/CD Release Pipelines",
      category: "DevOps",
      tools: "Jenkins, Docker Swarm, Portainer API, Harbor, Nginx — 8 apps, 10+ gated releases, sub-1-minute rollbacks",
      image: "",
      link: "",
      colors: ["#2563eb", "#172554"],
    },
    {
      title: "Wazuh SIEM Monitoring",
      category: "Security",
      tools: "Wazuh, custom decoders & rules, Telegram alerting — 500–1,000+ devices, later sold commercially",
      image: "",
      link: "",
      colors: ["#7c3aed", "#1e1b4b"],
    },
    {
      title: "AI SOC-Triage",
      category: "AI Security",
      tools: "Gemini API, PostgreSQL audit, data masking, rate limiting — 100+ security logs triaged weekly",
      image: "",
      link: "",
      colors: ["#db2777", "#3b0764"],
    },
    {
      title: "Malifax Website CMS",
      category: "Backend",
      tools: "Strapi Headless CMS — 20 content types, ~88 REST endpoints, 31 reusable components",
      image: "",
      link: "",
      colors: ["#0891b2", "#172554"],
    },
  ],

  // Balls in the "My Techstack" section. `text` is the label colour.
  techstack: [
    { label: "Python", color: "#306998", text: "#ffd43b" },
    { label: "Java", color: "#f89820", text: "#ffffff" },
    { label: "C++", color: "#00599c", text: "#ffffff" },
    { label: "JS", color: "#f7df1e", text: "#1a1a1a" },
    { label: "React", color: "#20232a", text: "#61dafb" },
    { label: "Next.js", color: "#111111", text: "#ffffff" },
    { label: "PyTorch", color: "#ee4c2c", text: "#ffffff" },
    { label: "Docker", color: "#2496ed", text: "#ffffff" },
    { label: "Jenkins", color: "#d24939", text: "#ffffff" },
    { label: "Nginx", color: "#009639", text: "#ffffff" },
    { label: "Linux", color: "#fcc624", text: "#1a1a1a" },
    { label: "Postgres", color: "#336791", text: "#ffffff" },
    { label: "Wazuh", color: "#3d82f1", text: "#ffffff" },
    { label: "GCP", color: "#4285f4", text: "#ffffff" },
  ],

  // Add GitHub / Instagram etc. here when you want them on the site.
  socials: [
    { label: "LinkedIn", icon: "fa-brands fa-linkedin-in", url: "https://linkedin.com/in/christopher-evan-w" },
    { label: "Email", icon: "fa-regular fa-envelope", url: "mailto:evanwijaksana@gmail.com" },
  ],

  education: "Bina Nusantara University — Computer Science (2023 – Present)",
  location: "Bandung, West Java",
};
