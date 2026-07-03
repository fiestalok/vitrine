import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import { ChatWidget } from '../components/layout/ChatWidget';

const SCRIPT_ID = 'direct-chat-widget-script';

afterEach(() => {
  document.getElementById(SCRIPT_ID)?.remove();
  document.getElementById('direct-chat-host')?.remove();
  vi.unstubAllEnvs();
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ChatWidget />
    </MemoryRouter>
  );
}

test('n\'injecte pas le script si VITE_CHAT_WIDGET_URL n\'est pas configuré', () => {
  vi.stubEnv('VITE_CHAT_WIDGET_URL', '');
  renderAt('/');
  expect(document.getElementById(SCRIPT_ID)).toBeNull();
});

test('n\'injecte pas le script sur une page exclue (/devis)', () => {
  vi.stubEnv('VITE_CHAT_WIDGET_URL', 'https://chat.example.com');
  renderAt('/devis');
  expect(document.getElementById(SCRIPT_ID)).toBeNull();
});

test('injecte le script avec le backend configuré sur une page non exclue', () => {
  vi.stubEnv('VITE_CHAT_WIDGET_URL', 'https://chat.example.com');
  renderAt('/catalogue');
  const script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  expect(script).not.toBeNull();
  expect(script?.src).toBe('http://localhost:3000/widget.js');
  expect(script?.dataset.backend).toBe('https://chat.example.com');
});

test('n\'injecte le script qu\'une seule fois', () => {
  vi.stubEnv('VITE_CHAT_WIDGET_URL', 'https://chat.example.com');
  renderAt('/catalogue');
  renderAt('/');
  expect(document.querySelectorAll(`#${SCRIPT_ID}`)).toHaveLength(1);
});
