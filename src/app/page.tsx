import { Nav } from '@/components/layout/Nav';
import { CharacterStage } from '@/components/motion/CharacterStage';
import { SideRail } from '@/components/layout/SideRail';
import { About } from '@/components/sections/About';
import { Career } from '@/components/sections/Career';
import { Contact } from '@/components/sections/Contact';
import { Hero } from '@/components/sections/Hero';
import { TechStack } from '@/components/sections/TechStack';
import { WhatIDo } from '@/components/sections/WhatIDo';
import { Work } from '@/components/sections/Work';
import { portfolio } from '@/content/portfolio';
import { displayName } from '@/lib/format';

export default function HomePage() {
  const data = portfolio;
  return (
    <>
      <CharacterStage />
      <Nav logo={data.logo} email={data.email} />
      <SideRail socials={data.socials} resumeUrl={data.resumeUrl} />
      <main>
        <Hero
          firstName={data.firstName}
          lastName={data.lastName}
          heroKicker={data.heroKicker}
          heroTitle={data.heroTitle}
          rotatingWord={<span className="hero-word gradient">{data.heroWords[0]}</span>}
        />
        <About text={data.about} />
        <WhatIDo services={data.whatIDo} />
        <Career entries={data.career} />
        <Work projects={data.projects} />
        <TechStack canvas={null} />
        <Contact
          name={displayName(data)}
          email={data.email}
          education={data.education}
          location={data.location}
          socials={data.socials}
        />
      </main>
    </>
  );
}
