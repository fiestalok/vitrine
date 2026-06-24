import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ZonesPage } from '../pages/ZonesPage';

function renderZonesPage() {
  return render(
    <MemoryRouter>
      <ZonesPage />
    </MemoryRouter>
  );
}

test('affiche le H1 zones de livraison', () => {
  renderZonesPage();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/zones de livraison/i);
});

test('affiche Strasbourg dans la liste', () => {
  renderZonesPage();
  expect(screen.getByText('Strasbourg')).toBeInTheDocument();
});

test('affiche Haguenau dans la liste Bas-Rhin', () => {
  renderZonesPage();
  expect(screen.getByText('Haguenau')).toBeInTheDocument();
});

test('affiche Colmar dans la liste Haut-Rhin', () => {
  renderZonesPage();
  expect(screen.getByText('Colmar')).toBeInTheDocument();
});

test('contient un lien vers la page ville Strasbourg', () => {
  renderZonesPage();
  const link = screen.getByRole('link', { name: 'Strasbourg' });
  expect(link).toHaveAttribute('href', '/location/strasbourg');
});
