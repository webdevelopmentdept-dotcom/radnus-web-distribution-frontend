import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Package, Store, Truck, Users, UserCheck, Map,
  IndianRupee, Calendar, Timer, AlertCircle, ShoppingCart, Star,
  Coins, TrendingDown, FileText, Plus, ClipboardList
} from 'lucide-react';
import { StatCard, SectionHeader, Badge, Avatar, PageLoader } from '../../components/ui/UI';
import { fetchProducts } from '../../services/features/products/productSlice';
import { fetchRetailers } from '../../services/features/retailer/retailerSlice';
import { fetchDistributors } from '../../services/features/distributor/distributorSlice';
import { getManagers } from '../../services/features/manager/managerSlice';
import { getExecutives } from '../../services/features/executive/executiveSlice';
import { fetchFSE } from '../../services/features/fse/fseSlice';
import { selectAuthState } from '../../store/selectors/authSelector';
import api from '../../services/API/api';
import './Dashboard.css';

/* ─── Mini bar chart ─────────────────────────────────────────────────────────── */
const BarChart = ({ data, label }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-col">
          <div className="bar-fill" style={{ height: `${(d.value / max) * 100}%` }} title={`${d.label}: ${d.value}`} />
          <div className="bar-lbl">{d.label}</div>
        </div>
      ))}
      {label && <div className="bar-y-label">{label}</div>}
    </div>
  );
};

/* ─── Quick action card ──────────────────────────────────────────────────────── */
const ActionCard = ({ icon: Icon, title, sub, accent, onClick }) => (
  <div className={`action-card accent-${accent}`} onClick={onClick}>
    <div className={`action-icon accent-${accent}`}><Icon size={20} /></div>
    <div className="action-info">
      <div className="action-title">{title}</div>
      <div className="action-sub">{sub}</div>
    </div>
    <div className="action-arrow">→</div>
  </div>
);

/* ─── Recent items table ─────────────────────────────────────────────────────── */
const RecentTable = ({ title, rows, columns }) => (
  <div className="dash-table-card">
    <div className="dash-table-head"><h3 className="section-title">{title}</h3></div>
    <table className="dash-table">
      <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No data yet</td></tr>
          : rows.map((r, i) => <tr key={i}>{r}</tr>)
        }
      </tbody>
    </table>
  </div>
);

/* ─── Helper functions (unchanged from mobile EmployeeDashboard) ─────────────── */
const getNum = (obj, key, fallback = 0) => {
  if (obj[key] !== undefined && obj[key] !== null) {
    const val = Number(obj[key]);
    if (!isNaN(val)) return val;
  }
  const spacedKey = key + ' ';
  if (obj[spacedKey] !== undefined && obj[spacedKey] !== null) {
    const val = Number(obj[spacedKey]);
    if (!isNaN(val)) return val;
  }
  return fallback;
};

const getId = obj => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (obj.$oid) return obj.$oid;
  if (obj._id) return getId(obj._id);
  return obj;
};

const parseDate = dateValue => {
  if (!dateValue) return new Date();
  if (dateValue instanceof Date && !isNaN(dateValue)) return dateValue;
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    return !isNaN(parsed) ? parsed : new Date();
  }
  if (typeof dateValue === 'object' && dateValue.$date) {
    const parsed = new Date(dateValue.$date);
    return !isNaN(parsed) ? parsed : new Date();
  }
  return new Date();
};

const isSameDay = (d1, d2) =>
  d1.getDate() === d2.getDate() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getFullYear() === d2.getFullYear();

/* ─── Radnus Employee Dashboard (replaces Admin/Radnus block) ───────────────── */
const RadnusDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const products = useSelector(s => s.products.list);

  const [todaySales, setTodaySales] = useState(0);
  const [todaySalesLoading, setTodaySalesLoading] = useState(true);
  const [totalItemCostValue, setTotalItemCostValue] = useState(0);
  const [itemCostLoading, setItemCostLoading] = useState(true);
  const [totalInward, setTotalInward] = useState(0);
  const [totalOutward, setTotalOutward] = useState(0);
  const [inwardOutwardLoading, setInwardOutwardLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTodaySales = useCallback(async () => {
    setTodaySalesLoading(true);
    try {
      const response = await api.get(
        `/api/invoices?filter=today&billerName=${user?.name || ''}`,
      );
      const invoices = response.data || [];
      const total = invoices
        .filter(inv => inv?.status === 'completed')
        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      setTodaySales(total);
    } catch (error) {
      console.error("Failed to fetch today's sales:", error);
      setTodaySales(0);
    } finally {
      setTodaySalesLoading(false);
    }
  }, [user?.name]);

  const computeStockAndMovements = useCallback(async () => {
    if (products.length === 0) return;
    setItemCostLoading(true);
    setInwardOutwardLoading(true);
    try {
      const response = await api.get('/api/invoices?filter=all');
      const allInvoices = (response.data || []).filter(
        inv => inv.status !== 'draft',
      );
      const today = new Date();

      let todayInward = 0;
      let todayOutward = 0;
      const stockMap = {};

      products.forEach(product => {
        const pid = getId(product._id);
        const moq = getNum(product, 'moq') || 0;
        const stock = getNum(product, 'stock') || moq;
        const walkinPrice = getNum(product, 'walkinPrice');
        const itemCost = getNum(product, 'itemCost');
        const createdAt = parseDate(product.createdAt);
        if (isSameDay(createdAt, today)) {
          todayInward += moq;
        }
        stockMap[pid] = {
          currentStock: stock,
          walkinPrice: walkinPrice,
          itemCost: itemCost,
        };
      });

      allInvoices.forEach(invoice => {
        const invDate = parseDate(invoice.createdAt);
        const isToday = isSameDay(invDate, today);
        (invoice.items || []).forEach(item => {
          const qty = getNum(item, 'qty');
          if (isToday) {
            todayOutward += qty;
          }
          const pid = getId(item.productId);
          if (stockMap[pid]) {
            stockMap[pid].currentStock -= qty;
          }
        });
      });

      let totalCost = 0;
      Object.values(stockMap).forEach(item => {
        const current = item.currentStock || 0;
        const cost = current * (item.itemCost || 0);
        totalCost += isNaN(cost) ? 0 : cost;
      });

      setTotalItemCostValue(totalCost);
      setTotalInward(todayInward);
      setTotalOutward(todayOutward);
    } catch (error) {
      console.error('Failed to compute data:', error);
      setTotalItemCostValue(0);
      setTotalInward(0);
      setTotalOutward(0);
    } finally {
      setItemCostLoading(false);
      setInwardOutwardLoading(false);
    }
  }, [products]);

  useEffect(() => {
    fetchTodaySales();
    computeStockAndMovements();
  }, [fetchTodaySales, computeStockAndMovements]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTodaySales(), computeStockAndMovements()]);
    setRefreshing(false);
  };

  return (
    <div className="dashboard">
      <div className="dash-welcome">
        <Avatar name={user?.name || 'R'} size="lg" />
        <div>
          <h2 className="dash-greeting">Welcome, {user?.name || 'User'}</h2>
          <p className="dash-sub">Business Overview</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="stats-grid">
        <StatCard
          icon={<IndianRupee size={20} />}
          label="Today Sales"
          value={todaySalesLoading ? '...' : `₹${todaySales.toLocaleString('en-IN')}`}
          accent="green"
          onClick={() => navigate('/invoices', { state: { filter: 'today' } })}
        />
        <StatCard
          icon={<Coins size={20} />}
          label="Item Cost Total"
          value={itemCostLoading ? '...' : `₹${Math.round(totalItemCostValue).toLocaleString('en-IN')}`}
          accent="yellow"
          onClick={() => navigate('/stock-visibility')}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Inward (Today)"
          value={inwardOutwardLoading ? '...' : `${totalInward} units`}
          accent="green"
          onClick={() => navigate('/central-stock')}
        />
        <StatCard
          icon={<TrendingDown size={20} />}
          label="Outward (Today)"
          value={inwardOutwardLoading ? '...' : `${totalOutward} units`}
          accent="red"
          onClick={() => navigate('/invoices', { state: { filter: 'today' } })}
        />
      </div>

      {/* Quick actions */}
      <SectionHeader title="Quick Actions" />
      <div className="actions-list">
        <ActionCard
          icon={Users}
          title="Customer Details"
          sub="View and manage customers"
          accent="blue"
          onClick={() => navigate('/customers')}
        />
        <ActionCard
          icon={ClipboardList}
          title="Invoice History"
          sub="All past invoices"
          accent="orange"
          onClick={() => navigate('/invoices')}
        />
        <ActionCard
          icon={Plus}
          title="Product Master"
          sub="Add or edit products"
          accent="red"
          onClick={() => navigate('/products')}
        />
        <ActionCard
          icon={Package}
          title="Stock Summary"
          sub="Current stock levels"
          accent="red"
          onClick={() => navigate('/stock-visibility')}
        />
        <ActionCard
          icon={ShoppingCart}
          title="Order Cart"
          sub="Create new order"
          accent="green"
          onClick={() => navigate('/order-cart')}
        />
        <ActionCard
          icon={FileText}
          title="Central Stock"
          sub="Central stock overview"
          accent="purple"
          onClick={() => navigate('/central-stock')}
        />
        <ActionCard
          icon={IndianRupee}
          title="Order Billing"
          sub="Generate invoice"
          accent="yellow"
          onClick={() => navigate('/order-cart')}  // adjust as needed
        />
      </div>

      {/* Refresh button */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button
          className="auth-link"
          onClick={handleRefresh}
          disabled={refreshing}
          style={{ opacity: refreshing ? 0.6 : 1 }}
        >
          {refreshing ? 'Refreshing…' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
};

/* ═══ Dashboard Page (role‑based entry) ════════════════════════════════════════ */
const DashboardPage = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user, role } = useSelector(selectAuthState);
  const products     = useSelector(s => s.products.list);
  const retailers    = useSelector(s => s.retailer.list);
  const distributors = useSelector(s => s.distributors.list);
  const managers     = useSelector(s => s.manager.list);
  const executives   = useSelector(s => s.executive.list);
  const fseList      = useSelector(s => s.fse.list);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchRetailers());
    if (['Admin', 'Radnus', 'MarketingManager'].includes(role)) dispatch(fetchDistributors());
    if (['Admin', 'Radnus'].includes(role)) { dispatch(getManagers()); dispatch(getExecutives()); dispatch(fetchFSE()); }
    if (role === 'MarketingManager') dispatch(fetchFSE());
    if (role === 'MarketingExecutive') dispatch(fetchFSE());
  }, [dispatch, role]);

  const activeRetailers    = retailers.filter(r => r.status === 'Active').length;
  const activeDistributors = distributors.filter(d => d.status === 'Active').length;
  const activeProducts     = products.filter(p => p.status === 'Active' || p.stock > 0).length;
  const lowStock           = products.filter(p => p.stock < 20 && p.stock > 0).length;

  const monthlyData = ['J','F','M','A','M','J','J','A','S','O','N','D'].map((l, i) => ({
    label: l, value: [28,42,35,68,55,72,65,88,74,90,78,95][i],
  }));

  if (role === 'Radnus') return <RadnusDashboard />;

  if (role === 'Admin') return (
    <div className="dashboard">
      <div className="dash-welcome">
        <Avatar name={user?.name || 'A'} size="lg" />
        <div>
          <h2 className="dash-greeting">Good day, {user?.name?.split(' ')[0] || 'Admin'} 👋</h2>
          <p className="dash-sub">Here's your business overview</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={<IndianRupee size={20}/>} label="Today's Sales"     value="₹0"                   accent="red"    delta="↑ Live data" deltaType="up" />
        <StatCard icon={<Calendar size={20}/>}    label="This Month"        value="₹0"                   accent="purple" />
        <StatCard icon={<Store size={20}/>}       label="Active Retailers"  value={activeRetailers}      accent="green"  onClick={() => navigate('/retailers')} />
        <StatCard icon={<Truck size={20}/>}       label="Distributors"      value={distributors.length}  accent="blue"   onClick={() => navigate('/distributors')} />
        <StatCard icon={<Users size={20}/>}       label="Active FSEs"       value={fseList.length}       accent="yellow" onClick={() => navigate('/fse')} />
        <StatCard icon={<Package size={20}/>}     label="Products"          value={products.length}      accent="green"  onClick={() => navigate('/products')} />
      </div>

      <div className="two-col" style={{ marginBottom: 24 }}>
        <div className="card card-pad">
          <SectionHeader title="Sales Trend — 2025" />
          <BarChart data={monthlyData} />
        </div>
        <div className="card card-pad">
          <SectionHeader title="Network Overview" />
          {[
            ['Retailers',    activeRetailers,    retailers.length,    'var(--success)'],
            ['Distributors', activeDistributors, distributors.length, 'var(--info)'],
            ['Products',     activeProducts,     products.length,     'var(--red)'],
            ['Managers',     managers.length,    managers.length,     'var(--purple)'],
          ].map(([lbl, val, total, color]) => (
            <div key={lbl} className="progress-row">
              <div className="progress-info"><span>{lbl}</span><span>{val}/{total}</span></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: total ? `${(val/total)*100}%` : '0%', background: color }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: 24 }}>
        <div>
          <SectionHeader title="Quick Actions" />
          <div className="actions-list">
            <ActionCard icon={Truck}     title="Pending Approvals"       sub="Distributor · FSE · Retailer requests" accent="red"    onClick={() => navigate('/distributors')} />
            <ActionCard icon={Map}       title="Territory Management"    sub="State · District · Taluk · Beat"       accent="blue"   onClick={() => navigate('/territory')} />
            <ActionCard icon={Package}   title="Product Master"          sub="Products · Pricing · MOQ"              accent="green"  onClick={() => navigate('/products')} />
            <ActionCard icon={AlertCircle} title="Non-Moving Stock"      sub="Items with zero activity"              accent="yellow" onClick={() => navigate('/products')} />
          </div>
        </div>
        <RecentTable
          title="Recent Retailers"
          columns={['Retailer', 'City', 'Status']}
          rows={retailers.slice(0, 5).map(r => [
            <td key="n"><div className="avatar-row"><Avatar name={r.name} size="xs"/><span style={{marginLeft:8}}>{r.name}</span></div></td>,
            <td key="c">{r.city || '—'}</td>,
            <td key="s"><Badge variant={r.status === 'Active' ? 'active' : 'inactive'}>{r.status || 'Pending'}</Badge></td>,
          ])}
        />
      </div>

      {lowStock > 0 && (
        <div className="alert-card">
          <AlertCircle size={18} /> <span>{lowStock} products with low stock — </span>
          <button className="auth-link" onClick={() => navigate('/products')}>View Products →</button>
        </div>
      )}
    </div>
  );

  // ... rest of the role‑specific returns (Distributor, MarketingManager, etc.) remain exactly the same ...

  /* ─── Distributor Dashboard ─────────────────────────────────────────────────── */
  if (role === 'Distributor') return (
    <div className="dashboard">
      <div className="dash-welcome">
        <Avatar name={user?.name || 'D'} size="lg" />
        <div>
          <h2 className="dash-greeting">Welcome, {user?.name?.split(' ')[0] || 'Distributor'}</h2>
          <p className="dash-sub">Your business at a glance</p>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard icon={<IndianRupee size={20}/>} label="Today's Sales"    value="₹0"              accent="green"  />
        <StatCard icon={<Package size={20}/>}     label="Stock Value"      value="₹0"              accent="red"    />
        <StatCard icon={<ShoppingCart size={20}/>} label="Pending Orders"  value="0"               accent="yellow" onClick={() => navigate('/orders')} />
        <StatCard icon={<Store size={20}/>}       label="My Retailers"    value={retailers.length} accent="blue"   onClick={() => navigate('/retailers')} />
      </div>
      <div className="two-col">
        <div className="card card-pad">
          <SectionHeader title="Monthly Sales" />
          <BarChart data={monthlyData} />
        </div>
        <div>
          <SectionHeader title="Quick Actions" />
          <div className="actions-list">
            <ActionCard icon={ShoppingCart} title="Place Order"    sub="Order products from catalog"    accent="red"   onClick={() => navigate('/products')} />
            <ActionCard icon={Store}        title="My Retailers"   sub="Manage retailer network"        accent="green" onClick={() => navigate('/retailers')} />
            <ActionCard icon={Package}      title="Product Catalog" sub="Browse available products"     accent="blue"  onClick={() => navigate('/products')} />
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── Marketing Manager Dashboard ──────────────────────────────────────────── */
  if (role === 'MarketingManager') return (
    <div className="dashboard">
      <div className="dash-welcome">
        <Avatar name={user?.name || 'M'} size="lg" />
        <div>
          <h2 className="dash-greeting">Manager Dashboard</h2>
          <p className="dash-sub">Team and territory overview — {user?.name}</p>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard icon={<UserCheck size={20}/>}   label="My Executives" value={executives.length}   accent="blue"   onClick={() => navigate('/executives')} />
        <StatCard icon={<Users size={20}/>}       label="Field Execs"   value={fseList.length}      accent="purple" onClick={() => navigate('/fse')} />
        <StatCard icon={<Store size={20}/>}       label="Retailers"     value={retailers.length}    accent="green"  onClick={() => navigate('/retailers')} />
        <StatCard icon={<Truck size={20}/>}       label="Distributors"  value={distributors.length} accent="yellow" onClick={() => navigate('/distributors')} />
      </div>
      <div className="actions-list" style={{ marginBottom: 24 }}>
        <ActionCard icon={UserCheck} title="Onboard Executive"    sub="Add marketing executive"           accent="blue"   onClick={() => navigate('/executives')} />
        <ActionCard icon={Map}       title="Territory Management" sub="Review territory assignments"       accent="red"    onClick={() => navigate('/territory')} />
        <ActionCard icon={Users}     title="FSE Management"       sub="Monitor field executive activity"   accent="green"  onClick={() => navigate('/fse')} />
      </div>
    </div>
  );

  /* ─── Marketing Executive Dashboard ────────────────────────────────────────── */
  if (role === 'MarketingExecutive') return (
    <div className="dashboard">
      <div className="dash-welcome">
        <Avatar name={user?.name || 'E'} size="lg" />
        <div>
          <h2 className="dash-greeting">Executive Dashboard</h2>
          <p className="dash-sub">Your territory overview — {user?.name}</p>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard icon={<Users size={20}/>}  label="My FSEs"      value={fseList.length}   accent="blue"   onClick={() => navigate('/fse')} />
        <StatCard icon={<Store size={20}/>}  label="Retailers"    value={retailers.length} accent="green"  onClick={() => navigate('/retailers')} />
        <StatCard icon={<Truck size={20}/>}  label="Distributors" value={distributors.length} accent="purple" onClick={() => navigate('/distributors')} />
        <StatCard icon={<TrendingUp size={20}/>} label="This Month Sales" value="₹0" accent="red" />
      </div>
      <div className="actions-list">
        <ActionCard icon={Users}  title="Manage FSEs"     sub="View FSE activity and routes"       accent="blue"  onClick={() => navigate('/fse')} />
        <ActionCard icon={Store}  title="Retailer List"   sub="Browse and manage retailers"        accent="green" onClick={() => navigate('/retailers')} />
        <ActionCard icon={Truck}  title="Distributor List" sub="View distributor details"          accent="red"   onClick={() => navigate('/distributors')} />
      </div>
    </div>
  );

  /* ─── FSE Dashboard ─────────────────────────────────────────────────────────── */
  if (role === 'FSE') return (
    <div className="dashboard">
      <div className="dash-welcome">
        <Avatar name={user?.name || 'F'} size="lg" />
        <div>
          <h2 className="dash-greeting">Good day, {user?.name?.split(' ')[0] || 'FSE'} 👋</h2>
          <p className="dash-sub">Field Dashboard</p>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard icon={<Store size={20}/>}     label="Today's Visits"   value="0"              accent="blue"   />
        <StatCard icon={<IndianRupee size={20}/>} label="Today's Sales"  value="₹0"             accent="green"  />
        <StatCard icon={<Timer size={20}/>}     label="Session"          value="Not Started"    accent="yellow" />
        <StatCard icon={<Package size={20}/>}   label="Orders Taken"     value="0"              accent="red"    />
      </div>
      <div className="actions-list">
        <ActionCard icon={Store}       title="Visit Retailer"    sub="Log retailer visit and order"    accent="green"  onClick={() => navigate('/retailers')} />
        <ActionCard icon={Package}     title="Product Catalog"   sub="Browse product list"             accent="blue"   onClick={() => navigate('/products')} />
        <ActionCard icon={ShoppingCart} title="Take Order"       sub="Place order for retailer"        accent="red"    onClick={() => navigate('/orders')} />
      </div>
    </div>
  );

  /* ─── Retailer Dashboard ────────────────────────────────────────────────────── */
  if (role === 'Retailer') return (
    <div className="dashboard">
      <div className="dash-welcome">
        <Avatar name={user?.name || 'R'} size="lg" />
        <div>
          <h2 className="dash-greeting">Welcome, {user?.name?.split(' ')[0] || 'Retailer'}</h2>
          <p className="dash-sub">Your store overview</p>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard icon={<ShoppingCart size={20}/>} label="My Orders"    value="0"  accent="blue"   onClick={() => navigate('/orders')} />
        <StatCard icon={<Package size={20}/>}      label="Products"     value={products.length} accent="green" onClick={() => navigate('/products')} />
        <StatCard icon={<IndianRupee size={20}/>}  label="Pending Dues" value="₹0" accent="yellow" />
        <StatCard icon={<Star size={20}/>}         label="Feedback"     value="0"  accent="red"    onClick={() => navigate('/feedback')} />
      </div>
      <div className="actions-list">
        <ActionCard icon={Package}     title="Browse Products"  sub="View full product catalog"      accent="blue"  onClick={() => navigate('/products')} />
        <ActionCard icon={ShoppingCart} title="My Orders"       sub="View order history"             accent="green" onClick={() => navigate('/orders')} />
        <ActionCard icon={Star}        title="Give Feedback"    sub="Rate products and service"      accent="red"   onClick={() => navigate('/feedback')} />
      </div>
    </div>
  );

  /* ─── Default / Radnus Employee ─────────────────────────────────────────────── */
  return (
    <div className="dashboard">
      <div className="dash-welcome">
        <Avatar name={user?.name || 'U'} size="lg" />
        <div>
          <h2 className="dash-greeting">Welcome, {user?.name || 'User'}</h2>
          <p className="dash-sub">Radnus DMS — {role}</p>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard icon={<Package size={20}/>} label="Products"    value={products.length}    accent="red"   />
        <StatCard icon={<Store size={20}/>}   label="Retailers"   value={retailers.length}   accent="green" />
        <StatCard icon={<Truck size={20}/>}   label="Distributors" value={distributors.length} accent="blue" />
      </div>
    </div>
  );
};

export default DashboardPage;