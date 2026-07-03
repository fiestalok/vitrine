import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Charge le widget Direct_Chat (script vanilla, public/widget.js) et masque
 * son bulle/panneau sur les pages qui ont déjà leur propre canal de contact
 * (devis, suivi de commande). Le script n'est injecté qu'une fois, la
 * première fois qu'une route non exclue est visitée.
 */
const EXCLUDED_PATHS = ['/devis', '/suivi'];
const WIDGET_SCRIPT_ID = 'direct-chat-widget-script';

export function ChatWidget() {
  const { pathname } = useLocation();
  const backendUrl = import.meta.env.VITE_CHAT_WIDGET_URL;
  const hidden = EXCLUDED_PATHS.includes(pathname);

  useEffect(() => {
    if (!backendUrl || hidden) return;
    if (document.getElementById(WIDGET_SCRIPT_ID)) return;
    const script = document.createElement('script');
    script.id = WIDGET_SCRIPT_ID;
    script.src = '/widget.js';
    script.async = true;
    script.dataset.backend = backendUrl;
    document.body.appendChild(script);
  }, [backendUrl, hidden]);

  useEffect(() => {
    const host = document.getElementById('direct-chat-host');
    if (host) host.style.display = hidden ? 'none' : '';
  }, [hidden, pathname]);

  return null;
}
