import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { portfolio } from '@/content/portfolio';
import HomePage from './page';

// jsdom has no WebGL; the 3D scenes are covered by the Playwright smoke tests.
vi.mock('@/lib/three/character-scene', () => ({
  createCharacterScene: () => null,
  createCharacterState: () => ({ xFrac: 0, y: 0, turn: 0, fade: 1, intro: 1 }),
}));

describe('HomePage', () => {
  it('server-renders every section from the portfolio content', () => {
    const { container } = render(<HomePage />);
    const ids = Array.from(container.querySelectorAll('main > section'), (section) => section.id);
    expect(ids).toEqual(['top', 'about', 'whatido', 'career', 'work', 'techstack', 'contact']);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      `${portfolio.firstName}${portfolio.lastName}`,
    );
  });

  it('links the main navigation to the page sections', () => {
    render(<HomePage />);
    const nav = within(screen.getByRole('navigation', { name: 'Main' }));
    expect(nav.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '#about',
      '#work',
      '#contact',
    ]);
  });

  it('shows the social rail with accessible labels and the resume link', () => {
    render(<HomePage />);
    const rail = within(screen.getByRole('complementary', { name: 'Social links' }));
    portfolio.socials.forEach((social) => {
      expect(rail.getByRole('link', { name: social.label })).toHaveAttribute('href', social.url);
    });
    const resume = screen.getByRole('link', { name: /Resume/ });
    expect(resume).toHaveAttribute('href', portfolio.resumeUrl);
    expect(resume).toHaveAttribute('target', '_blank');
  });

  it('renders a card for every project and the techstack section', () => {
    render(<HomePage />);
    portfolio.projects.forEach((project) => {
      expect(screen.getByRole('heading', { name: project.title })).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'My Techstack' })).toBeInTheDocument();
  });
});
