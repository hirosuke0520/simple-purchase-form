import { Routes, Route } from "react-router-dom";
import SingleProductList from "./components/SingleProductList";
import SubscriptionDashboard from "./components/SubscriptionDashboard";
import ProductDetail from "./components/ProductDetail";
import SuccessPage from "./components/SuccessPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SingleProductList />} />
      <Route path="/dashboard" element={<SubscriptionDashboard />} />
      <Route path="/:productId" element={<ProductDetail />} />
      <Route path="/success" element={<SuccessPage />} />
    </Routes>
  );
}

export default App;