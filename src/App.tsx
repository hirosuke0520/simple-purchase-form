import { Routes, Route } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import SuccessPage from './components/SuccessPage';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProductList />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/:productId" element={<ProductDetail />} />
      <Route path="/success" element={<SuccessPage />} />
    </Routes>
  );
}

export default App;