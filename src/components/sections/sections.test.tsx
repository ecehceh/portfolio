import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Certification, Project } from '@/content/types';
import { portfolio } from '@/content/portfolio';
import { About } from './About';
import { Career } from './Career';
import { Certifications } from './Certifications';
import { Contact } from './Contact';
import { Hero } from './Hero';
import { ProjectCard } from './ProjectCard';
import { WhatIDo } from './WhatIDo';

const baseProject: Project = {
  title: 'Demo',
  category: 'Web',
  tools: 'Next.js',
  image: '',
  link: '',
  colors: ['#111111', '#222222'],
};

describe('Hero', () => {
  it('renders the name as the page heading and the rotating word slot', () => {
    render(
      <Hero firstName="JANE" lastName="DOE" heroKicker="A" heroTitle="DEV" rotatingWord={<span>WORD</span>} />,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('JANEDOE');
    expect(screen.getByText('WORD')).toBeInTheDocument();
  });
});

describe('About', () => {
  it('wraps every word in its own span and keeps the text intact', () => {
    const { container } = render(<About text="Hello  big world" />);
    const words = container.querySelectorAll('.about-text .w');
    expect(Array.from(words, (word) => word.textContent)).toEqual(['Hello', 'big', 'world']);
    expect(container.querySelector('.about-text')?.textContent).toBe('Hello  big world');
  });
});

describe('WhatIDo', () => {
  it('renders a card with chips for every service', () => {
    render(<WhatIDo services={portfolio.whatIDo} />);
    expect(screen.getAllByRole('article')).toHaveLength(portfolio.whatIDo.length);
    expect(screen.getByText('Docker Swarm')).toBeInTheDocument();
  });

  it('titles the section on one line, numbers the cards and labels their skill lists', () => {
    render(<WhatIDo services={portfolio.whatIDo} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('WHAT I DO');
    expect(screen.getByText('01')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getAllByRole('list', { name: 'Skills and tools' })).toHaveLength(portfolio.whatIDo.length);
  });
});

describe('Career', () => {
  it('places each entry on its own timeline row', () => {
    const { container } = render(<Career entries={portfolio.career} />);
    const items = container.querySelectorAll<HTMLElement>('.timeline-item');
    expect(items).toHaveLength(portfolio.career.length);
    expect(items[1]?.style.getPropertyValue('--row')).toBe('2');
    expect(container.querySelector<HTMLElement>('.timeline')?.style.getPropertyValue('--rows')).toBe(
      String(portfolio.career.length + 1),
    );
  });
});

describe('ProjectCard', () => {
  it('shows a gradient placeholder and no link for private work', () => {
    const { container } = render(<ProjectCard project={baseProject} index={0} />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(container.querySelector<HTMLElement>('.placeholder')?.style.background).toContain('radial-gradient');
  });

  it('turns the media into a new-tab link when the project has a url', () => {
    render(<ProjectCard project={{ ...baseProject, link: 'https://example.com' }} index={1} />);
    const link = screen.getByRole('link', { name: 'Open Demo' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('neutralises an unsafe project link', () => {
    render(<ProjectCard project={{ ...baseProject, link: 'javascript:alert(1)' }} index={0} />);
    expect(screen.getByRole('link', { name: 'Open Demo' })).toHaveAttribute('href', '#');
  });

  it('renders the project image when one is set', () => {
    render(<ProjectCard project={{ ...baseProject, image: '/projects/demo.webp' }} index={0} />);
    expect(screen.getByRole('img', { name: 'Demo preview' })).toBeInTheDocument();
  });
});

const cert: Certification = {
  name: 'Cloud Practitioner',
  issuer: 'Amazon Web Services',
  issued: '2025-03-01',
  image: '/badges/cloud-practitioner-abcdef12.png',
  url: 'https://www.credly.com/badges/abcdef12',
};

describe('Certifications', () => {
  it('renders nothing until badges are synced', () => {
    const { container } = render(<Certifications certifications={[]} profileUrl="https://www.credly.com/users/jane" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('links every badge to its Credly page in a new tab, with the issuer and date', () => {
    render(<Certifications certifications={[cert]} profileUrl="" />);
    const card = screen.getByRole('link', { name: /Cloud Practitioner/ });
    expect(card).toHaveAttribute('href', cert.url);
    expect(card).toHaveAttribute('target', '_blank');
    expect(card).toHaveAttribute('rel', 'noopener noreferrer');
    expect(within(card).getByText('Amazon Web Services')).toBeInTheDocument();
    expect(within(card).getByText('Mar 2025')).toHaveAttribute('dateTime', '2025-03-01');
    expect(screen.queryByRole('link', { name: /View all on Credly/ })).not.toBeInTheDocument();
  });

  it('shows the "View all" link when a profile is set', () => {
    render(<Certifications certifications={[cert]} profileUrl="https://www.credly.com/users/jane" />);
    expect(screen.getByRole('link', { name: /View all on Credly/ })).toHaveAttribute(
      'href',
      'https://www.credly.com/users/jane',
    );
  });

  it('neutralises an unsafe badge link', () => {
    render(<Certifications certifications={[{ ...cert, url: 'javascript:alert(1)' }]} profileUrl="" />);
    expect(screen.getByRole('link', { name: /Cloud Practitioner/ })).toHaveAttribute('href', '#');
  });
});

describe('Contact', () => {
  it('lists email, socials and the credit line', () => {
    render(
      <Contact
        name="Jane Doe"
        email="jane@example.com"
        education="Uni"
        location="City"
        socials={portfolio.socials}
      />,
    );
    expect(screen.getByRole('link', { name: 'jane@example.com' })).toHaveAttribute('href', 'mailto:jane@example.com');
    const socials = within(screen.getByRole('list'));
    expect(socials.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('target', '_blank');
    expect(socials.getByRole('link', { name: /Email/ })).not.toHaveAttribute('target');
    expect(screen.getByText(String(new Date().getFullYear()))).toBeInTheDocument();
  });
});
