import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { VillePage } from '../pages/VillePage';

vi.mock('../context/ProductsContext', () => ({
  useProducts: () => ({ products: [], loading: false }),
}));
vi.mock('../context/CategoriesContext', () => ({
  useCategories: () => ({ categories: [], loading: false }),
}));

function renderVillePage(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/location/${slug}`]}>
      <Routes>
        <Route path="/location/:slug" element={<VillePage />} />
        <Route path="/catalogue" element={<div>catalogue</div>} />
      </Routes>
    </MemoryRouter>
  );
}

test('affiche le H1 correct pour Strasbourg', () => {
  renderVillePage('strasbourg');
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/strasbourg/i);
});

test('affiche le texte d\'intro pour Strasbourg', () => {
  renderVillePage('strasbourg');
  expect(screen.getAllByText(/neudorf/i).length).toBeGreaterThan(0);
});

test('affiche les questions FAQ de la ville', () => {
  renderVillePage('strasbourg');
  expect(screen.getByText(/livrez-vous dans tous les quartiers de strasbourg/i)).toBeInTheDocument();
});

test('redirige vers /catalogue pour un slug inconnu', () => {
  renderVillePage('inconnu');
  expect(screen.getByText('catalogue')).toBeInTheDocument();
});

test('affiche les 4 services', () => {
  renderVillePage('strasbourg');
  expect(screen.getAllByText(/château gonflable/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/photobooth/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/pop-corn/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/enceinte/i).length).toBeGreaterThan(0);
});

test('affiche le CTA devis avec le nom de la ville', () => {
  renderVillePage('haguenau');
  expect(screen.getByRole('link', { name: /devis.*haguenau/i })).toBeInTheDocument();
});
