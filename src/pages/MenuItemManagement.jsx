import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import Swal from 'sweetalert2';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  RefreshCw, 
  UtensilsCrossed, 
  Upload,
  Check
} from 'lucide-react';

const CUISINE_OPTIONS = [
  'North Indian',
  'Chinese',
  'South Indian',
  'Continental',
  'Mughlai',
  'Punjabi',
  'Italian',
  'Mexican',
  'Thai',
  'Tandoor',
  'Fast Food',
  'Desserts',
  'Beverages'
];

const CATEGORY_OPTIONS = [
  'Main Course',
  'Starter',
  'Snacks',
  'Bread',
  'Rice',
  'Dessert',
  'Drinks',
  'Breakfast',
  'Sides'
];

export default function MenuItemManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // Form State
  const [itemName, setItemName] = useState('');
  const [foodType, setFoodType] = useState('veg'); // 'veg' | 'non-veg'
  const [cuisine, setCuisine] = useState('North Indian');
  const [category, setCategory] = useState('Main Course');
  const [cookingCharge, setCookingCharge] = useState(250);
  const [itemImage, setItemImage] = useState('https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200');
  const [status, setStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Table Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [foodTypeFilter, setFoodTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/menu-items`);
      if (res.data && res.data.success) {
        setMenuItems(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setItemName('');
    setFoodType('veg');
    setCuisine('North Indian');
    setCategory('Main Course');
    setCookingCharge(250);
    setItemImage('https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200');
    setStatus(true);
    setEditingItemId(null);
    setShowAddForm(false);
  };

  const handleEditClick = (item) => {
    setEditingItemId(item._id);
    setItemName(item.name || '');
    setFoodType(item.foodType || (item.isNonVeg ? 'non-veg' : 'veg'));
    setCuisine(item.cuisine || 'North Indian');
    setCategory(item.category || 'Main Course');
    setCookingCharge(item.cookingCharge || 0);
    setItemImage(item.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200');
    setStatus(item.isActive !== false);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Name Required', text: 'Please enter dish name' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: itemName.trim(),
        foodType,
        cuisine,
        category,
        cookingCharge: Number(cookingCharge) || 0,
        image: itemImage.trim() || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200',
        isActive: status
      };

      if (editingItemId) {
        const res = await axios.put(`${API_BASE_URL}/menu-items/${editingItemId}`, payload);
        if (res.data && res.data.success) {
          Swal.fire({ icon: 'success', title: 'Updated!', text: 'Menu item updated successfully.' });
          fetchMenuItems();
          resetForm();
        }
      } else {
        const res = await axios.post(`${API_BASE_URL}/menu-items`, payload);
        if (res.data && res.data.success) {
          Swal.fire({ icon: 'success', title: 'Created!', text: 'New menu item created successfully.' });
          fetchMenuItems();
          resetForm();
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || err.message });
    }
    setSubmitting(false);
  };

  const handleToggleStatus = async (item) => {
    const newStatus = !item.isActive;
    // Optimistic UI update
    setMenuItems(prev => prev.map(m => m._id === item._id ? { ...m, isActive: newStatus } : m));

    try {
      await axios.put(`${API_BASE_URL}/menu-items/${item._id}`, { isActive: newStatus });
    } catch (err) {
      console.error(err);
      fetchMenuItems();
    }
  };

  const handleDeleteItem = async (id, name) => {
    const res = await Swal.fire({
      title: 'Delete Menu Item?',
      text: `Are you sure you want to delete "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!res.isConfirmed) return;

    setMenuItems(prev => prev.filter(m => m._id !== id));
    try {
      await axios.delete(`${API_BASE_URL}/menu-items/${id}`);
      Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Dish deleted successfully.' });
    } catch (err) {
      console.error(err);
      fetchMenuItems();
    }
  };

  const handleSyncDefaults = async () => {
    const res = await Swal.fire({
      title: 'Sync Default Menu?',
      text: 'This will seed any missing default catalog items into the database.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0866ed',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Sync Now'
    });

    if (!res.isConfirmed) return;

    try {
      const resp = await axios.post(`${API_BASE_URL}/menu-items/seed`);
      if (resp.data && resp.data.success) {
        Swal.fire({ icon: 'success', title: 'Synced!', text: resp.data.message });
        fetchMenuItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered List
  const filteredItems = menuItems.filter(item => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q || 
      item.name?.toLowerCase().includes(q) || 
      item.cuisine?.toLowerCase().includes(q) || 
      item.category?.toLowerCase().includes(q);

    const matchesCuisine = cuisineFilter === 'All' || item.cuisine === cuisineFilter;
    const matchesFoodType = foodTypeFilter === 'All' || item.foodType === foodTypeFilter;
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    return matchesSearch && matchesCuisine && matchesFoodType && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6 font-sans text-slate-800">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Menu Items</h1>
          <p className="text-sm text-slate-500 mt-0.5">Add, edit and manage all menu items for the app.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSyncDefaults}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <span>Sync Defaults ({menuItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (showAddForm && !editingItemId) {
                setShowAddForm(false);
              } else {
                resetForm();
                setShowAddForm(true);
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0866ed] hover:bg-[#0652ba] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{showAddForm && !editingItemId ? 'Close Form' : '+ Add New Menu Item'}</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Form Card */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              {editingItemId ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveMenuItem} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Col 1 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Dal Makhni"
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0866ed] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Cuisine <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0866ed] transition-all cursor-pointer"
                  >
                    {CUISINE_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Meal Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0866ed] transition-all cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Col 2 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Food Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFoodType('veg')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                        foodType === 'veg'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>🌿</span>
                      <span>Veg</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFoodType('non-veg')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                        foodType === 'non-veg'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>🍗</span>
                      <span>Non-Veg</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Cooking Charge (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={cookingCharge}
                    onChange={(e) => setCookingCharge(e.target.value)}
                    placeholder="e.g. 250"
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0866ed] transition-all"
                  />
                </div>
              </div>

              {/* Col 3 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Item Image</label>
                  <div className="flex items-start gap-3">
                    <img
                      src={itemImage || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200'}
                      alt="Preview"
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                    />
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={itemImage}
                        onChange={(e) => setItemImage(e.target.value)}
                        placeholder="Paste image URL..."
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#0866ed]"
                      />
                      <p className="text-[11px] text-slate-400">
                        Recommended size: 500 × 500 px (JPG, PNG, WebP)
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                  <button
                    type="button"
                    onClick={() => setStatus(!status)}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      status 
                        ? 'bg-blue-50 text-[#0866ed] border-blue-200' 
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${status ? 'bg-[#0866ed]' : 'bg-slate-400'}`}></span>
                    <span>{status ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-2.5 rounded-xl bg-[#0866ed] hover:bg-[#0652ba] text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingItemId ? 'Update Menu Item' : 'Save Menu Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Items List Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Filter Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-slate-900">
            Menu Items List <span className="text-slate-400 font-normal text-sm">({filteredItems.length})</span>
          </h2>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search menu items..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#0866ed] focus:bg-white transition-all"
              />
            </div>

            {/* Cuisine Filter */}
            <select
              value={cuisineFilter}
              onChange={(e) => setCuisineFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0866ed] cursor-pointer"
            >
              <option value="All">All Cuisines</option>
              {CUISINE_OPTIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Food Type Filter */}
            <select
              value={foodTypeFilter}
              onChange={(e) => setFoodTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0866ed] cursor-pointer"
            >
              <option value="All">All Food Types</option>
              <option value="veg">🌿 Veg</option>
              <option value="non-veg">🍗 Non-Veg</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#0866ed] cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORY_OPTIONS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                <th className="px-5 py-3.5">#</th>
                <th className="px-5 py-3.5">Image</th>
                <th className="px-5 py-3.5">Item Name</th>
                <th className="px-5 py-3.5">Cuisine</th>
                <th className="px-5 py-3.5">Food Type</th>
                <th className="px-5 py-3.5">Meal Category</th>
                <th className="px-5 py-3.5">Cooking Charge (₹)</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-500 font-bold whitespace-nowrap">
                    Loading menu items...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400 font-medium whitespace-nowrap">
                    No dishes found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <tr key={item._id || index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-400 whitespace-nowrap">{index + 1}</td>
                    
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', maxWidth: '48px', maxHeight: '48px', objectFit: 'cover' }}
                        className="rounded-xl border border-slate-200 shadow-2xs shrink-0 block"
                      />
                    </td>

                    <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {item.name}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 font-medium whitespace-nowrap">
                      {item.cuisine}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {item.foodType === 'non-veg' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <span>🍗</span>
                          <span>Non-Veg</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span>🌿</span>
                          <span>Veg</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        item.category === 'Starter' 
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : item.category === 'Main Course'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : item.category === 'Snacks'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : item.category === 'Dessert'
                          ? 'bg-pink-50 text-pink-700 border-pink-200'
                          : item.category === 'Drinks'
                          ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {item.category}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-bold text-slate-800 whitespace-nowrap">
                      ₹{item.cookingCharge || 0}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          item.isActive !== false
                            ? 'bg-blue-50 text-[#0866ed] border-blue-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${item.isActive !== false ? 'bg-[#0866ed]' : 'bg-slate-400'}`}></span>
                        <span>{item.isActive !== false ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditClick(item)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-[#0866ed] flex items-center justify-center transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => item._id && handleDeleteItem(item._id, item.name)}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
