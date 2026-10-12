import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCharacterScene } from '@/lib/three/character-scene';
import { CharacterStage } from './CharacterStage';

vi.mock('@/lib/three/character-scene', () => ({
  createCharacterScene: vi.fn(),
  createCharacterState: (intro: number) => ({ xFrac: 0, y: -0.35, turn: 0, fade: 1, intro }),
}));

const createScene = vi.mocked(createCharacterScene);

describe('CharacterStage', () => {
  beforeEach(() => {
    window.innerWidth = 1000;
    window.innerHeight = 500;
  });

  afterEach(() => {
    createScene.mockReset();
    document.documentElement.classList.remove('no-webgl');
  });

  it('falls back to the CSS glow when WebGL is unavailable', () => {
    createScene.mockReturnValue(null);
    render(<CharacterStage />);
    expect(document.documentElement).toHaveClass('no-webgl');
  });

  it('feeds the pointer position to the scene in normalised coordinates', () => {
    const scene = { setPointer: vi.fn(), dispose: vi.fn() };
    createScene.mockReturnValue(scene);
    render(<CharacterStage />);

    fireEvent.pointerMove(window, { clientX: 750, clientY: 125 });

    expect(scene.setPointer).toHaveBeenCalledWith(0.5, 0.5);
    expect(document.documentElement).not.toHaveClass('no-webgl');
  });

  it('stops tracking and frees the scene on unmount', () => {
    const scene = { setPointer: vi.fn(), dispose: vi.fn() };
    createScene.mockReturnValue(scene);
    const { unmount } = render(<CharacterStage />);

    unmount();
    fireEvent.pointerMove(window, { clientX: 10, clientY: 10 });

    expect(scene.dispose).toHaveBeenCalledOnce();
    expect(scene.setPointer).not.toHaveBeenCalled();
  });
});
