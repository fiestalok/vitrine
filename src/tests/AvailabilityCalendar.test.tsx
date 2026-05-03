import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AvailabilityCalendar } from '../components/product/AvailabilityCalendar';

describe('AvailabilityCalendar', () => {
  it('renders the current month name', () => {
    render(<AvailabilityCalendar productId="1" unavailableDates={[]} value={null} onChange={() => {}} />);
    const monthFr = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date());
    expect(screen.getByText(new RegExp(monthFr, 'i'))).toBeInTheDocument();
  });

  it('lets the user navigate to next month', async () => {
    render(<AvailabilityCalendar productId="1" unavailableDates={[]} value={null} onChange={() => {}} />);
    const before = screen.getByTestId('current-month').textContent;
    await userEvent.click(screen.getByLabelText('Mois suivant'));
    const after = screen.getByTestId('current-month').textContent;
    expect(after).not.toBe(before);
  });
});
