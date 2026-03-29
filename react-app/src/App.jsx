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

  /* Global Toast for Order Notifications */
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

                if ("Notification" in window) {
                  if (Notification.permission === "granted") {
                    new Notification("VIVEKX Status Update", { body: msg });
                  } else if (Notification.permission !== "denied") {
                    Notification.requestPermission().then(permission => {
                      if (permission === "granted") {
                        new Notification("VIVEKX Status Update", { body: msg });
                      }
                    });
                  }
                }

                setGlobalToast(msg);
                setTimeout(() => setGlobalToast(""), 5000);
              }
            });
          }
          previousOrdersRef.current = data;
        })
        .catch(() => { });
    }

    // Initial check and regular polling
    checkOrderStatus();
    const interval = setInterval(checkOrderStatus, 5000);
    return () => clearInterval(interval);
  }, [user]);

  /* =========================
     CART COUNT
  ========================= */
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

  /* =========================
     THEME
  ========================= */
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const location = useLocation();

  // HIGH-PERFORMANCE MOUSE TRACKER (CSS Variable Method - Zero Lag)
  useEffect(() => {
    if (theme !== 'panther') return;
    const hud = document.querySelector('.panther-hud');
    const handleMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      document.documentElement.style.setProperty('--mx', `${x}px`);
      document.documentElement.style.setProperty('--my', `${y}px`);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [theme]);

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
      {/* BLACK PANTHER EXCLUSIVE HUD */}
      {theme === 'panther' && (
        <>
          <div className="panther-hud">
            <div className="panther-grid" />
            <div className="panther-stars" />
            <div className="panther-particles" />

            {/* 3D KINETIC OBJECT (Simulated) */}
            <div className="panther-3d-object-wrap">
              <div className="panther-3d-object" />
            </div>

            <div className="panther-dripping">
              <span className="drip-1"></span>
              <span className="drip-2"></span>
              <span className="drip-3"></span>
            </div>
          </div>
          <div className="panther-cursor" />
        </>
      )}

      {/* =========================
          NAVBAR
      ========================= */}
      <nav className="nav-bar">

        <Link to="/home" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {theme === 'panther' && <span className="vxp-badge">P-01</span>}
          <div className="logo-text-wrap" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
            <span className="logo-main">VIVEKX</span>
            <span className="logo-sub">Collections</span>
          </div>
        </Link>

        {/* NAV LINKS */}
        <div className="nav-links">

          {!user ? (
            <>
              <div className="nav-item">
                <Link to="/login">Login</Link>
                <img src="/dark/arrow.png" className="nav-hover-arrow" alt="" />
              </div>

              <div className="nav-item">
                <Link to="/register">Register</Link>
                <img src="/dark/arrow.png" className="nav-hover-arrow" alt="" />
              </div>
            </>
          ) : (
            <>
              <div className="nav-item">
                <Link to="/cart">
                  Cart <span className="cart-count">{cartCount}</span>
                </Link>
                <img src="/dark/arrow.png" className="nav-hover-arrow" alt="" />
              </div>

              <div className="nav-item">
                <Link to="/orders">My Orders</Link>
                <img src="/dark/arrow.png" className="nav-hover-arrow" alt="" />
              </div>

              {user.role === "ADMIN" && (
                <>
                  <div className="nav-item">
                    <Link to="/admin">Dashboard</Link>
                    <img src="/dark/arrow.png" className="nav-hover-arrow" alt="" />
                  </div>

                  <div className="nav-item">
                    <Link to="/admin/orders">Orders</Link>
                    <img src="/dark/arrow.png" className="nav-hover-arrow" alt="" />
                  </div>
                </>
              )}

              <div className="nav-item nav-user">
                Hi, {user.name}
                <img src="/dark/arrow.png" className="nav-hover-arrow" alt="" />
              </div>

              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}

          <button
            className={`panther-toggle ${theme === 'panther' ? 'active' : ''}`}
            onClick={() => {
              const t = theme === 'panther' ? 'dark' : 'panther';
              setTheme(t);
              localStorage.setItem('theme', t);
            }}
            title="Panther Edition"
          >
            <span>🐈‍⬛</span>
          </button>

          <button className="theme-toggle" onClick={toggleTheme}>
            <span className="toggle-thumb" />
          </button>
        </div>
      </nav>

      {/* =========================
          PAGE CONTENT
      ========================= */}
      <div className="page-container">
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<LandingPage theme={theme} />} />
          <Route path="/landing" element={<LandingPage theme={theme} />} />
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
          <Route path="/admin/add-product"
            element={
              <AdminRoute user={user}>
                <AddProduct />
              </AdminRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <AdminRoute user={user}>
                <EditProduct />
              </AdminRoute>
            }
          />
        </Routes>
      </div>

      {/* =========================
          GLOBAL NOTIFICATIONS
      ========================= */}
      {globalToast && (
        <div className="lux-pd-toast show" style={{ zIndex: 999999 }}>
          <div className="toast-icon">✨</div>
          <div className="toast-text">{globalToast}</div>
        </div>
      )}
    </>
  );
}

export default App;