import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { HomePage } from './pages/HomePage';
import { CataloguePage } from './pages/CataloguePage';
import { ProductPage } from './pages/ProductPage';
import { EntreprisePage } from './pages/EntreprisePage';
import { QuiSommesNousPage } from './pages/QuiSommesNousPage';
import { DevisPage } from './pages/DevisPage';

export default function App() {
  return (
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
          </Routes>
        </main>
        <Footer />
        <CartDrawer />
      </ReviewsProvider>
    </CartProvider>
  );
}
