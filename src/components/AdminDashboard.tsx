import React, { useState, useEffect } from 'react';
import { Meal, ChefProfile, TiffinPlan, Order, OrderStatus, CuisineCategory } from '../types';
import { 
  Lock, 
  User, 
  LogOut, 
  ClipboardList, 
  ChefHat, 
  Package, 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Loader2, 
  ArrowLeft,
  DollarSign,
  Heart,
  Eye,
  Activity
} from 'lucide-react';

interface AdminDashboardProps {
  onExitAdmin: () => void;
  triggerToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  onRefreshContents: () => void;
  meals: Meal[];
  chefs: ChefProfile[];
  tiffinPlans: TiffinPlan[];
  businessName: string;
}

type AdminTab = 'orders' | 'meals' | 'chefs' | 'tiffins' | 'settings';

export default function AdminDashboard({
  onExitAdmin,
  triggerToast,
  onRefreshContents,
  meals,
  chefs,
  tiffinPlans,
  businessName
}: AdminDashboardProps) {
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('gharbhojan_admin_token') === 'admin-session-token-123';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Core Admin Tabs
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  // Backend orders log
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form states for adding/editing items
  const [editingMeal, setEditingMeal] = useState<Partial<Meal> | null>(null);
  const [isAddingMeal, setIsAddingMeal] = useState(false);

  const [editingChef, setEditingChef] = useState<Partial<ChefProfile> | null>(null);
  const [editingTiffin, setEditingTiffin] = useState<Partial<TiffinPlan> | null>(null);
  const [adminBusinessName, setAdminBusinessName] = useState(businessName);
  const [isSaving, setIsSaving] = useState(false);

  // Categories helper
  const categories: { id: CuisineCategory; name: string }[] = [
    { id: 'north', name: 'North Indian' },
    { id: 'south', name: 'South Indian' },
    { id: 'east', name: 'East Bengali' },
    { id: 'west', name: 'West Indian' },
    { id: 'healthy', name: 'Vedic & Healthy' },
    { id: 'desserts', name: 'Mithai / Sweets' },
  ];

  // Fetch orders from backend
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        // Sort orders so newer ones are at the top
        setOrders(data.reverse());
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
      // Poll orders every 8 seconds in the background
      const interval = setInterval(fetchOrders, 8000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Handle Login Form Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('gharbhojan_admin_token', data.token);
        setIsLoggedIn(true);
        triggerToast('🔐 Welcome back, Admin! Access authorized.', 'success');
      } else {
        const data = await res.json();
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Server connection failed. Try again!');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('gharbhojan_admin_token');
    setIsLoggedIn(false);
    triggerToast('🔐 Logged out of Admin Console safely.', 'info');
  };

  // Update order status from admin console
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        triggerToast(`🚀 Order status updated to "${newStatus.replace(/_/g, ' ')}"`, 'success');
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        triggerToast('Failed to update status', 'warning');
      }
    } catch (err) {
      console.error('Error updating order status', err);
    }
  };

  // Save full configurations back to backend
  const saveWebsiteContents = async (updatedData: {
    meals?: Meal[];
    chefs?: ChefProfile[];
    tiffinPlans?: TiffinPlan[];
    businessName?: string;
  }) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meals: updatedData.meals || meals,
          chefs: updatedData.chefs || chefs,
          tiffinPlans: updatedData.tiffinPlans || tiffinPlans,
          businessName: updatedData.businessName !== undefined ? updatedData.businessName : businessName
        })
      });

      if (res.ok) {
        triggerToast('💾 Website contents updated and persisted successfully!', 'success');
        onRefreshContents();
      } else {
        triggerToast('Failed to save website contents', 'warning');
      }
    } catch (err) {
      console.error('Error saving website contents', err);
      triggerToast('Error connecting to backend', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  // Meals management
  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeal) return;

    let updatedMeals = [...meals];

    if (isAddingMeal) {
      // Create new meal
      const newMeal: Meal = {
        id: editingMeal.id || `meal-${Date.now()}`,
        name: editingMeal.name || 'New Meal Item',
        description: editingMeal.description || '',
        price: editingMeal.price || 99,
        image: editingMeal.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
        category: editingMeal.category || 'north',
        isVeg: editingMeal.isVeg !== undefined ? editingMeal.isVeg : true,
        isJain: editingMeal.isJain || false,
        isKeto: editingMeal.isKeto || false,
        isPopular: editingMeal.isPopular || false,
        chefId: editingMeal.chefId || (chefs[0]?.id || 'chef-anita'),
        spicyLevel: editingMeal.spicyLevel || 1,
        calories: editingMeal.calories || 250
      };
      updatedMeals.push(newMeal);
    } else {
      // Edit existing meal
      updatedMeals = updatedMeals.map(m => m.id === editingMeal.id ? { ...m, ...editingMeal } as Meal : m);
    }

    await saveWebsiteContents({ meals: updatedMeals });
    setEditingMeal(null);
    setIsAddingMeal(false);
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (confirm('Are you sure you want to delete this meal item from the website?')) {
      const updatedMeals = meals.filter(m => m.id !== mealId);
      await saveWebsiteContents({ meals: updatedMeals });
    }
  };

  // Chefs management
  const handleSaveChef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChef) return;

    const updatedChefs = chefs.map(c => c.id === editingChef.id ? { ...c, ...editingChef } as ChefProfile : c);
    await saveWebsiteContents({ chefs: updatedChefs });
    setEditingChef(null);
  };

  // Tiffin plans management
  const handleSaveTiffin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTiffin) return;

    const updatedTiffins = tiffinPlans.map(t => t.id === editingTiffin.id ? { ...t, ...editingTiffin } as TiffinPlan : t);
    await saveWebsiteContents({ tiffinPlans: updatedTiffins });
    setEditingTiffin(null);
  };

  // Save general settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveWebsiteContents({ businessName: adminBusinessName });
  };

  // Render Login view if not authorized
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FFFDF6] flex flex-col justify-center items-center px-4 py-12" id="admin-login-screen">
        <div className="w-full max-w-md bg-white border border-[#C2593F]/15 rounded-3xl shadow-xl p-8" id="admin-login-card">
          
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-[#C2593F]/10 text-[#C2593F] rounded-2xl mb-3">
              <Lock className="h-6 w-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-sans font-extrabold text-[#2D2727] tracking-tight">
              Admin Console Login
            </h1>
            <p className="text-xs text-[#2D2727]/50 mt-1">
              GharBhojan Backend Management Portal
            </p>
          </div>

          {loginError && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#2D2727]/70 uppercase tracking-wide mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2D2727]/30" />
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C2593F]/15 bg-white text-sm text-[#2D2727] focus:outline-none focus:ring-2 focus:ring-[#C2593F]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#2D2727]/70 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2D2727]/30" />
                <input
                  type="password"
                  required
                  placeholder="admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C2593F]/15 bg-white text-sm text-[#2D2727] focus:outline-none focus:ring-2 focus:ring-[#C2593F]/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 mt-2 bg-[#C2593F] hover:bg-[#A9482F] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Console</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400">
              💡 Demo credentials: <strong className="text-gray-600 font-mono">admin</strong> / <strong className="text-gray-600 font-mono">admin</strong>
            </p>
            <button
              onClick={onExitAdmin}
              className="mt-4 text-xs font-bold text-[#557A46] hover:underline flex items-center justify-center mx-auto space-x-1 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Storefront</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Authorized Admin View
  return (
    <div className="min-h-screen bg-[#FFFDF6] flex flex-col" id="admin-main-interface">
      {/* Admin Top Navigation */}
      <header className="bg-white border-b border-[#C2593F]/10 sticky top-0 z-40 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#C2593F] text-white rounded-xl">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-sans font-extrabold text-[#2D2727] flex items-center gap-1.5">
              <span>Admin Center</span>
              <span className="text-[10px] bg-red-100 text-red-700 font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Live Backend</span>
            </h1>
            <p className="text-xs text-[#2D2727]/50 font-medium">
              Controlling: <span className="font-bold text-[#C2593F]">{businessName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={onExitAdmin}
            className="px-3.5 py-1.5 border border-[#557A46]/20 hover:bg-[#557A46]/5 text-[#557A46] text-xs font-bold rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
            title="Exit admin mode and view home storefront"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Storefront</span>
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
            title="Log out from session"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Admin Sidebar Navigation */}
        <nav className="w-full md:w-64 bg-white border-r border-[#C2593F]/10 p-4 space-y-1 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible shrink-0 gap-1 md:gap-0 select-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-center md:justify-start space-x-2.5 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              activeTab === 'orders'
                ? 'bg-[#C2593F] text-white shadow-md'
                : 'text-[#2D2727]/60 hover:bg-gray-50'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Orders Log ({orders.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('meals')}
            className={`w-full flex items-center justify-center md:justify-start space-x-2.5 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              activeTab === 'meals'
                ? 'bg-[#C2593F] text-white shadow-md'
                : 'text-[#2D2727]/60 hover:bg-gray-50'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Meals Menu ({meals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chefs')}
            className={`w-full flex items-center justify-center md:justify-start space-x-2.5 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              activeTab === 'chefs'
                ? 'bg-[#C2593F] text-white shadow-md'
                : 'text-[#2D2727]/60 hover:bg-gray-50'
            }`}
          >
            <ChefHat className="h-4 w-4" />
            <span>Chefs Hub ({chefs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tiffins')}
            className={`w-full flex items-center justify-center md:justify-start space-x-2.5 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              activeTab === 'tiffins'
                ? 'bg-[#C2593F] text-white shadow-md'
                : 'text-[#2D2727]/60 hover:bg-gray-50'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>Tiffin Box ({tiffinPlans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-center md:justify-start space-x-2.5 px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
              activeTab === 'settings'
                ? 'bg-[#C2593F] text-white shadow-md'
                : 'text-[#2D2727]/60 hover:bg-gray-50'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>General Config</span>
          </button>
        </nav>

        {/* Content Panel Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {isSaving && (
            <div className="fixed inset-0 bg-[#FFFDF6]/70 z-50 flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#C2593F]" />
              <span className="text-xs font-bold font-mono text-[#2D2727]">SAVING TO DATABASE...</span>
            </div>
          )}

          {/* TAB 1: ORDERS LOGGER */}
          {activeTab === 'orders' && (
            <div id="tab-admin-orders" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-sans font-extrabold text-[#2D2727] tracking-tight">
                    Simulated Orders Dispatch
                  </h2>
                  <p className="text-xs text-[#2D2727]/60">
                    Real-time logs of customer cart submissions. Edit statuses to dynamically update user tracker app state.
                  </p>
                </div>
                <button
                  onClick={fetchOrders}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Force Sync
                </button>
              </div>

              {isLoadingOrders && orders.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#C2593F] mb-2" />
                  <p className="text-xs text-gray-400">Loading live orders log...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-20 text-center bg-white border border-[#C2593F]/10 rounded-2xl p-6">
                  <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 font-bold">No orders placed yet.</p>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                    Try placing an order from the front-end menu, and it will show up here instantly in real time!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Orders List */}
                  <div className="lg:col-span-2 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    {orders.map((order) => {
                      const orderTimeStr = order.orderTime || 'Unknown';
                      return (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={`p-4 bg-white rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-md ${
                            selectedOrder?.id === order.id
                              ? 'border-[#C2593F] shadow-md ring-1 ring-[#C2593F]'
                              : 'border-[#C2593F]/10'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-mono font-bold text-gray-400">#{order.id.slice(0, 8)}</span>
                                <span className="text-xs text-[#C2593F] font-bold">• {orderTimeStr}</span>
                              </div>
                              <h3 className="text-xs font-extrabold text-[#2D2727] mt-1.5">
                                {order.customerName || 'Valued Guest'} ({order.customerPhone || 'No Phone'})
                              </h3>
                              <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                                {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-extrabold font-mono text-[#2D2727]">₹{order.total}</span>
                              <div className="mt-1">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  order.status === 'arrived' ? 'bg-green-100 text-green-700' :
                                  order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-700' :
                                  order.status === 'packed' ? 'bg-indigo-100 text-indigo-700' :
                                  order.status === 'cooking' ? 'bg-amber-100 text-amber-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {order.status.replace(/_/g, ' ')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Order Detail Panel */}
                  <div className="bg-white rounded-2xl border border-[#C2593F]/15 p-6 h-fit space-y-4">
                    {selectedOrder ? (
                      <>
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div>
                            <h3 className="text-xs font-mono font-extrabold text-gray-400">ORDER DETAILED RECEIPT</h3>
                            <span className="text-sm font-sans font-extrabold text-[#2D2727]">#{selectedOrder.id.slice(0, 12)}</span>
                          </div>
                          <button
                            onClick={() => setSelectedOrder(null)}
                            className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Status update controller */}
                        <div className="space-y-1.5 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                          <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wide">
                            Dispatch Status Controller
                          </label>
                          <select
                            value={selectedOrder.status}
                            onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                            className="w-full bg-white border border-[#C2593F]/15 rounded-lg py-2 px-3 text-xs font-bold text-[#2D2727] focus:outline-none"
                          >
                            <option value="received">Received (Ordered Placed)</option>
                            <option value="cooking">Cooking (Preparing Freshly)</option>
                            <option value="packed">Packed (Box Assembly)</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="arrived">Arrived (Enjoy Meal)</option>
                          </select>
                          <p className="text-[9px] text-gray-400 leading-normal pt-1">
                            ⚠️ Changes sync instantly back to the customer's real-time tracker page.
                          </p>
                        </div>

                        {/* Customer details */}
                        <div className="space-y-1 text-xs">
                          <p className="text-gray-400 font-mono text-[10px] uppercase">Recipient details</p>
                          <p className="font-bold text-[#2D2727]">{selectedOrder.customerName || 'Valued Guest'}</p>
                          <p className="text-gray-500">{selectedOrder.customerPhone || 'N/A'}</p>
                          <p className="text-gray-500 leading-normal">{selectedOrder.deliveryAddress}</p>
                          {selectedOrder.apartment && (
                            <p className="text-gray-400">Landmark/Flat: {selectedOrder.apartment}</p>
                          )}
                          {selectedOrder.deliveryInstructions && (
                            <p className="text-amber-700 italic bg-amber-50/50 p-2 border border-amber-100 rounded-lg mt-1">
                              Rider instruction: "{selectedOrder.deliveryInstructions}"
                            </p>
                          )}
                        </div>

                        {/* Items detailed breakdown */}
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          <p className="text-gray-400 font-mono text-[10px] uppercase">Cart Items</p>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedOrder.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-start text-xs border-b border-gray-50 pb-1.5">
                                <div>
                                  <span className="font-bold text-gray-800">{item.quantity}x</span> {item.name}
                                  {item.customization && (
                                    <span className="block text-[10px] text-gray-400 italic">
                                      Spice: {item.customization.spiceLevel}, {item.customization.extraGhee ? 'With Ghee' : 'No Ghee'}
                                      {item.customization.instructions && `, "${item.customization.instructions}"`}
                                    </span>
                                  )}
                                </div>
                                <span className="font-bold text-gray-500 shrink-0">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs">
                          <span className="text-gray-500">Method: <strong className="text-gray-700">{selectedOrder.paymentMethod.toUpperCase()}</strong></span>
                          <span className="text-sm font-extrabold text-[#C2593F]">Total Amount: ₹{selectedOrder.total}</span>
                        </div>
                      </>
                    ) : (
                      <div className="py-12 text-center text-gray-400 text-xs">
                        <Eye className="h-6 w-6 mx-auto mb-1 text-gray-300" />
                        <span>Select an order from the list to view full receipt & manage delivery workflow status.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MEALS MANAGER */}
          {activeTab === 'meals' && (
            <div id="tab-admin-meals" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-sans font-extrabold text-[#2D2727] tracking-tight">
                    Meals Menu Catalog ({meals.length})
                  </h2>
                  <p className="text-xs text-[#2D2727]/60">
                    Add new items, edit descriptions, adjust prices, or delete dishes from the front-end menu sections instantly.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAddingMeal(true);
                    setEditingMeal({
                      id: `meal-${Date.now()}`,
                      name: '',
                      description: '',
                      price: 149,
                      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
                      category: 'north',
                      isVeg: true,
                      isJain: false,
                      isKeto: false,
                      isPopular: false,
                      chefId: chefs[0]?.id || 'chef-anita',
                      spicyLevel: 1,
                      calories: 250
                    });
                  }}
                  className="px-4 py-2 bg-[#557A46] text-white font-bold text-xs rounded-xl flex items-center space-x-1 shadow-md hover:bg-[#405D33] cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Dish</span>
                </button>
              </div>

              {/* Meals Catalog List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meals.map((meal) => (
                  <div key={meal.id} className="bg-white rounded-2xl border border-[#C2593F]/10 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-[16/10] bg-gray-50">
                        <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white/95 backdrop-blur text-[10px] font-bold text-[#C2593F] border border-[#C2593F]/10 rounded-lg">
                          ₹{meal.price}
                        </span>
                        <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-[9px] font-bold rounded-lg text-white ${meal.isVeg ? 'bg-green-600' : 'bg-red-600'}`}>
                          {meal.isVeg ? 'VEG' : 'NON-VEG'}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-mono font-bold text-gray-400">
                            Category: {meal.category}
                          </span>
                          {meal.isPopular && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 rounded-full">POPULAR</span>
                          )}
                        </div>
                        <h3 className="text-sm font-extrabold text-[#2D2727]">{meal.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{meal.description}</p>
                        <div className="text-[10px] text-gray-400 flex items-center gap-2">
                          <span>🌶️ Spicy: {meal.spicyLevel}/3</span>
                          <span>🔥 Cal: {meal.calories || 'N/A'}</span>
                          <span>👩‍🍳 Chef: {chefs.find(c => c.id === meal.chefId)?.name.split(' ')[1] || 'Guest'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-gray-50 bg-gray-50/50 flex gap-2">
                      <button
                        onClick={() => {
                          setIsAddingMeal(false);
                          setEditingMeal(meal);
                        }}
                        className="flex-1 py-1.5 bg-white border border-gray-200 hover:border-[#C2593F]/30 hover:text-[#C2593F] text-gray-600 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all cursor-pointer"
                        title="Delete meal"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Meal Add/Edit Overlay Modal */}
              {editingMeal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 overflow-y-auto py-10">
                  <div className="bg-white rounded-3xl w-full max-w-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
                    <button
                      onClick={() => {
                        setEditingMeal(null);
                        setIsAddingMeal(false);
                      }}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <h3 className="text-lg font-sans font-extrabold text-[#2D2727] tracking-tight pb-3 border-b border-gray-100">
                      {isAddingMeal ? 'Create New Kitchen Special' : 'Modify Kitchen Special'}
                    </h3>

                    <form onSubmit={handleSaveMeal} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Meal Title</label>
                          <input
                            type="text"
                            required
                            value={editingMeal.name || ''}
                            onChange={(e) => setEditingMeal({ ...editingMeal, name: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl py-2 px-3 text-xs text-[#2D2727] focus:outline-none focus:ring-2 focus:ring-[#C2593F]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Price (₹ INR)</label>
                          <input
                            type="number"
                            required
                            value={editingMeal.price || ''}
                            onChange={(e) => setEditingMeal({ ...editingMeal, price: parseInt(e.target.value) })}
                            className="w-full border border-gray-200 rounded-xl py-2 px-3 text-xs text-[#2D2727] focus:outline-none focus:ring-2 focus:ring-[#C2593F]/30"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                        <textarea
                          required
                          rows={3}
                          value={editingMeal.description || ''}
                          onChange={(e) => setEditingMeal({ ...editingMeal, description: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl py-2 px-3 text-xs text-[#2D2727] focus:outline-none focus:ring-2 focus:ring-[#C2593F]/30"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Image URL</label>
                          <input
                            type="text"
                            required
                            value={editingMeal.image || ''}
                            onChange={(e) => setEditingMeal({ ...editingMeal, image: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl py-2 px-3 text-xs text-[#2D2727] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Cuisine Category</label>
                          <select
                            value={editingMeal.category || 'north'}
                            onChange={(e) => setEditingMeal({ ...editingMeal, category: e.target.value as CuisineCategory })}
                            className="w-full border border-gray-200 rounded-xl py-2 px-3 text-xs text-[#2D2727] focus:outline-none"
                          >
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Chef Creator</label>
                          <select
                            value={editingMeal.chefId || chefs[0]?.id}
                            onChange={(e) => setEditingMeal({ ...editingMeal, chefId: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl py-2 px-3 text-xs text-[#2D2727] focus:outline-none"
                          >
                            {chefs.map(chef => (
                              <option key={chef.id} value={chef.id}>{chef.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Spice Index (1 to 3)</label>
                          <select
                            value={editingMeal.spicyLevel || 1}
                            onChange={(e) => setEditingMeal({ ...editingMeal, spicyLevel: parseInt(e.target.value) as 1 | 2 | 3 })}
                            className="w-full border border-gray-200 rounded-xl py-2 px-3 text-xs text-[#2D2727] focus:outline-none"
                          >
                            <option value={1}>1 - Mild</option>
                            <option value={2}>2 - Medium</option>
                            <option value={3}>3 - Hot</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Calories count</label>
                          <input
                            type="number"
                            value={editingMeal.calories || ''}
                            onChange={(e) => setEditingMeal({ ...editingMeal, calories: parseInt(e.target.value) })}
                            className="w-full border border-gray-200 rounded-xl py-2 px-3 text-xs text-[#2D2727] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Checkbox configs */}
                      <div className="flex flex-wrap gap-4 py-2 border-y border-gray-100">
                        <label className="flex items-center space-x-2 text-xs font-bold text-[#2D2727] cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editingMeal.isVeg || false}
                            onChange={(e) => setEditingMeal({ ...editingMeal, isVeg: e.target.checked })}
                            className="rounded text-[#C2593F] focus:ring-[#C2593F]"
                          />
                          <span>🟢 Pure Vegetarian</span>
                        </label>

                        <label className="flex items-center space-x-2 text-xs font-bold text-[#2D2727] cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editingMeal.isJain || false}
                            onChange={(e) => setEditingMeal({ ...editingMeal, isJain: e.target.checked })}
                            className="rounded text-[#C2593F] focus:ring-[#C2593F]"
                          />
                          <span>Sattvik / Jain Option (No Onion Garlic)</span>
                        </label>

                        <label className="flex items-center space-x-2 text-xs font-bold text-[#2D2727] cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editingMeal.isKeto || false}
                            onChange={(e) => setEditingMeal({ ...editingMeal, isKeto: e.target.checked })}
                            className="rounded text-[#C2593F] focus:ring-[#C2593F]"
                          />
                          <span>Low Carb / Keto Option</span>
                        </label>

                        <label className="flex items-center space-x-2 text-xs font-bold text-[#2D2727] cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editingMeal.isPopular || false}
                            onChange={(e) => setEditingMeal({ ...editingMeal, isPopular: e.target.checked })}
                            className="rounded text-[#C2593F] focus:ring-[#C2593F]"
                          />
                          <span>⭐ Highlight as Best Seller</span>
                        </label>
                      </div>

                      <div className="flex gap-3 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMeal(null);
                            setIsAddingMeal(false);
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#557A46] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center space-x-1"
                        >
                          <Save className="h-4 w-4" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CHEFS HUB */}
          {activeTab === 'chefs' && (
            <div id="tab-admin-chefs" className="space-y-6">
              <div>
                <h2 className="text-xl font-sans font-extrabold text-[#2D2727] tracking-tight">
                  Home Chef Professional Registrations
                </h2>
                <p className="text-xs text-[#2D2727]/60">
                  Update experience logs, home kitchen locations, or bios of FSSAI certified neighborhood micro-batch makers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {chefs.map((chef) => (
                  <div key={chef.id} className="p-5 bg-white rounded-2xl border border-[#C2593F]/10 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
                    <img src={chef.avatar} alt={chef.name} className="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-[#C2593F]/10" />
                    <div className="space-y-2 flex-1">
                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold text-[#C2593F]">{chef.specialty}</span>
                        <h3 className="text-sm font-extrabold text-[#2D2727]">{chef.name}</h3>
                      </div>
                      <p className="text-xs text-gray-400 font-mono">📍 {chef.location}</p>
                      <p className="text-xs text-gray-500 leading-normal line-clamp-3 italic">"{chef.bio}"</p>
                      <div className="text-[10px] text-gray-400 font-medium">
                        Exp: {chef.experience} • Rating: ⭐ {chef.rating} ({chef.reviewsCount} reviews)
                      </div>
                      <button
                        onClick={() => setEditingChef(chef)}
                        className="py-1.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg text-xs font-bold text-gray-700 flex items-center space-x-1 cursor-pointer transition-all"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Modify Chef Profile</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chef Edit Overlay Modal */}
              {editingChef && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 overflow-y-auto py-10">
                  <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl relative">
                    <button onClick={() => setEditingChef(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                      <X className="h-5 w-5" />
                    </button>

                    <h3 className="text-sm font-sans font-extrabold text-[#2D2727] tracking-tight pb-3 border-b border-gray-100">
                      Edit Profile - {editingChef.name}
                    </h3>

                    <form onSubmit={handleSaveChef} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1">Chef Name</label>
                        <input
                          type="text"
                          required
                          value={editingChef.name || ''}
                          onChange={(e) => setEditingChef({ ...editingChef, name: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg p-2 text-[#2D2727]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1">Specialty</label>
                        <input
                          type="text"
                          required
                          value={editingChef.specialty || ''}
                          onChange={(e) => setEditingChef({ ...editingChef, specialty: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg p-2 text-[#2D2727]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1">Location Address</label>
                        <input
                          type="text"
                          required
                          value={editingChef.location || ''}
                          onChange={(e) => setEditingChef({ ...editingChef, location: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg p-2 text-[#2D2727]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1">Experience Years</label>
                        <input
                          type="text"
                          required
                          value={editingChef.experience || ''}
                          onChange={(e) => setEditingChef({ ...editingChef, experience: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg p-2 text-[#2D2727]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1">Home Cook Story / Bio</label>
                        <textarea
                          required
                          rows={4}
                          value={editingChef.bio || ''}
                          onChange={(e) => setEditingChef({ ...editingChef, bio: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg p-2 text-[#2D2727] leading-relaxed"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button type="button" onClick={() => setEditingChef(null)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg cursor-pointer">
                          Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 bg-[#557A46] text-white rounded-lg cursor-pointer flex items-center space-x-1 font-bold">
                          <Save className="h-4 w-4" />
                          <span>Save Chef</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TIFFIN PLANS BOX */}
          {activeTab === 'tiffins' && (
            <div id="tab-admin-tiffins" className="space-y-6">
              <div>
                <h2 className="text-xl font-sans font-extrabold text-[#2D2727] tracking-tight">
                  Tiffin Meal Box Subscriptions
                </h2>
                <p className="text-xs text-[#2D2727]/60">
                  Update weekly/monthly rates, features, diet flags, and inclusions list of multi-tier subscription models.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tiffinPlans.map((plan) => (
                  <div key={plan.id} className="p-5 bg-white rounded-2xl border border-[#C2593F]/10 flex flex-col justify-between shadow-sm">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-mono font-bold text-amber-600">Diet Type: {plan.diet}</span>
                        <div className="text-right">
                          <p className="text-xs font-mono font-bold text-gray-400">Weekly: ₹{plan.pricePerWeek}</p>
                          <p className="text-sm font-mono font-bold text-[#C2593F]">Monthly: ₹{plan.pricePerMonth}</p>
                        </div>
                      </div>
                      <h3 className="text-sm font-extrabold text-[#2D2727]">{plan.name}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{plan.description}</p>
                      
                      <div className="space-y-1">
                        <p className="text-[10px] font-mono font-bold text-gray-400 uppercase">Includes</p>
                        <ul className="list-disc list-inside text-xs text-gray-500 space-y-0.5">
                          {plan.includes.map((inc, i) => (
                            <li key={i} className="truncate">{inc}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingTiffin(plan)}
                      className="mt-4 py-1.5 w-full bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg text-xs font-bold text-gray-700 flex items-center justify-center space-x-1 cursor-pointer transition-all"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Modify Plan Pricing</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Tiffin edit Overlay Modal */}
              {editingTiffin && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 overflow-y-auto py-10">
                  <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl relative">
                    <button onClick={() => setEditingTiffin(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                      <X className="h-5 w-5" />
                    </button>

                    <h3 className="text-sm font-sans font-extrabold text-[#2D2727] tracking-tight pb-3 border-b border-gray-100">
                      Modify Plan - {editingTiffin.name}
                    </h3>

                    <form onSubmit={handleSaveTiffin} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1">Plan Title</label>
                        <input
                          type="text"
                          required
                          value={editingTiffin.name || ''}
                          onChange={(e) => setEditingTiffin({ ...editingTiffin, name: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg p-2 text-[#2D2727]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1">Plan Description</label>
                        <textarea
                          required
                          rows={3}
                          value={editingTiffin.description || ''}
                          onChange={(e) => setEditingTiffin({ ...editingTiffin, description: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg p-2 text-[#2D2727]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">Price per week (₹)</label>
                          <input
                            type="number"
                            required
                            value={editingTiffin.pricePerWeek || ''}
                            onChange={(e) => setEditingTiffin({ ...editingTiffin, pricePerWeek: parseInt(e.target.value) })}
                            className="w-full border border-gray-200 rounded-lg p-2 text-[#2D2727]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">Price per month (₹)</label>
                          <input
                            type="number"
                            required
                            value={editingTiffin.pricePerMonth || ''}
                            onChange={(e) => setEditingTiffin({ ...editingTiffin, pricePerMonth: parseInt(e.target.value) })}
                            className="w-full border border-gray-200 rounded-lg p-2 text-[#2D2727]"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button type="button" onClick={() => setEditingTiffin(null)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg cursor-pointer">
                          Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 bg-[#557A46] text-white rounded-lg cursor-pointer flex items-center space-x-1 font-bold">
                          <Save className="h-4 w-4" />
                          <span>Save Plan</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: GENERAL SETTINGS */}
          {activeTab === 'settings' && (
            <div id="tab-admin-settings" className="max-w-xl space-y-6">
              <div>
                <h2 className="text-xl font-sans font-extrabold text-[#2D2727] tracking-tight">
                  General System Configuration
                </h2>
                <p className="text-xs text-[#2D2727]/60">
                  Update general branding aspects of the storefront. Change kitchen labels or reset backend parameters.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#C2593F]/10 p-6 shadow-sm">
                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                      Merchant Business Name
                    </label>
                    <input
                      type="text"
                      required
                      value={adminBusinessName}
                      onChange={(e) => setAdminBusinessName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl py-2.5 px-3.5 text-[#2D2727] focus:outline-none focus:ring-2 focus:ring-[#C2593F]/30"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                      The primary kitchen brand displayed to customers throughout order receipts and WhatsApp messaging.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#C2593F] hover:bg-[#A9482F] text-white text-[11px] font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center space-x-2 cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Config Settings</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <h4 className="text-xs font-extrabold text-amber-800 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  <span>Administrative Control Console Summary</span>
                </h4>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Every modification made in this panel is recorded directly onto a persistent server data layer. All storefront users will fetch these modified objects dynamically upon browser refresh!
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
