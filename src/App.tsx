import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { ProductsProvider } from './context/ProductsContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { HomePage } from './pages/HomePage';
import { CataloguePage } from './pages/CataloguePage';
import { ProductPage } from './pages/ProductPage';
import { EntreprisePage } from './pages/EntreprisePage';
import { QuiSommesNousPage } from './pages/QuiSommesNousPage';
import { SuiviPage } from './pages/SuiviPage';

export default function App() {
  return (
    <ProductsProvider>
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
            <Route path="/suivi" element={<SuiviPage />} />
          </Routes>
        </main>
        <Footer />
        <CartDrawer />
      </ReviewsProvider>
    </CartProvider>
    </ProductsProvider>
  );
}
