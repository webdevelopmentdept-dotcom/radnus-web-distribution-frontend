// src/pages/Invoices/InvoiceListPage.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchInvoices } from '../../services/features/invoice/invoiceSlice';
import { useTheme } from '../../context/ThemeContext';
import './InvoiceListPage.css';

import {
  Calendar,
  User,
  Hash,
  CreditCard,
  RefreshCw,
  Search,
  X,
  Loader,
} from 'lucide-react';

// Helper: date filters
const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};
const isThisWeek = (date) => {
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  return date >= weekStart;
};
const isThisMonth = (date) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return date >= monthStart;
};

// Memoized Invoice Card
const InvoiceCard = React.memo(({ invoice, onClick }) => {
  return (
    <div className="invoice-card" onClick={() => onClick(invoice)}>
      <div className="card-header">
        <div className="icon-badge" style={{ backgroundColor: '#FFF3E0' }}>
          <Calendar size={14} color="#E65100" />
        </div>
        <span className="invoice-date">{new Date(invoice.createdAt).toDateString()}</span>
      </div>
      <div className="card-header">
        <div className="icon-badge" style={{ backgroundColor: '#FCE4EC' }}>
          <User size={14} color="#C62828" />
        </div>
        <span className="invoice-biller">{invoice.billerName}</span>
      </div>
      <hr className="card-divider" />
      <div className="card-row">
        <div className="card-header">
          <div className="icon-badge" style={{ backgroundColor: '#EDE7F6' }}>
            <Hash size={14} color="#4527A0" />
          </div>
          <span className="invoice-number">{invoice.invoiceNumber}</span>
        </div>
        <span className="invoice-amount">₹{invoice.totalAmount}</span>
      </div>
      <div className="card-header">
        <div className="icon-badge" style={{ backgroundColor: '#E3F2FD' }}>
          <CreditCard size={14} color="#1565C0" />
        </div>
        <span className="invoice-payment">{invoice.paymentMode}</span>
      </div>
    </div>
  );
});

const InvoiceListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Auth – adjust based on your auth slice
  const { user } = useSelector((state) => state.auth || { user: null });
  const billerName = user?.name || user?.fullName || '';
  // Admin check – define your own admin list / role
  const isAdmin = user?.role === 'Admin' || ['Mohanapriya', 'YOGESH V'].includes(billerName);

  const { data: invoices = [], loading, error } = useSelector((state) => state.invoice);

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch invoices on mount & when tab changes (we refetch only when needed)
  // To avoid multiple calls, we could fetch once and filter client-side.
  // But your RN code did refetch on tab change – I'll keep it simple: fetch once on mount,
  // then use local filters. That's faster and reduces API load.
  useEffect(() => {
    // If not admin, pass billerName to API
    const filter = tab; // but we won't use server filtering, we'll do local.
    dispatch(fetchInvoices({ filter: 'all', billerName: isAdmin ? '' : billerName }));
  }, [dispatch, isAdmin, billerName]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchInvoices({ filter: 'all', billerName: isAdmin ? '' : billerName }));
    setRefreshing(false);
  }, [dispatch, isAdmin, billerName]);

  // Client-side date filters
  const filteredByDate = useMemo(() => {
    if (tab === 'all') return invoices;
    return invoices.filter(inv => {
      const date = new Date(inv.createdAt);
      if (tab === 'today') return isToday(date);
      if (tab === 'week') return isThisWeek(date);
      if (tab === 'month') return isThisMonth(date);
      return true;
    });
  }, [invoices, tab]);

  // Search filter (billerName, invoiceNumber, amount, paymentMode)
  const filteredData = useMemo(() => {
    if (!search.trim()) return filteredByDate;
    const q = search.toLowerCase();
    return filteredByDate.filter(
      inv =>
        inv.billerName?.toLowerCase().includes(q) ||
        inv.invoiceNumber?.toLowerCase().includes(q) ||
        inv.paymentMode?.toLowerCase().includes(q) ||
        String(inv.totalAmount).includes(q)
    );
  }, [filteredByDate, search]);

  // Counts per tab (from filteredByDate? Actually counts of full invoices per tab)
  const counts = useMemo(() => {
    const all = invoices.length;
    const today = invoices.filter(i => isToday(new Date(i.createdAt))).length;
    const week = invoices.filter(i => isThisWeek(new Date(i.createdAt))).length;
    const month = invoices.filter(i => isThisMonth(new Date(i.createdAt))).length;
    return { all, today, week, month };
  }, [invoices]);

  const handleInvoiceClick = (invoice) => {
    navigate(`/invoices/${invoice._id}`, { state: { invoice } });
  };

  // Render
  if (error && invoices.length === 0) {
    return (
      <div className={`invoice-page ${isDark ? 'dark' : ''}`}>
        <div className="error-state">
          <RefreshCw size={48} />
          <h3>Error loading invoices</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="btn-retry">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`invoice-page ${isDark ? 'dark' : ''}`}>
      <div className="invoice-header">
        <h1>Invoice History</h1>
        <div className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, invoice no, amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button onClick={() => setSearch('')} className="search-clear">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="invoice-tabs">
        {['all', 'today', 'week', 'month'].map(t => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
            <span className="tab-badge">{counts[t]}</span>
          </button>
        ))}
      </div>

      {loading && invoices.length === 0 ? (
        <div className="loading-state">
          <Loader className="spin" size={32} />
          <p>Loading invoices...</p>
        </div>
      ) : (
        <>
          <div className="invoice-grid">
            {filteredData.map(inv => (
              <InvoiceCard key={inv._id} invoice={inv} onClick={handleInvoiceClick} />
            ))}
          </div>
          {filteredData.length === 0 && (
            <div className="empty-state">
              <p>{search ? `No results for "${search}"` : 'No invoices found.'}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InvoiceListPage;