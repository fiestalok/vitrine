import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { HomePage } from '../pages/HomePage';

vi.mock('../context/ProductsContext', () => ({
  useProducts: () => ({ products: [], loading: false }),
}));
vi.mock('../context/CategoriesContext', () => ({
  useCategories: () => ({ categories: [], loading: false }),
}));
vi.mock('../context/CartContext', () => ({
  useCart: () => ({
    items: [],
    totalItems: 0,
    isOpen: false,
    open: vi.fn(),
    close: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
    removeItems: vi.fn(),
    setQuantity: vi.fn(),
    updateDates: vi.fn(),
    clear: vi.fn(),
  }),
}));

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

test('hero contient le CTA "Demander un devis" vers /devis', () => {
  renderHomePage();
  const link = screen.getByRole('link', { name: /demander un devis/i });
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute('href', '/devis');
});

test('hero contient le CTA "Voir le catalogue"', () => {
  renderHomePage();
  expect(screen.getByRole('link', { name: /voir le catalogue/i })).toBeInTheDocument();
});

test('la trust band affiche les éléments de confiance', () => {
  renderHomePage();
  expect(screen.getByText(/équipe certifiée/i)).toBeInTheDocument();
  expect(screen.getAllByText(/alsacien/i).length).toBeGreaterThan(0);
});
