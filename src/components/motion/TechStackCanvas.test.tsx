import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Tech } from '@/content/types';
import { createTechstackScene } from '@/lib/three/techstack-scene';
import { TechStackCanvas } from './TechStackCanvas';

vi.mock('@/lib/three/techstack-scene', () => ({ createTechstackScene: vi.fn() }));

const createScene = vi.mocked(createTechstackScene);
const techs: Tech[] = [{ label: 'Go', color: '#00add8', text: '#ffffff' }];

describe('TechStackCanvas', () => {
  afterEach(() => createScene.mockReset());

  it('exposes the canvas as a labelled image', () => {
    createScene.mockReturnValue(null);
    render(<TechStackCanvas techs={techs} />);
    expect(screen.getByRole('img', { name: /technologies I use/ })).toBeInTheDocument();
  });

  it('builds the scene once fonts are ready, with the resolved font stack', async () => {
    createScene.mockReturnValue({ dispose: vi.fn() });
    render(<TechStackCanvas techs={techs} />);
    await waitFor(() => expect(createScene).toHaveBeenCalledOnce());
    const [canvas, passedTechs, fontFamily] = createScene.mock.calls[0]!;
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(passedTechs).toBe(techs);
    expect(typeof fontFamily).toBe('string');
  });

  it('disposes the scene on unmount', async () => {
    const scene = { dispose: vi.fn() };
    createScene.mockReturnValue(scene);
    const { unmount } = render(<TechStackCanvas techs={techs} />);
    await waitFor(() => expect(createScene).toHaveBeenCalled());
    unmount();
    expect(scene.dispose).toHaveBeenCalledOnce();
  });

  it('never builds the scene if unmounted before fonts load', async () => {
    const { unmount } = render(<TechStackCanvas techs={techs} />);
    unmount();
    await Promise.resolve();
    await Promise.resolve();
    expect(createScene).not.toHaveBeenCalled();
  });
});
