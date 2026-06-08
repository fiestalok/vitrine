import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Remet le scroll en haut de la page à chaque changement de route.
 * React Router ne réinitialise pas le scroll par défaut, ce qui conserve
 * la position de scroll de la page précédente lors d'une navigation.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
