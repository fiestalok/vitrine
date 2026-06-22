import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { ProductsProvider } from './context/ProductsContext';
import { CategoriesProvider } from './context/CategoriesContext';
import { Navbar } from './components/layout/Navbar';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { HomePage } from './pages/HomePage';
import { CataloguePage } from './pages/CataloguePage';
import { ProductPage } from './pages/ProductPage';
import { EntreprisePage } from './pages/EntreprisePage';
import { QuiSommesNousPage } from './pages/QuiSommesNousPage';
import { DevisPage } from './pages/DevisPage';
import { SuiviPage } from './pages/SuiviPage';
import { MentionsLegalesPage } from './pages/MentionsLegalesPage';

export default function App() {
  return (
    <ProductsProvider>
      <CategoriesProvider>
        <CartProvider>
          <ReviewsProvider>
            <ScrollToTop />
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalogue" element={<CataloguePage />} />
                <Route path="/produit/:id" element={<ProductPage />} />
                <Route path="/entreprise" element={<EntreprisePage />} />
                <Route path="/qui-sommes-nous" element={<QuiSommesNousPage />} />
                <Route path="/devis" element={<DevisPage />} />
            <Route path="/suivi" element={<SuiviPage />} />
                <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
              </Routes>
            </main>
            <Footer />
            <CartDrawer />
          </ReviewsProvider>
        </CartProvider>
      </CategoriesProvider>
    </ProductsProvider>
  );
}
