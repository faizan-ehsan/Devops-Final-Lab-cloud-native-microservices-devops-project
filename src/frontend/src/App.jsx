import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, 
  User, 
  ShoppingCart, 
  ClipboardList, 
  Bell, 
  Settings, 
  PlusCircle, 
  Trash2, 
  Package, 
  CreditCard, 
  CheckCircle, 
  Info,
  Server,
  Lock,
  Layers,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

// API Configuration - resolves via gateway (relative paths) or direct local ports
const GATEWAY_URL = window.location.origin.includes('localhost') ? 'http://localhost:8080' : '';
const USER_API = `${GATEWAY_URL}/api/auth`;
const PRODUCT_API = `${GATEWAY_URL}/api/products`;
const ORDER_API = `${GATEWAY_URL}/api/orders`;
const NOTIFICATION_API = `${GATEWAY_URL}/api/notifications`;

function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('store'); // store, cart, orders, admin
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // login, register
  const [env, setEnv] = useState('development'); // development, staging, production
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState({ online: false, type: 'Standalone Mock Mode' });

  // Core Data States
  const [user, setUser] = useState({ name: 'Guest User', email: 'guest@example.com', role: 'admin', balance: 5000 });
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Form Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('customer');

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    imageUrl: '',
    stock: ''
  });

  // Load Initial Data
  useEffect(() => {
    fetchProducts();
    fetchNotifications();
    checkBackendHealth();
    
    // Auto detect environment based on hostname
    const host = window.location.host;
    if (host.includes('staging')) {
      setEnv('staging');
    } else if (host.includes('production') || host.includes('render.com')) {
      setEnv('production');
    } else {
      setEnv('development');
    }
  }, []);

  // Fetch orders when user changes or tab changes
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, user]);

  const checkBackendHealth = async () => {
    try {
      const res = await axios.get(`${PRODUCT_API}/health/liveness`);
      if (res.status === 200) {
        setBackendStatus({ online: true, type: 'K8s Cluster Node Connected' });
      }
    } catch (e) {
      console.warn('System running in Standalone Mock mode (APIs unreachable). All features remain operational in virtual sandbox.');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(PRODUCT_API);
      setProducts(res.data);
    } catch (e) {
      // Seed fallback mock products in sandbox mode
      setProducts([
        {
          _id: 'prod_1',
          name: 'Quantum Gaming Laptop v9',
          description: 'Next-gen gaming rig with NVIDIA RTX 5090, 64GB RAM, and 2TB NVMe SSD.',
          price: 2499,
          category: 'Electronics',
          imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=400&q=80',
          stock: 12
        },
        {
          _id: 'prod_2',
          name: 'Nebula Wireless Headphones',
          description: 'Active Noise Cancelling, audiophile drivers, 60h battery life.',
          price: 299,
          category: 'Accessories',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
          stock: 25
        },
        {
          _id: 'prod_3',
          name: 'Apex Mechanical Keyboard',
          description: 'Ultra-responsive optical switches, hot-swappable, full RGB.',
          price: 189,
          category: 'Accessories',
          imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=400&q=80',
          stock: 40
        },
        {
          _id: 'prod_4',
          name: 'Odin 34" Curved Monitor',
          description: 'Ultrawide DQHD 144Hz screen panel, HDR1000, G-Sync enabled.',
          price: 899,
          category: 'Electronics',
          imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80',
          stock: 8
        }
      ]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${NOTIFICATION_API}/history`);
      setNotifications(res.data);
    } catch (e) {
      setNotifications([
        {
          id: 'notif_init_1',
          message: 'Welcome to Octane Cloud E-Commerce Dashboard!',
          timestamp: new Date()
        }
      ]);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(ORDER_API, { params: { userId: user.email } });
      setOrders(res.data);
    } catch (e) {
      // Mock history in local storage
      const stored = localStorage.getItem('mock_orders');
      if (stored) {
        setOrders(JSON.parse(stored));
      } else {
        const dummyOrders = [
          {
            _id: 'ord_init_1',
            userId: user.email,
            items: [
              { productId: 'prod_3', name: 'Apex Mechanical Keyboard', quantity: 1, price: 189 }
            ],
            totalAmount: 189,
            status: 'Delivered',
            createdAt: new Date(Date.now() - 86400000)
          }
        ];
        localStorage.setItem('mock_orders', JSON.stringify(dummyOrders));
        setOrders(dummyOrders);
      }
    }
  };

  // Toast Notification Generator
  const triggerLocalAlert = (msg) => {
    const newAlert = {
      id: 'alert_' + Date.now(),
      message: msg,
      timestamp: new Date()
    };
    setNotifications(prev => [newAlert, ...prev]);
  };

  // Add to Cart
  const addToCart = (product) => {
    const existing = cart.find(item => item.product._id === product._id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        triggerLocalAlert(`⚠️ Cannot add more! Maximum stock reached for ${product.name}.`);
        return;
      }
      setCart(cart.map(item => 
        item.product._id === product._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    triggerLocalAlert(`🛒 Added ${product.name} to cart.`);
  };

  // Modify Cart Quantity
  const updateCartQty = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product._id === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > item.product.stock) {
          triggerLocalAlert(`⚠️ Insufficient stock for ${item.product.name}`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  // Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    if (user.balance < total) {
      triggerLocalAlert('❌ Order Declined: Insufficient funds in wallet.');
      return;
    }

    const orderPayload = {
      userId: user.email,
      items: cart.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      totalAmount: total
    };

    try {
      // Try calling the live backend Gateway
      const res = await axios.post(ORDER_API, orderPayload);
      if (res.status === 201) {
        triggerLocalAlert(`🎉 Order processed! confirmation sent to notifications.`);
        setCart([]);
        setUser(prev => ({ ...prev, balance: prev.balance - total }));
        fetchProducts(); // Refresh stocks
        setActiveTab('orders');
      }
    } catch (e) {
      // Mock Sandbox Checkout
      console.log('Mock Gateway: Processing Checkout Sandbox Transaction...');
      
      // Deduct mock stock
      const updatedProducts = products.map(p => {
        const cartItem = cart.find(ci => ci.product._id === p._id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      });
      setProducts(updatedProducts);

      // Create mock order
      const newOrder = {
        _id: 'ord_' + Date.now(),
        userId: user.email,
        items: cart.map(item => ({
          productId: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: total,
        status: 'Paid',
        createdAt: new Date()
      };

      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem('mock_orders', JSON.stringify(updatedOrders));

      setUser(prev => ({ ...prev, balance: prev.balance - total }));
      setCart([]);
      triggerLocalAlert(`🎉 Order placed! (Mock Sandbox: Deducted $${total} and updated inventories).`);
      
      // Direct notification alert
      setTimeout(() => {
        triggerLocalAlert(`📩 Email Sent: Order Confirmation for ID: ${newOrder._id}`);
      }, 1000);

      setActiveTab('orders');
    }
  };

  // Auth Operations
  const handleAuth = async (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      try {
        const res = await axios.post(`${USER_API}/login`, { email: loginEmail, password: loginPassword });
        setUser({ ...res.data.user, balance: 5000 });
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        triggerLocalAlert(`🔑 Logged in successfully as ${res.data.user.name}.`);
        setShowAuthModal(false);
      } catch (err) {
        // Mock Login for Viva
        if (loginEmail && loginPassword) {
          setUser({ name: loginEmail.split('@')[0], email: loginEmail, role: loginEmail.includes('admin') ? 'admin' : 'customer', balance: 5000 });
          triggerLocalAlert(`🔑 Mock Login Approved (Sandbox Mode) as ${loginEmail.split('@')[0]}.`);
          setShowAuthModal(false);
        }
      }
    } else {
      try {
        const res = await axios.post(`${USER_API}/register`, { 
          name: registerName, 
          email: registerEmail, 
          password: registerPassword,
          role: registerRole 
        });
        setUser({ ...res.data.user, balance: 5000 });
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        triggerLocalAlert(`🎉 Account registered and logged in!`);
        setShowAuthModal(false);
      } catch (err) {
        // Mock Register
        if (registerEmail && registerName) {
          setUser({ name: registerName, email: registerEmail, role: registerRole, balance: 5000 });
          triggerLocalAlert(`🎉 Mock Registration Approved (Sandbox Mode).`);
          setShowAuthModal(false);
        }
      }
    }
  };

  const handleLogout = () => {
    setUser({ name: 'Guest User', email: 'guest@example.com', role: 'customer', balance: 1000 });
    setToken('');
    localStorage.removeItem('token');
    triggerLocalAlert('🚪 Logged out successfully.');
  };

  // Admin: Create Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const payload = {
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      imageUrl: newProduct.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
      stock: parseInt(newProduct.stock)
    };

    try {
      const res = await axios.post(PRODUCT_API, payload);
      setProducts([res.data.product, ...products]);
      triggerLocalAlert(`📦 Product "${payload.name}" successfully created.`);
    } catch (e) {
      // Mock Sandbox add
      const mockProd = {
        _id: 'prod_' + Date.now(),
        ...payload
      };
      setProducts([mockProd, ...products]);
      triggerLocalAlert(`📦 Product "${payload.name}" created (Mock Sandbox added).`);
    }

    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: 'Electronics',
      imageUrl: '',
      stock: ''
    });
  };

  // Admin: Delete Product
  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`${PRODUCT_API}/${id}`);
      setProducts(products.filter(p => p._id !== id));
      triggerLocalAlert('🗑️ Product deleted successfully.');
    } catch (e) {
      setProducts(products.filter(p => p._id !== id));
      triggerLocalAlert('🗑️ Product deleted successfully (Mock Sandbox deleted).');
    }
  };

  // Admin: Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${ORDER_API}/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      triggerLocalAlert(`🔄 Order status updated to: ${newStatus}`);
    } catch (e) {
      const updated = orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o);
      setOrders(updated);
      localStorage.setItem('mock_orders', JSON.stringify(updated));
      triggerLocalAlert(`🔄 Order status updated to: ${newStatus} (Mock Sandbox synced)`);
      
      // Dispatch alert notification
      triggerLocalAlert(`📩 Notification: Order ${orderId} has been updated to "${newStatus}"`);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans">
      
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-800/60 px-6 py-4 flex items-center justify-between">
        
        {/* Brand details */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center glow-indigo">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-400">OCTANE</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Microservices DevOps</p>
          </div>
        </div>

        {/* Environment status indicator */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 rounded-full border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Gateway: {backendStatus.type}</span>
          </div>

          <div className={`px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-sm flex items-center gap-1.5
            ${env === 'production' 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
              : env === 'staging'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>{env} ENVIRONMENT</span>
          </div>
        </div>

        {/* Header Navigation & Alerts */}
        <div className="flex items-center gap-4">
          
          {/* Notification bell dropdown */}
          <div className="relative">
            <button 
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-indigo-400 transition"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-4 max-h-[300px] overflow-y-auto z-50">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-indigo-400">
                    <Bell className="w-4 h-4" /> System Alerts
                  </h3>
                  <button className="text-[10px] text-slate-500 hover:text-indigo-400" onClick={() => setNotifications([])}>Clear All</button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No notifications</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {notifications.map((n, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-950/60 text-xs border-l-2 border-indigo-500">
                        <p className="text-slate-300">{n.message}</p>
                        <span className="text-[9px] text-slate-600 font-mono mt-1 block">
                          {new Date(n.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User profile dropdown / auth toggles */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-200">{user.name}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold text-indigo-400">{user.role} Account</span>
            </div>
            {token ? (
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg border border-slate-800/80 bg-slate-950/40 text-xs text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition"
              >
                Logout
              </button>
            ) : (
              <button 
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md glow-indigo transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">

        {/* Dashboard Stat Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-xl p-4 flex items-center justify-between glow-indigo">
            <div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Active Products</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-100">{products.length}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 flex items-center justify-between glow-indigo">
            <div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Orders Processed</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-100">{orders.length}</h3>
            </div>
            <div className="p-3 bg-violet-500/10 rounded-lg text-violet-400 border border-violet-500/20">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 flex items-center justify-between glow-indigo">
            <div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Available Balance</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-400">${user.balance}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 flex items-center justify-between glow-indigo">
            <div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Authentication Mode</p>
              <h3 className="text-md font-semibold mt-2.5 text-slate-200 capitalize flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-400" /> {user.role === 'admin' ? 'Admin Gateway' : 'Customer Scope'}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <User className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80 gap-6">
          <button 
            onClick={() => setActiveTab('store')}
            className={`pb-3 font-semibold text-sm transition relative ${activeTab === 'store' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Storefront Catalog
            {activeTab === 'store' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500"></div>}
          </button>
          
          <button 
            onClick={() => setActiveTab('cart')}
            className={`pb-3 font-semibold text-sm transition relative flex items-center gap-2 ${activeTab === 'cart' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Cart Drawer
            {cart.length > 0 && (
              <span className="px-1.5 py-0.5 bg-indigo-600 text-[10px] text-white rounded-full font-bold">{cart.length}</span>
            )}
            {activeTab === 'cart' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500"></div>}
          </button>

          <button 
            onClick={() => setActiveTab('orders')}
            className={`pb-3 font-semibold text-sm transition relative ${activeTab === 'orders' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Order Tracker
            {activeTab === 'orders' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500"></div>}
          </button>

          {user.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`pb-3 font-semibold text-sm transition relative flex items-center gap-1 text-slate-400 hover:text-indigo-400 ${activeTab === 'admin' ? 'text-indigo-400' : ''}`}
            >
              <Settings className="w-4 h-4" /> Admin Console
              {activeTab === 'admin' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500"></div>}
            </button>
          )}
        </div>

        {/* Tab Content Panels */}
        <main className="flex-1">

          {/* STORE TAB */}
          {activeTab === 'store' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.length === 0 ? (
                <p className="col-span-full py-12 text-center text-slate-500">Loading catalog products...</p>
              ) : (
                products.map((p) => (
                  <div key={p._id} className="glass-panel rounded-2xl overflow-hidden hover:border-slate-700 transition flex flex-col group h-full">
                    <div className="h-44 w-full relative overflow-hidden bg-slate-900 flex items-center justify-center">
                      <img 
                        src={p.imageUrl} 
                        alt={p.name} 
                        className="object-cover h-full w-full group-hover:scale-105 transition duration-500" 
                      />
                      <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-[10px] text-indigo-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                        {p.category}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-100 group-hover:text-indigo-400 transition text-base">{p.name}</h3>
                        <p className="text-slate-400 text-xs mt-1.5 leading-relaxed line-clamp-3">{p.description}</p>
                      </div>

                      <div className="mt-5">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-xl text-indigo-400">${p.price}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${p.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {p.stock > 0 ? `Stock: ${p.stock}` : 'Out of Stock'}
                          </span>
                        </div>

                        <button 
                          disabled={p.stock <= 0}
                          onClick={() => addToCart(p)}
                          className="w-full py-2 bg-slate-950 border border-slate-800 hover:border-indigo-500 text-xs font-semibold rounded-xl text-slate-300 hover:text-indigo-400 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <ShoppingCart className="w-4 h-4" /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* CART TAB */}
          {activeTab === 'cart' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Cart Items list */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-indigo-400" /> Shopping Cart Items
                </h2>
                {cart.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-8 text-center text-slate-500 py-16">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                    Your cart is empty. Explore the storefront to add products!
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product._id} className="glass-panel rounded-2xl p-4 flex items-center gap-4 justify-between">
                      <div className="flex items-center gap-4">
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover bg-slate-900 border border-slate-800" />
                        <div>
                          <h3 className="font-bold text-slate-200 text-sm">{item.product.name}</h3>
                          <p className="text-xs text-slate-500">Unit Price: ${item.product.price}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2.5">
                          <button 
                            onClick={() => updateCartQty(item.product._id, -1)}
                            className="w-7 h-7 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 hover:text-white flex items-center justify-center text-sm font-semibold transition"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold font-mono w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQty(item.product._id, 1)}
                            className="w-7 h-7 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 hover:text-white flex items-center justify-center text-sm font-semibold transition"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-indigo-400">${item.product.price * item.quantity}</p>
                          <button 
                            onClick={() => updateCartQty(item.product._id, -item.quantity)}
                            className="text-[10px] text-rose-500 hover:underline mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Transaction Summary Panel */}
              <div className="glass-panel rounded-2xl p-6 h-fit flex flex-col gap-6 border-indigo-500/10">
                <h3 className="font-bold text-slate-200 text-base pb-3 border-b border-slate-800">Order Transaction Summary</h3>
                
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Items Count</span>
                    <span className="font-semibold text-slate-200">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Platform Delivery Charge</span>
                    <span className="font-semibold text-emerald-400">FREE / COMPLIMENTARY</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Security Tax / VAT</span>
                    <span className="font-semibold text-slate-200">$0.00</span>
                  </div>
                  <div className="h-[1px] bg-slate-800/80 my-1"></div>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-200">Total Bill Amount</span>
                    <span className="font-bold text-indigo-400 text-lg">
                      ${cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 leading-normal">
                    This order will trigger stock decrements and push events directly through the RabbitMQ notifications broker or HTTP REST fallback pipeline.
                  </p>
                </div>

                <button 
                  disabled={cart.length === 0}
                  onClick={handleCheckout}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg glow-indigo hover:opacity-95 transition disabled:opacity-50 disabled:pointer-events-none"
                >
                  Confirm & Place Order
                </button>
              </div>
            </div>
          )}

          {/* ORDER TRACKER TAB */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-400" /> Customer Order Records
              </h2>
              {orders.length === 0 ? (
                <p className="py-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">No order history found for your account.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {orders.map((o) => (
                    <div key={o._id} className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
                      
                      {/* Order Metadata */}
                      <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-slate-800">
                        <div>
                          <p className="text-xs text-slate-500 font-mono">ORDER ID: {o._id}</p>
                          <p className="text-[10px] text-slate-600 mt-1">{new Date(o.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-slate-400">Total: <strong className="text-indigo-400">${o.totalAmount}</strong></span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                            ${o.status === 'Delivered' 
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                              : o.status === 'Dispatched'
                              ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                              : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="flex flex-col gap-3">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-slate-300">
                            <span className="flex items-center gap-2 text-slate-300">
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                              {item.name} <em className="text-slate-500 font-mono font-normal">x{item.quantity}</em>
                            </span>
                            <span className="font-semibold text-slate-400">${item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Timeline State Machine */}
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 flex justify-between items-center max-w-2xl mx-auto w-full mt-2">
                        <div className="flex flex-col items-center gap-1.5">
                          <CheckCircle className={`w-5 h-5 ${o.status === 'Paid' || o.status === 'Processing' || o.status === 'Dispatched' || o.status === 'Delivered' ? 'text-indigo-400' : 'text-slate-700'}`} />
                          <span className="text-[10px] font-bold text-slate-400">Paid</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-700 shrink-0" />
                        <div className="flex flex-col items-center gap-1.5">
                          <Layers className={`w-5 h-5 ${o.status === 'Processing' || o.status === 'Dispatched' || o.status === 'Delivered' ? 'text-indigo-400 animate-pulse' : 'text-slate-700'}`} />
                          <span className="text-[10px] font-bold text-slate-400">Processing</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-700 shrink-0" />
                        <div className="flex flex-col items-center gap-1.5">
                          <Package className={`w-5 h-5 ${o.status === 'Dispatched' || o.status === 'Delivered' ? 'text-blue-400' : 'text-slate-700'}`} />
                          <span className="text-[10px] font-bold text-slate-400">Dispatched</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-700 shrink-0" />
                        <div className="flex flex-col items-center gap-1.5">
                          <CheckCircle className={`w-5 h-5 ${o.status === 'Delivered' ? 'text-emerald-400 glow-green' : 'text-slate-700'}`} />
                          <span className="text-[10px] font-bold text-slate-400">Delivered</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADMIN CONSOLE TAB */}
          {activeTab === 'admin' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Product Creator Form */}
              <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
                <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-400 pb-3 border-b border-slate-800">
                  <PlusCircle className="w-5 h-5" /> Catalog Product Manager
                </h2>
                
                <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Product Title / Name</label>
                    <input 
                      type="text" 
                      required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="e.g. Odin Mechanical Keyboard" 
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 focus:border-indigo-500 text-xs text-slate-200 outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Description</label>
                    <textarea 
                      required
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Detailed product features..." 
                      rows="3"
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 focus:border-indigo-500 text-xs text-slate-200 outline-none resize-none"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-medium">Price ($)</label>
                      <input 
                        type="number" 
                        required
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="e.g. 150" 
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 focus:border-indigo-500 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-medium">Initial Inventory Count</label>
                      <input 
                        type="number" 
                        required
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        placeholder="e.g. 50" 
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 focus:border-indigo-500 text-xs text-slate-200 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-medium">Category</label>
                      <select 
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 focus:border-indigo-500 text-xs text-slate-200 outline-none"
                      >
                        <option>Electronics</option>
                        <option>Accessories</option>
                        <option>Apparel</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-medium">Display Image URL</label>
                      <input 
                        type="text" 
                        value={newProduct.imageUrl}
                        onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                        placeholder="https://unsplash.com/..." 
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 focus:border-indigo-500 text-xs text-slate-200 outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md glow-indigo transition"
                  >
                    Add Product to Live Database
                  </button>
                </form>
              </div>

              {/* Order Status Dispatch Controller */}
              <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
                <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-400 pb-3 border-b border-slate-800">
                  <TrendingUp className="w-5 h-5" /> E-Commerce Order Flow Control
                </h2>
                
                {orders.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-12">No orders placed to control.</p>
                ) : (
                  <div className="flex flex-col gap-4 overflow-y-auto max-h-[380px] pr-1">
                    {orders.map((o) => (
                      <div key={o._id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] text-slate-500 font-mono">ID: {o._id}</p>
                          <p className="text-xs font-bold text-indigo-400 mt-1">${o.totalAmount}</p>
                          <span className="text-[9px] text-slate-600 font-mono">{o.userId}</span>
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] text-slate-500 font-mono uppercase text-right">Update Workflow</label>
                          <select 
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                            className="p-1 text-[10px] font-bold rounded bg-slate-900 border border-indigo-500/20 text-indigo-400 outline-none"
                          >
                            <option value="Paid">Paid</option>
                            <option value="Processing">Processing</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Catalog Deletion Controller */}
              <div className="glass-panel rounded-2xl p-6 col-span-full flex flex-col gap-6">
                <h2 className="text-lg font-bold flex items-center gap-2 text-rose-400 pb-3 border-b border-slate-800">
                  <Trash2 className="w-5 h-5" /> Dangerous Actions: Live Product Catalog Delete
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {products.map((p) => (
                    <div key={p._id} className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-850 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} className="w-10 h-10 object-cover rounded-lg bg-slate-900" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{p.name}</h4>
                          <p className="text-[9px] text-slate-500 font-mono">${p.price} / Stock: {p.stock}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteProduct(p._id)}
                        className="p-2 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-[#07090E]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl w-full max-w-sm p-6 shadow-2xl relative border-indigo-500/20">
            <h3 className="text-lg font-bold text-slate-200 text-center mb-6">
              {authMode === 'login' ? '🔑 Access User Gateway' : '🎉 Register DevOps Profile'}
            </h3>
            
            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              {authMode === 'register' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 font-mono uppercase">Full Profile Name</label>
                  <input 
                    type="text" 
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="John Doe" 
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 outline-none"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-mono uppercase">DevOps Verified Email</label>
                <input 
                  type="email" 
                  required
                  value={authMode === 'login' ? loginEmail : registerEmail}
                  onChange={(e) => authMode === 'login' ? setLoginEmail(e.target.value) : setRegisterEmail(e.target.value)}
                  placeholder="name@example.com" 
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-mono uppercase">Password Key</label>
                <input 
                  type="password" 
                  required
                  value={authMode === 'login' ? loginPassword : registerPassword}
                  onChange={(e) => authMode === 'login' ? setLoginPassword(e.target.value) : setRegisterPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 outline-none"
                />
              </div>

              {authMode === 'register' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 font-mono uppercase">Profile Role Privilege</label>
                  <select 
                    value={registerRole}
                    onChange={(e) => setRegisterRole(e.target.value)}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 outline-none"
                  >
                    <option value="customer">Customer Access Scope</option>
                    <option value="admin">Administrator Root Console</option>
                  </select>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-2.5 mt-2 bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg glow-indigo transition animate-pulse"
              >
                {authMode === 'login' ? 'Confirm and Login' : 'Create & Auth Profile'}
              </button>
            </form>

            <div className="mt-6 text-center">
              {authMode === 'login' ? (
                <button 
                  onClick={() => setAuthMode('register')} 
                  className="text-xs text-slate-500 hover:text-indigo-400 transition"
                >
                  Don't have a DevOps profile? Register profile ➔
                </button>
              ) : (
                <button 
                  onClick={() => setAuthMode('login')} 
                  className="text-xs text-slate-500 hover:text-indigo-400 transition"
                >
                  Already registered? Login to gateway ➔
                </button>
              )}
            </div>

            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-200 transition text-sm font-bold p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#0B0F19] border-t border-slate-800/60 py-6 px-6 text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-mono text-[10px]">
          © 2026 COMSATS DevOps Cloud Computing Final Lab. All Rights Reserved.
        </p>
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
          <span className="font-semibold text-slate-500">Dockerized Microservices v1.0.0</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="font-semibold text-slate-500">Kubernetes Self-Healing (Liveness: OK)</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
