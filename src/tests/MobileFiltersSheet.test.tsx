import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileFiltersSheet } from '../components/catalogue/MobileFiltersSheet';
import { DEFAULT_FILTERS } from '../lib/filterProducts';

const baseProps = {
  open: true,
  value: { ...DEFAULT_FILTERS, maxPrice: 400 },
  maxAvailable: 400,
  onChange: vi.fn(),
  onClose: vi.fn(),
};

describe('MobileFiltersSheet', () => {
  it('ne rend rien quand open=false', () => {
    const { container } = render(<MobileFiltersSheet {...baseProps} open={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('affiche les 3 sections de filtre quand open=true', () => {
    render(<MobileFiltersSheet {...baseProps} />);
    expect(screen.getByText(/Disponibilité/i)).toBeInTheDocument();
    expect(screen.getByText(/Pour qui/i)).toBeInTheDocument();
    expect(screen.getByText(/Budget max/i)).toBeInTheDocument();
  });

  it('appelle onClose au clic sur le fond (overlay)', () => {
    const onClose = vi.fn();
    render(<MobileFiltersSheet {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('sheet-overlay'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('n\'appelle pas onClose au clic dans le panneau', () => {
    const onClose = vi.fn();
    render(<MobileFiltersSheet {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('sheet-panel'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('appelle onChange quand une audience est cochée', () => {
    const onChange = vi.fn();
    render(<MobileFiltersSheet {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText(/🧒 Enfants/i));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ audiences: ['enfants'] })
    );
  });

  it('affiche le bouton Réinitialiser quand des filtres sont actifs', () => {
    render(
      <MobileFiltersSheet
        {...baseProps}
        value={{ ...DEFAULT_FILTERS, maxPrice: 400, audiences: ['enfants'] }}
      />
    );
    expect(screen.getByRole('button', { name: /Réinitialiser/i })).toBeInTheDocument();
  });

  it('n\'affiche pas le bouton Réinitialiser quand aucun filtre actif', () => {
    render(<MobileFiltersSheet {...baseProps} />);
    expect(screen.queryByRole('button', { name: /Réinitialiser/i })).toBeNull();
  });

  it('appelle onDateChange si fourni quand les dates changent', () => {
    const onDateChange = vi.fn();
    const onChange = vi.fn();
    render(
      <MobileFiltersSheet
        {...baseProps}
        onChange={onChange}
        onDateChange={onDateChange}
        value={{ ...DEFAULT_FILTERS, maxPrice: 400, dateStart: '', dateEnd: '' }}
      />
    );
    const inputs = screen.getAllByDisplayValue('');
    fireEvent.change(inputs[0], { target: { value: '2026-07-01' } });
    expect(onDateChange).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('appelle onClose quand la touche Escape est pressée', () => {
    const onClose = vi.fn();
    render(<MobileFiltersSheet {...baseProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('verrouille le scroll du body quand open=true et le restaure à la fermeture', () => {
    const { rerender } = render(<MobileFiltersSheet {...baseProps} open={true} />);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<MobileFiltersSheet {...baseProps} open={false} />);
    expect(document.body.style.overflow).toBe('');
  });
});
