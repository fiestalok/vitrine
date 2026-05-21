import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { ProductsProvider } from './context/ProductsContext';
import { CategoriesProvider } from './context/CategoriesContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { HomePage } from './views/HomePage';
import { CataloguePage } from './views/CataloguePage';
import { ProductPage } from './views/ProductPage';
import { EntreprisePage } from './views/EntreprisePage';
import { QuiSommesNousPage } from './views/QuiSommesNousPage';
import { DevisPage } from './views/DevisPage';
import { SuiviPage } from './views/SuiviPage';

export default function App() {
  return (
    <ProductsProvider>
      <CategoriesProvider>
        <CartProvider>
          <ReviewsProvider>
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
