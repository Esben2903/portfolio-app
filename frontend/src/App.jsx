import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isLoggedIn } from "./services/api";
import PortfolioPage from "./pages/PortfolioPage";
import RealizedPage from "./pages/RealizedPage";
import TradesPage from "./pages/TradesPage";
import LoginPage from "./pages/LoginPage";

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><PortfolioPage /></PrivateRoute>} />
        <Route path="/realized" element={<PrivateRoute><RealizedPage /></PrivateRoute>} />
        <Route path="/trades" element={<PrivateRoute><TradesPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;