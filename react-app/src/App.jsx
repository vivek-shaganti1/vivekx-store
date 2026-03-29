import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import API_BASE_URL from "./config";
import OrderSuccess from "./OrderSuccess";
import MyOrders from "./MyOrders";
import Login from "./login";
import Register from "./Register";
import Home from "./Home";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Products from "./Products";
import ProductDetails from "./ProductDetails";
import Checkout from "./Checkout";
import CheckoutSuccess from "./CheckoutSuccess";
import Cart from "./Cart";
import AdminOrders from "./AdminOrders";
import AdminDashboard from "./AdminDashboard";
import TrackOrder from "./TrackOrder";
import AddProduct from "./AddProduct";
import "./App.css";
import EditProduct from "./EditProduct";
import LandingPage from "./LandingPage";
import MyCollectibles from "./MyCollectibles";

/* =========================
   ROUTE GUARDS
========================= */
function PublicRoute({ user, children }) {
  return user ? <Navigate to="/home" replace /> : children;
}

function AdminRoute({ user, children }) {
  return user?.role === "ADMIN"
    ? children
    : <Navigate to="/home" replace />;
}

/* =========================
   MAIN APP
========================= */
function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [cartCount, setCartCount] = useState(0);

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  const [globalToast, setGlobalToast] = useState("");
  const previousOrdersRef = useRef([]);

  useEffect(() => {
    if (!user?.token || user.role === "ADMIN") return;

    function checkOrderStatus() {
      fetch(`${API_BASE_URL}/api/orders/my`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(data => {
          const prevOrders = previousOrdersRef.current;
          if (prevOrders.length > 0) {
            data.forEach(newOrder => {
              const prevOrder = prevOrders.find(o => o.id === newOrder.id);
              if (prevOrder && prevOrder.status !== newOrder.status) {
                const msg = `Order #${newOrder.id} status updated to ${newOrder.status}!`;

                setGlobalToast(msg);
                setTimeout(() => setGlobalToast(""), 5000);
              }
            });
          }
          previousOrdersRef.current = data;
        })
        .catch(() => { });
    }

    checkOrderStatus();
    const interval = setInterval(checkOrderStatus, 5000);
    return () => clearInterval(interval);
  }, [user]);

  function refreshCart() {
    if (!user?.token) {
      setCartCount(0);
      return;
    }

    fetch(`${API_BASE_URL}/api/cart`, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const total = data.reduce((s, i) => s + i.quantity, 0);
        setCartCount(total);
      })
      .catch(() => setCartCount(0));
  }

  useEffect(() => {
    refreshCart();
    window.addEventListener("cart-updated", refreshCart);
    return () => window.removeEventListener("cart-updated", refreshCart);
  }, [user]);

  useEffect(() => {
    function syncUser() {
      setUser(JSON.parse(localStorage.getItem("user")));
    }

    window.addEventListener("auth-change", syncUser);
    return () => window.removeEventListener("auth-change", syncUser);
  }, []);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const location = useLocation();

  function toggleTheme() {
    const t = theme === "dark" ? "light" : "dark";
    setTheme(t);
    localStorage.setItem("theme", t);
  }

  function handleLogout() {
    localStorage.removeItem("user");
    setUser(null);
    setCartCount(0);
    navigate("/login");
  }

  return (
    <>
      <nav className="nav-bar">
        <Link to="/home" className="nav-logo">
          VIVEKX
        </Link>

        <div className="nav-links">
          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              <Link to="/cart">Cart ({cartCount})</Link>
              <Link to="/orders">My Orders</Link>

              {user.role === "ADMIN" && (
                <>
                  <Link to="/admin">Dashboard</Link>
                  <Link to="/admin/orders">Orders</Link>
                </>
              )}

              <span>Hi, {user.name}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}

          <button onClick={toggleTheme}>Toggle Theme</button>
        </div>
      </nav>

      <div className="page-container">
        <Routes>

          {/* ✅ DEBUG ROOT */}
          <Route path="/" element={<h1>Landing Page Works</h1>} />

          {/* PUBLIC */}
          <Route path="/login" element={<PublicRoute user={user}><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute user={user}><Register /></PublicRoute>} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* USER */}
          <Route path="/home" element={user ? <Home /> : <Navigate to="/login" />} />
          <Route path="/products" element={user ? <Products /> : <Navigate to="/login" />} />
          <Route path="/product/:slug" element={user ? <ProductDetails /> : <Navigate to="/login" />} />
          <Route path="/cart" element={user ? <Cart /> : <Navigate to="/login" />} />
          <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/login" />} />
          <Route path="/order-success" element={user ? <CheckoutSuccess /> : <Navigate to="/login" />} />
          <Route path="/track-order" element={user ? <TrackOrder /> : <Navigate to="/login" />} />
          <Route path="/track-order/:id" element={user ? <TrackOrder /> : <Navigate to="/login" />} />
          <Route path="/orders" element={user ? <MyOrders /> : <Navigate to="/login" />} />
          <Route path="/my-collectibles" element={user ? <MyCollectibles /> : <Navigate to="/login" />} />

          {/* ADMIN */}
          <Route path="/admin" element={<AdminRoute user={user}><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute user={user}><AdminOrders /></AdminRoute>} />
          <Route path="/admin/add-product" element={<AdminRoute user={user}><AddProduct /></AdminRoute>} />
          <Route path="/edit/:id" element={<AdminRoute user={user}><EditProduct /></AdminRoute>} />

          {/* ✅ FALLBACK FIX */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </div>

      {globalToast && (
        <div className="lux-pd-toast show">
          {globalToast}
        </div>
      )}
    </>
  );
}

export default App;