import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileFilterBar } from '../components/catalogue/MobileFilterBar';
import { DEFAULT_FILTERS } from '../lib/filterProducts';

vi.mock('../context/CategoriesContext', () => ({
  useCategories: () => ({
    categories: [
      { id: 'chateau-gonflable', label: 'Châteaux', emoji: '🏰' },
      { id: 'accessoires', label: 'Accessoires', emoji: '🎉' },
    ],
    loading: false,
  }),
}));

const baseProps = {
  filters: { ...DEFAULT_FILTERS },
  onCategoryChange: vi.fn(),
};

describe('MobileFilterBar', () => {
  beforeEach(() => {
    baseProps.onCategoryChange.mockClear();
  });

  it('affiche le chip Tout et les chips des catégories', () => {
    render(<MobileFilterBar {...baseProps} />);
    expect(screen.getByRole('button', { name: /Tout/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Châteaux/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Accessoires/i })).toBeInTheDocument();
  });

  it("appelle onCategoryChange avec l'id correct au clic sur un chip", () => {
    const onCategoryChange = vi.fn();
    render(<MobileFilterBar {...baseProps} onCategoryChange={onCategoryChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Châteaux/i }));
    expect(onCategoryChange).toHaveBeenCalledWith('chateau-gonflable');
  });

  it('appelle onCategoryChange avec "all" au clic sur le chip Tout', () => {
    const onCategoryChange = vi.fn();
    render(<MobileFilterBar {...baseProps} onCategoryChange={onCategoryChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Tout/i }));
    expect(onCategoryChange).toHaveBeenCalledWith('all');
  });
});
