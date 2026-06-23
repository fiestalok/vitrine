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
  maxAvailable: 400,
  onCategoryChange: vi.fn(),
  onFiltersOpen: vi.fn(),
};

describe('MobileFilterBar', () => {
  beforeEach(() => {
    baseProps.onCategoryChange.mockClear();
    baseProps.onFiltersOpen.mockClear();
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

  it('affiche "⚙ Filtres" sans compteur quand aucun filtre actif', () => {
    render(<MobileFilterBar {...baseProps} />);
    expect(screen.getByRole('button', { name: '⚙ Filtres' })).toBeInTheDocument();
  });

  it('affiche "⚙ Filtres (1)" quand une audience est sélectionnée', () => {
    render(
      <MobileFilterBar
        {...baseProps}
        filters={{ ...DEFAULT_FILTERS, audiences: ['enfants'] }}
      />
    );
    expect(screen.getByRole('button', { name: '⚙ Filtres (1)' })).toBeInTheDocument();
  });

  it('affiche "⚙ Filtres (2)" pour audiences + budget réduit', () => {
    render(
      <MobileFilterBar
        {...baseProps}
        filters={{ ...DEFAULT_FILTERS, audiences: ['adultes'], maxPrice: 100 }}
        maxAvailable={400}
      />
    );
    expect(screen.getByRole('button', { name: '⚙ Filtres (2)' })).toBeInTheDocument();
  });

  it('appelle onFiltersOpen au clic sur le bouton Filtres', () => {
    const onFiltersOpen = vi.fn();
    render(<MobileFilterBar {...baseProps} onFiltersOpen={onFiltersOpen} />);
    fireEvent.click(screen.getByRole('button', { name: /Filtres/ }));
    expect(onFiltersOpen).toHaveBeenCalledOnce();
  });
});
