
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Printer, 
  ChevronRight, 
  Download,
  X,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Menu as MenuIcon,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Leaf,
  BarChart3,
  ChevronLeft,
  UserPlus,
  FileDown,
  Loader2,
  CalendarDays,
  PackagePlus,
  Target
} from 'lucide-react';

// --- Types & Interfaces ---

type Category = 'Vegetable' | 'Fruit' | 'Grocery' | 'Other';
type UnitType = 'Kg' | 'Lb' | 'Box' | 'Bunch' | 'Piece';
type LayoutType = 'A' | 'B' | 'C' | 'D';

const CATEGORIES: Category[] = ['Vegetable', 'Fruit', 'Grocery', 'Other'];
const UNIT_TYPES: UnitType[] = ['Kg', 'Lb', 'Box', 'Bunch', 'Piece'];
const LAYOUTS: LayoutType[] = ['A', 'B', 'C', 'D'];

interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  category: Category;
  unitType: UnitType;
  price: number;
}

interface InvoiceItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Invoice {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
}

// --- Constants ---

const BUSINESS_NAME = "EVER GREEN PRODUCE L.L.C";
const BUSINESS_PHONE = "646-667-9749";
const ORDER_PHONE = "646-667-9749";

const PRODUCT_NAMES = [
  "Baby Mustard", "Cabbage", "Cauliflower(12 head)", "Chilli (Finger Hot)", "Chilli (Small Thai)",
  "Chinese Okra (Tori)", "Coriander 60 Bunches", "Dosaki", "Dry Coconut (bag)", "Edo (Arvi)",
  "Egg Plant-Big", "Eggplant-Chinese", "Eggplant-Round", "Garlic-5 pack", "Ginger", "Green Mango",
  "Guava Big", "Karela Indian", "Lime", "Long Bean", "Long Squash (Indian)", "Long Squash (regular)",
  "Lychee", "Methi", "Mint", "Muli (Daikon)", "Okra-Indian", "Okra-Regular", "Onion-Red 10 lb",
  "Onion-Red 2 lb", "Onion-Red Pearl", "Onion Yellow 10 lb", "Onion-Yellow 2 lb", "Potato Idaho Red-5lb",
  "Potato Idaho White-5lb", "Potatao White Loose B# 1", "Potato Red Loose B #1", "Spinach Bunch",
  "Tindora", "Tomato (Plum)", "Tomato (Reg)", "Valor-flat", "Valor-long",
  "Banana (Regular)", "Bell Pepper Green", "Carrot 2 Lb", "Carrot Loose 50lbs", "Cucumber - Persian",
  "Cucumber- Regular", "Curry Leave", "Dill", "Drum Stick", "Garlic-Peeled (1lb box )",
  "Garlic-Peeled (5lb Box )", "Guar Bean", "Lemon", "Lettuce", "Mango Leaf", "Onion-Red 25 lb",
  "Onion (Green Fresh)", "Paan Leaf", "Papaya-Ripe", "Parval", "Ripe Mango", "Red Beets",
  "String Bean Green", "Sugarcane", "Sweet Potato-Red", "Turnips", "Zucchini Green"
].sort((a, b) => a.localeCompare(b));

const INITIAL_PRODUCTS: Product[] = PRODUCT_NAMES.map((name, idx) => ({
  id: `p-${idx}`,
  name: name,
  category: name.toLowerCase().includes('fruit') || name.toLowerCase().includes('mango') || name.toLowerCase().includes('banana') ? 'Fruit' : 'Vegetable',
  unitType: name.toLowerCase().includes('box') ? 'Box' : name.toLowerCase().includes('lb') ? 'Lb' : 'Piece',
  price: 0
}));

// --- Utility Functions ---

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const generateId = () => Math.random().toString(36).substring(2, 9);
const generateInvoiceNumber = () => `${Math.floor(100000 + Math.random() * 900000)}`;

// --- Local Storage Hooks ---
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// --- Components ---

const AddProductModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (p: Omit<Product, 'id'>) => void 
}) => {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    category: 'Vegetable',
    unitType: 'Kg',
    price: 0
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.name) return alert("Product name is required");
    onSave(formData);
    setFormData({ name: '', category: 'Vegetable', unitType: 'Kg', price: 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[101] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
            <PackagePlus size={24} />
          </div>
          <h3 className="font-black text-slate-900 uppercase text-xl tracking-tighter">New Product</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Name</label>
            <input 
              autoFocus 
              placeholder="e.g. Red Grapes" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold bg-slate-50 focus:border-orange-500 outline-none transition-all" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value as Category})} 
                className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold bg-slate-50 focus:border-orange-500 outline-none transition-all"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
              <select 
                value={formData.unitType} 
                onChange={e => setFormData({...formData, unitType: e.target.value as UnitType})} 
                className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold bg-slate-50 focus:border-orange-500 outline-none transition-all"
              >
                {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Price ($)</label>
            <input 
              type="number"
              step="0.01"
              placeholder="0.00" 
              value={formData.price || ''} 
              onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} 
              className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-mono font-bold bg-slate-50 focus:border-orange-500 outline-none transition-all text-right" 
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button onClick={onClose} className="flex-1 py-4 bg-slate-100 font-black rounded-2xl text-[10px] uppercase text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={handleSave} className="flex-1 py-4 bg-orange-600 text-white font-black rounded-2xl text-[10px] uppercase shadow-lg shadow-orange-900/20 hover:bg-orange-700 transition-colors">Add Item</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ 
  currentView, 
  setView, 
  isOpen, 
  setIsOpen 
}: { 
  currentView: string, 
  setView: (v: string) => void,
  isOpen: boolean,
  setIsOpen: (o: boolean) => void
}) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'invoices', icon: FileText, label: 'Invoices' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
  ];

  const handleSelect = (id: string) => {
    setView(id);
    if (window.innerWidth < 1024) setIsOpen(false); 
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${isOpen ? 'translate-x-0' : '-translate-x-full'} no-print h-full`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h1 className="text-xl font-bold text-green-400 flex items-center gap-2">
              <Leaf className="w-6 h-6" />
              <span>Ever Green Hub</span>
            </h1>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400">
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 mt-6 px-4 space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentView === item.id 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-semibold">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="p-6 border-t border-slate-800 text-[10px] text-slate-500 font-mono text-center uppercase tracking-widest">
            &copy; 2025 EVER GREEN
          </div>
        </div>
      </aside>
    </>
  );
};

const MobileTopBar = ({ setIsOpen }: { setIsOpen: (o: boolean) => void }) => (
  <header className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-30 flex items-center justify-between no-print">
    <button onClick={() => setIsOpen(true)} className="p-1 text-slate-600">
      <MenuIcon size={24} />
    </button>
    <div className="flex items-center gap-2 font-black text-slate-800">
      <Leaf className="text-green-600" size={20} />
      <span className="text-xs uppercase tracking-widest">Ever Green</span>
    </div>
    <div className="w-8" />
  </header>
);

const ViewHeader = ({ 
  title, 
  onBack, 
  action 
}: { 
  title: string, 
  onBack?: () => void, 
  action?: React.ReactNode 
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div className="flex items-center gap-3">
      {onBack && (
        <button 
          onClick={onBack} 
          className="p-1.5 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors no-print border border-slate-200 shadow-sm"
        >
          <ChevronLeft size={18} className="text-slate-700" />
        </button>
      )}
      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{title}</h2>
    </div>
    {action && <div className="no-print">{action}</div>}
  </div>
);

// --- Adaptive Professional Produce Invoice Print ---
const InvoicePrint = React.forwardRef<HTMLDivElement, { invoice: Invoice, layout: LayoutType }>(({ invoice, layout }, ref) => {
  const activeItems = useMemo(() => 
    [...invoice.items]
      .filter(item => item.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity),
    [invoice.items]
  );
  
  const itemCount = activeItems.length;
  
  // Layout logic
  const isSplit = layout === 'C' || layout === 'D';
  const midPoint = Math.ceil(activeItems.length / 2);
  const leftItems = isSplit ? activeItems.slice(0, midPoint) : activeItems;
  const rightItems = isSplit ? activeItems.slice(midPoint) : [];

  const getTableStyles = () => {
    switch (layout) {
      case 'A': return { fontSize: 'text-[11pt]', rowHeight: 'h-[32px]' };
      case 'B': return { fontSize: 'text-[9pt]', rowHeight: 'h-[22px]' };
      case 'C': return { fontSize: 'text-[8.5pt]', rowHeight: 'h-[20px]' };
      case 'D': return { fontSize: 'text-[7pt]', rowHeight: 'h-[16px]' };
      default: return { fontSize: 'text-[9.5pt]', rowHeight: 'h-[28px]' };
    }
  };

  const { fontSize, rowHeight } = getTableStyles();
  const paddingY = 'py-0';

  const ProductTable = ({ items, startIndex = 0 }: { items: InvoiceItem[], startIndex?: number }) => (
    <table className="w-full border-collapse">
      <thead>
        <tr className="text-[7pt] font-black uppercase tracking-[0.2em] text-slate-400 border-b-2 border-slate-900">
          <th className="text-left py-2 w-8">#</th>
          <th className="text-left py-2">Item</th>
          <th className="text-center py-2 w-10">Qty</th>
          {!isSplit && <th className="text-right py-2 w-20">Price</th>}
          <th className="text-right py-2 w-24">Total</th>
        </tr>
      </thead>
      <tbody className={`divide-y divide-slate-100 ${fontSize}`}>
        {items.map((item, idx) => (
          <tr key={idx} className={`${rowHeight} group hover:bg-slate-50 transition-colors`}>
            <td className={`${paddingY} text-slate-300 font-mono text-[6.5pt]`}>{startIndex + idx + 1}</td>
            <td className={`${paddingY} font-bold text-slate-800 uppercase tracking-tight truncate max-w-[150px]`}>{item.name}</td>
            <td className={`${paddingY} text-center font-mono font-black text-slate-500`}>{item.quantity}</td>
            {!isSplit && <td className={`${paddingY} text-right font-mono text-slate-400`}>{formatCurrency(item.price)}</td>}
            <td className={`${paddingY} text-right font-mono font-black text-slate-900`}>{formatCurrency(item.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div ref={ref} id="invoice-content" className="bg-white w-full mx-auto p-8 text-slate-900 font-sans flex flex-col leading-tight border-0">
      
      <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-green-600 p-1.5 rounded text-white flex items-center justify-center h-8 w-8">
             <Leaf size={20} />
          </div>
          <div>
            <h1 className="text-[11pt] font-bold text-slate-900 leading-none uppercase tracking-tight">{BUSINESS_NAME}</h1>
            <p className="text-[7.5pt] font-semibold text-slate-600 mt-0.5">Contact: {BUSINESS_PHONE}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[6pt] font-black text-slate-400 uppercase tracking-widest">Date</p>
            <p className="text-[8.5pt] font-bold text-slate-900">{new Date(invoice.date).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[6pt] font-black text-slate-400 uppercase tracking-widest">Invoice #</p>
            <p className="text-[9.5pt] font-mono font-black text-slate-900 uppercase">{invoice.number}</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-12">
        <div className="flex-1">
          <h2 className="text-[7.5pt] font-bold text-slate-900 uppercase tracking-widest mb-1 border-b border-slate-200 inline-block pb-0.5">BILL TO</h2>
          <div className="pl-0 mt-0.5">
            <p className="text-[10pt] font-bold text-slate-900 uppercase leading-none mb-1">{invoice.customerName}</p>
            <p className="text-[8pt] text-slate-600 font-medium leading-tight max-w-[420px]">{invoice.customerAddress}</p>
          </div>
        </div>
        <div className="text-right pt-4">
           <p className="text-[7pt] font-bold text-slate-500 uppercase tracking-wide">Due on Delivery</p>
        </div>
      </div>

      <div className={`flex-1 ${isSplit ? 'split-columns grid grid-cols-2 gap-8' : ''}`}>
        <div className="flex-1">
          <ProductTable items={leftItems} />
        </div>
        {isSplit && (
          <div className="flex-1">
            <ProductTable items={rightItems} startIndex={midPoint} />
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t-2 border-slate-900 flex justify-between items-end">
        <div className="text-[6.5pt] text-slate-400 font-bold uppercase tracking-tight leading-none">
           Deliveries verified on-site. No adjustments after departure.
        </div>
        
        <div className="flex items-center gap-4">
           <p className="text-[8pt] font-black text-slate-400 uppercase tracking-widest">Grand Total:</p>
           <span className="text-[22pt] font-black font-mono tracking-tighter text-slate-900 leading-none">{formatCurrency(invoice.total)}</span>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between items-center opacity-40">
        <p className="text-[6pt] font-black text-slate-400 uppercase tracking-[0.5em]">PRODUCE DISTRIBUTION HUB</p>
        <p className="text-[6pt] font-bold text-slate-500 italic">Order: {ORDER_PHONE}</p>
      </div>
    </div>
  );
});

// --- Dashboard Component ---
const Dashboard = ({ customers, invoices, setView }: { customers: Customer[], invoices: Invoice[], setView: (v: string) => void }) => {
  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Ever Green Hub</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Business Intelligence</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Sales</p>
          <p className="text-2xl font-black text-blue-600 mt-1 font-mono">{formatCurrency(totalSales)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Clients</p>
          <p className="text-2xl font-black text-green-600 mt-1 font-mono">{customers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoices Issued</p>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{invoices.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button onClick={() => setView('new-invoice')} className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-[2rem] border border-green-200 text-green-700 hover:bg-green-100 transition-all active:scale-95 group shadow-sm">
          <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">New Order</span>
        </button>
        <button onClick={() => setView('reports')} className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-[2rem] border border-blue-200 text-blue-700 hover:bg-blue-100 transition-all active:scale-95 group shadow-sm">
          <BarChart3 className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Reports</span>
        </button>
        <button onClick={() => setView('customers')} className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-[2rem] border border-purple-200 text-purple-700 hover:bg-purple-100 transition-all active:scale-95 group shadow-sm">
          <Users className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Clients</span>
        </button>
        <button onClick={() => setView('products')} className="flex flex-col items-center justify-center p-6 bg-orange-50 rounded-[2rem] border border-orange-200 text-orange-700 hover:bg-orange-100 transition-all active:scale-95 group shadow-sm">
          <Package className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Inventory</span>
        </button>
      </div>
    </div>
  );
};

// --- Invoice List Component ---
const InvoiceList = ({ invoices, setInvoices, onPrint, onEdit, onBack }: { invoices: Invoice[], setInvoices: (i: Invoice[]) => void, onPrint: (i: Invoice) => void, onEdit: (i: Invoice) => void, onBack: () => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = invoices.filter(inv => inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || inv.number.includes(searchTerm));

  return (
    <div className="space-y-4">
      <ViewHeader title="Invoice History" onBack={onBack} />
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-2 shadow-sm">
        <Search size={18} className="text-slate-400" />
        <input placeholder="Search records..." className="flex-1 outline-none text-sm font-bold text-slate-700" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 font-black text-slate-400 uppercase text-xs">ID</th>
              <th className="px-6 py-4 font-black text-slate-400 uppercase text-xs">Customer</th>
              <th className="px-6 py-4 font-black text-slate-400 uppercase text-xs text-right">Balance</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.slice().reverse().map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50 group">
                <td className="px-6 py-4 font-mono font-black text-xs text-slate-900">{inv.number}</td>
                <td className="px-6 py-4 font-black text-slate-800 uppercase text-xs">{inv.customerName}</td>
                <td className="px-6 py-4 text-right font-mono font-black text-green-600">{formatCurrency(inv.total)}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onPrint(inv)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl" title="Generate PDF"><FileDown size={18}/></button>
                  <button onClick={() => onEdit(inv)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-xl" title="Edit"><Edit size={18}/></button>
                  <button onClick={() => { if(confirm('Permanently remove this record?')) setInvoices(invoices.filter(i => i.id !== inv.id))}} className="p-2 text-red-400 hover:bg-red-50 rounded-xl" title="Delete"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-12 text-center text-slate-300 font-bold uppercase text-xs italic">No matching records</div>}
      </div>
    </div>
  );
};

// --- Customer List ---
const CustomerList = ({ customers, setCustomers, onBack }: { customers: Customer[], setCustomers: (c: Customer[]) => void, onBack: () => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'createdAt'>>({ name: '', address: '', phone: '', email: '' });

  const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSave = () => {
    if (!formData.name) return;
    setCustomers([...customers, { id: generateId(), ...formData, createdAt: new Date().toISOString() }]);
    setFormData({ name: '', address: '', phone: '', email: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <ViewHeader title="Client Portfolio" onBack={onBack} action={
        <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-purple-900/20 active:scale-95 transition-all">
          <UserPlus size={16}/> New Account
        </button>
      } />
      
      <div className="bg-white p-4 rounded-3xl border border-slate-200 flex items-center gap-2 shadow-sm">
        <Search size={18} className="text-slate-400" />
        <input placeholder="Filter client records..." className="flex-1 outline-none text-sm font-bold text-slate-700" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-purple-200 transition-all group relative">
             <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-purple-50 transition-colors">
                 <Users className="w-6 h-6 text-slate-400 group-hover:text-purple-600" />
               </div>
               <button onClick={() => setCustomers(customers.filter(cust => cust.id !== c.id))} className="text-slate-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
             </div>
             <h4 className="font-black text-slate-900 uppercase tracking-tight">{c.name}</h4>
             <div className="mt-4 space-y-2">
               <div className="flex items-center gap-2 text-slate-400 font-medium text-xs">
                 <MapPin size={12}/> <span className="truncate">{c.address}</span>
               </div>
               <div className="flex items-center gap-2 text-slate-400 font-medium text-xs">
                 <Phone size={12}/> <span>{c.phone}</span>
               </div>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[2.5rem] w-full max-sm p-8 shadow-2xl animate-in zoom-in duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
                  <UserPlus size={24} />
                </div>
                <h3 className="font-black text-slate-900 uppercase text-xl tracking-tighter">Register Client</h3>
              </div>
              <div className="space-y-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Identity</label>
                   <input autoFocus placeholder="e.g. Gotham Market" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold bg-slate-50 focus:border-purple-500 outline-none" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Address</label>
                   <input placeholder="Street, City, Zip" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold bg-slate-50 focus:border-purple-500 outline-none" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Direct Contact</label>
                   <input placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold bg-slate-50 focus:border-purple-500 outline-none" />
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 font-black rounded-2xl text-[10px] uppercase text-slate-500 hover:bg-slate-200 transition-colors">Dismiss</button>
                    <button onClick={handleSave} className="flex-1 py-4 bg-purple-600 text-white font-black rounded-2xl text-[10px] uppercase shadow-lg hover:bg-purple-700 transition-colors">Finalize Account</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- Product Master List ---
const ProductList = ({ products, setProducts, onBack }: { products: Product[], setProducts: (p: Product[]) => void, onBack: () => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAdd = (p: Omit<Product, 'id'>) => {
    setProducts([...products, { id: generateId(), ...p }]);
  };

  return (
    <div className="space-y-4">
      <ViewHeader title="Inventory Hub" onBack={onBack} action={
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-900/20 active:scale-95 transition-all">
          <PackagePlus size={16}/> New Product
        </button>
      } />
      
      <div className="bg-white p-4 rounded-3xl border border-slate-200 flex items-center gap-2 shadow-sm">
        <Search size={18} className="text-slate-400" />
        <input placeholder="Filter inventory..." className="flex-1 outline-none text-sm font-bold text-slate-700" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr className="text-xs uppercase font-black text-slate-400">
              <th className="px-6 py-4">Item Identity</th>
              <th className="px-6 py-4">Classification</th>
              <th className="px-6 py-4 text-right">Standard Rate</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 group">
                <td className="px-6 py-4 font-bold uppercase">{p.name}</td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-black uppercase px-3 py-1 bg-slate-100 rounded-full text-slate-500">{p.category}</span>
                </td>
                <td className="px-6 py-4 text-right font-mono font-bold text-slate-700">{formatCurrency(p.price)} <span className="text-[10px] text-slate-400">/ {p.unitType}</span></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setProducts(products.filter(item => item.id !== p.id))} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAdd} />
    </div>
  );
};

// --- Invoice Generation Form ---
const InvoiceForm = ({ customers, setCustomers, products, setProducts, existingInvoice, onSave, onBack }: { 
  customers: Customer[], 
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  products: Product[], 
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  existingInvoice?: Invoice | null, 
  onSave: (i: Invoice) => void, 
  onBack: () => void 
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(existingInvoice?.customerId || '');
  const [items, setItems] = useState<InvoiceItem[]>(existingInvoice?.items || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  
  const customer = customers.find(c => c.id === selectedCustomerId);
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));

  const addItem = (product: Product) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) return;
    setItems([...items, { productId: product.id, name: product.name, quantity: 1, price: product.price, total: product.price }]);
  };

  const updateItem = (productId: string, qty: number, price: number) => {
    setItems(items.map(i => i.productId === productId ? { ...i, quantity: qty, price: price, total: qty * price } : i));
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const handleComplete = () => {
    if (!selectedCustomerId) return alert("Please select a client");
    if (items.length === 0) return alert("Please add at least one item");
    
    const subtotal = items.reduce((acc, i) => acc + i.total, 0);
    const invoice: Invoice = {
      id: existingInvoice?.id || generateId(),
      number: existingInvoice?.number || generateInvoiceNumber(),
      customerId: selectedCustomerId,
      customerName: customer?.name || '',
      customerAddress: customer?.address || '',
      date: existingInvoice?.date || new Date().toISOString(),
      items: items,
      subtotal: subtotal,
      tax: 0,
      total: subtotal
    };
    onSave(invoice);
  };

  const [newClientData, setNewClientData] = useState({ name: '', address: '', phone: '' });
  const handleAddClient = () => {
    if (!newClientData.name) return;
    const newClient = { id: generateId(), ...newClientData, createdAt: new Date().toISOString() };
    setCustomers([...customers, newClient]);
    setSelectedCustomerId(newClient.id);
    setIsAddClientModalOpen(false);
    setNewClientData({ name: '', address: '', phone: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6 flex flex-col h-full overflow-hidden">
        <ViewHeader title={existingInvoice ? "Modify Order" : "Assemble Order"} onBack={onBack} />
        
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
           <div className="flex justify-between items-center mb-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Destination</label>
             <button onClick={() => setIsAddClientModalOpen(true)} className="text-[10px] font-black text-green-600 uppercase tracking-widest hover:underline">+ New Client</button>
           </div>
           <div className="relative">
             <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
             <input 
               placeholder="Search or Select Client..." 
               value={clientSearch} 
               onChange={e => setClientSearch(e.target.value)}
               onFocus={() => setClientSearch('')}
               className="w-full border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold bg-slate-50 focus:border-green-500 outline-none transition-all"
             />
             {clientSearch && filteredCustomers.length > 0 && (
               <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto overflow-x-hidden">
                 {filteredCustomers.map(c => (
                   <button 
                     key={c.id} 
                     onClick={() => {
                       setSelectedCustomerId(c.id);
                       setClientSearch(c.name);
                     }}
                     className="w-full text-left px-5 py-3 hover:bg-green-50 text-sm font-bold text-slate-700 border-b border-slate-50 last:border-0"
                   >
                     {c.name}
                   </button>
                 ))}
               </div>
             )}
           </div>
           {!clientSearch && selectedCustomerId && (
             <div className="px-5 py-3 bg-green-50 rounded-xl border border-green-100 flex justify-between items-center">
               <span className="text-xs font-bold text-green-700 uppercase tracking-tight">{customer?.name}</span>
               <button onClick={() => setSelectedCustomerId('')} className="text-green-400 hover:text-green-600"><X size={14}/></button>
             </div>
           )}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
           <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
             <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Order Specifications</h4>
             <span className="text-[10px] font-bold text-slate-400 uppercase">{items.length} items staged</span>
           </div>
           
           <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              <table className="w-full text-left text-xs">
                 <thead className="sticky top-0 bg-white z-10"><tr className="text-slate-400 uppercase font-black text-[9px] border-b">
                   <th className="px-4 py-3">Description</th><th className="px-2 py-3 w-20 text-center">Qty</th><th className="px-2 py-3 w-24 text-right">Price</th><th className="px-2 py-3 w-8"></th>
                 </tr></thead>
                 <tbody className="divide-y divide-slate-50">
                    {items.map(i => (
                       <tr key={i.productId} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-black text-slate-800 uppercase text-[10px] leading-tight">{i.name}</td>
                          <td className="px-2 py-3">
                            <input 
                              type="number" 
                              value={i.quantity || ''} 
                              onChange={e => updateItem(i.productId, parseFloat(e.target.value) || 0, i.price)} 
                              className="w-full text-center border border-slate-200 rounded-lg font-black py-1.5 px-0.5 bg-white outline-none focus:border-green-400" 
                              placeholder="" 
                            />
                          </td>
                          <td className="px-2 py-3">
                            <input 
                              type="number" 
                              step="0.01" 
                              value={i.price || ''} 
                              onChange={e => updateItem(i.productId, i.quantity, parseFloat(e.target.value) || 0)} 
                              className="w-full text-right border border-slate-200 rounded-lg px-2 py-1.5 font-mono font-black text-slate-700 bg-white outline-none focus:border-green-400" 
                              placeholder="" 
                            />
                          </td>
                          <td className="px-2 py-3 text-right">
                            <button onClick={() => removeItem(i.productId)} className="text-red-400 p-1.5"><Trash2 size={14}/></button>
                          </td>
                       </tr>
                    ))}
                    {items.length === 0 && (
                      <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-300 font-bold uppercase italic text-[10px]">Populate the order list from inventory</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
           <div className="p-6 bg-slate-900 text-right flex justify-between items-center">
              <div className="text-left">
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Selected Items</p>
                <p className="text-lg font-black text-white">{items.length}</p>
              </div>
              <div>
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Balance Total</p>
                <p className="text-2xl font-black text-green-500 font-mono tracking-tighter leading-none">{formatCurrency(items.reduce((acc, i) => acc + i.total, 0))}</p>
              </div>
           </div>
        </div>

        <button onClick={handleComplete} className="w-full py-5 bg-green-600 text-white font-black rounded-[2rem] shadow-xl active:scale-95 transition-all text-lg uppercase tracking-tight">
          {existingInvoice ? "Update Order Record" : "Finalize Order"}
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
         <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-4 text-slate-300" size={18} />
              <input placeholder="Search catalog..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl text-sm font-bold bg-slate-50 outline-none focus:border-orange-500 transition-all" />
            </div>
            <button onClick={() => setIsAddProductModalOpen(true)} className="p-4 bg-orange-600 text-white rounded-2xl shadow-lg active:scale-95 transition-all hover:bg-orange-700" title="New Inventory Item"><PackagePlus size={24}/></button>
         </div>
         <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {filteredProducts.map(p => (
               <button key={p.id} onClick={() => addItem(p)} className="w-full text-left px-4 py-3 rounded-2xl border border-slate-50 bg-white hover:bg-green-50 hover:border-green-100 transition-all flex justify-between items-center group active:scale-95 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-700 uppercase leading-none">{p.name}</span>
                    <span className="text-[7pt] font-bold text-slate-400 uppercase mt-1.5">{p.price > 0 ? `${formatCurrency(p.price)} / ${p.unitType}` : 'Add Rate'}</span>
                  </div>
                  <div className="bg-slate-50 group-hover:bg-green-100 p-2 rounded-xl transition-colors">
                    <Plus size={16} className="text-slate-300 group-hover:text-green-600" />
                  </div>
               </button>
            ))}
         </div>
      </div>

      {isAddClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[300] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-2xl text-green-600">
                  <UserPlus size={24} />
                </div>
                <h3 className="font-black text-slate-900 uppercase text-xl tracking-tighter">New Client</h3>
              </div>
              <div className="space-y-4">
                 <input autoFocus placeholder="Business Name" value={newClientData.name} onChange={e => setNewClientData({...newClientData, name: e.target.value})} className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold bg-slate-50 focus:border-green-500 outline-none" />
                 <input placeholder="Address" value={newClientData.address} onChange={e => setNewClientData({...newClientData, address: e.target.value})} className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold bg-slate-50 focus:border-green-500 outline-none" />
                 <input placeholder="Phone" value={newClientData.phone} onChange={e => setNewClientData({...newClientData, phone: e.target.value})} className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold bg-slate-50 focus:border-green-500 outline-none" />
                 <div className="flex gap-3 pt-4">
                    <button onClick={() => setIsAddClientModalOpen(false)} className="flex-1 py-4 bg-slate-100 font-black rounded-2xl text-[10px] uppercase text-slate-500">Cancel</button>
                    <button onClick={handleAddClient} className="flex-1 py-4 bg-green-600 text-white font-black rounded-2xl text-[10px] uppercase shadow-lg">Save Client</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <AddProductModal 
        isOpen={isAddProductModalOpen} 
        onClose={() => setIsAddProductModalOpen(false)} 
        onSave={(p) => {
          const newProd = { id: generateId(), ...p };
          setProducts([...products, newProd]);
          addItem(newProd);
        }} 
      />
    </div>
  );
};

// --- Reports ---
const ReportsView = ({ invoices, onBack }: { invoices: Invoice[], onBack: () => void }) => {
  const totalSales = invoices.reduce((acc, i) => acc + i.total, 0);
  
  return (
    <div className="space-y-6">
      <ViewHeader title="Operational Intelligence" onBack={onBack} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-10 rounded-[3rem] text-center text-white border-b-8 border-green-600 shadow-2xl flex flex-col justify-center">
           <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Total Revenue Generated</p>
           <p className="text-6xl font-black font-mono tracking-tighter text-green-400">{formatCurrency(totalSales)}</p>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <CalendarDays className="w-16 h-16 text-blue-600 mb-4" />
          <h3 className="text-2xl font-black text-slate-900 uppercase">Quarterly Summary</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 mb-8">Export data for fiscal reconciliation</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3 transition-all active:scale-95">
            <Download size={18} />
            Generate CSV Report
          </button>
        </div>
      </div>
    </div>
  );
};

// --- App Root Controller ---

const App = () => {
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [customers, setCustomers] = useLocalStorage<Customer[]>('eg_customers', []);
  const [products, setProducts] = useLocalStorage<Product[]>('eg_products', INITIAL_PRODUCTS);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('eg_invoices', []);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('B');
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrintRequest = (inv: Invoice) => {
    const itemCount = inv.items.filter(i => i.quantity > 0).length;
    let recommended: LayoutType = 'B';
    if (itemCount <= 15) recommended = 'A';
    else if (itemCount <= 30) recommended = 'B';
    else if (itemCount <= 50) recommended = 'C';
    else recommended = 'D';
    
    setSelectedInvoice(inv);
    setSelectedLayout(recommended);
    setShowPreview(true);
  };

  const handleDownloadPDF = () => {
    if (!printRef.current || !selectedInvoice) return;
    const element = printRef.current;
    const opt = {
      margin: 0,
      filename: `invoice-${selectedInvoice.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar currentView={view} setView={setView} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <MobileTopBar setIsOpen={setSidebarOpen} />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar no-print">
          {view === 'dashboard' && <Dashboard customers={customers} invoices={invoices} setView={setView} />}
          {view === 'customers' && (
             <CustomerList customers={customers} setCustomers={setCustomers} onBack={() => setView('dashboard')} />
          )}
          {view === 'products' && (
            <ProductList 
              products={products} 
              setProducts={setProducts} 
              onBack={() => setView('dashboard')} 
            />
          )}
          {view === 'invoices' && (
            <InvoiceList 
              invoices={invoices} 
              setInvoices={setInvoices} 
              onPrint={handlePrintRequest}
              onEdit={(inv) => {
                setSelectedInvoice(inv);
                setView('edit-invoice');
              }}
              onBack={() => setView('dashboard')} 
            />
          )}
          {(view === 'new-invoice' || view === 'edit-invoice') && (
            <InvoiceForm 
              customers={customers} 
              setCustomers={setCustomers}
              products={products} 
              setProducts={setProducts}
              existingInvoice={view === 'edit-invoice' ? selectedInvoice : null}
              onSave={(inv) => {
                if (view === 'edit-invoice') {
                  setInvoices(invoices.map(i => i.id === inv.id ? inv : i));
                } else {
                  setInvoices([...invoices, inv]);
                }
                setView('invoices');
              }}
              onBack={() => setView('invoices')}
            />
          )}
          {view === 'reports' && <ReportsView invoices={invoices} onBack={() => setView('dashboard')} />}
        </div>

        {/* Live Preview Overlay */}
        {showPreview && selectedInvoice && (
          <div className="fixed inset-0 bg-slate-900/90 z-[200] flex flex-col no-print backdrop-blur-md">
            <header className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-700 rounded-xl">
                  <ArrowLeft size={20} />
                </button>
                <h3 className="font-black uppercase tracking-tight">Invoice Preview</h3>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl">
                {LAYOUTS.map(l => (
                  <button 
                    key={l}
                    onClick={() => setSelectedLayout(l)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${selectedLayout === l ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    Layout {l}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-black uppercase transition-all">
                  <Download size={16} />
                  <span>PDF</span>
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 rounded-xl text-xs font-black uppercase shadow-lg shadow-green-900/40 transition-all">
                  <Printer size={16} />
                  <span>Print</span>
                </button>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-12 flex justify-center bg-slate-900/50 custom-scrollbar">
              <div className="bg-white shadow-2xl origin-top transition-transform duration-500 scale-[0.8] sm:scale-100 h-fit">
                <InvoicePrint ref={printRef} invoice={selectedInvoice} layout={selectedLayout} />
              </div>
            </div>
          </div>
        )}

        {/* Hidden printing container */}
        <div className="print-only fixed inset-0 bg-white z-[500]">
          {selectedInvoice && <InvoicePrint invoice={selectedInvoice} layout={selectedLayout} />}
        </div>
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
