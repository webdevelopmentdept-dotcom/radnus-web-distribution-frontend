// src/pages/StockVisibility/StockVisibilityPage.js
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../services/features/products/productSlice';
import { fetchInvoices } from '../../services/features/invoice/invoiceSlice';
import { useTheme } from '../../context/ThemeContext';
import './StockVisibilityPage.css';

import { Package, CheckCircle, AlertTriangle, XCircle, RefreshCw, Loader } from 'lucide-react';

// Helper functions
const getNum = (obj, key, fallback = 0) => {
  if (obj?.[key] !== undefined && obj?.[key] !== null) {
    const val = Number(obj[key]);
    if (!isNaN(val)) return val;
  }
  const spacedKey = key + ' ';
  if (obj?.[spacedKey] !== undefined && obj?.[spacedKey] !== null) {
    const val = Number(obj[spacedKey]);
    if (!isNaN(val)) return val;
  }
  return fallback;
};

const getStr = (obj, key, fallback = '') => {
  if (obj?.[key] !== undefined && obj?.[key] !== null) return String(obj[key]).trim();
  const spacedKey = key + ' ';
  if (obj?.[spacedKey] !== undefined && obj?.[spacedKey] !== null) return String(obj[spacedKey]).trim();
  return fallback;
};

const getId = (obj) => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (obj.$oid) return obj.$oid;
  return obj._id || obj.id;
};

const getStockStatus = (currentStock, moq) => {
  if (currentStock <= 0) return 'OUT_OF_STOCK';
  if (currentStock < (moq || 0)) return 'LOW_STOCK';
  return 'IN_STOCK';
};

const SummaryChip = ({ label, count, color, bg, active, onPress }) => (
  <button
    className={`summary-chip ${active ? 'active' : ''}`}
    style={{ backgroundColor: bg, borderColor: active ? '#D32F2F' : 'transparent' }}
    onClick={onPress}
  >
    <span className="chip-count" style={{ color }}>{count}</span>
    <span className="chip-label" style={{ color }}>{label}</span>
  </button>
);

const StockVisibilityPage = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  const { list: products = [], loading: productsLoading } = useSelector(state => state.products) || {};
  const { data: invoices = [], loading: invoicesLoading } = useSelector(state => state.invoice) || {};

  const loadData = useCallback(async () => {
    await Promise.all([
      dispatch(fetchProducts()),
      dispatch(fetchInvoices({ filter: 'all' })),
    ]);
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const stockData = useMemo(() => {
    if (!products.length) return [];

    const stockMap = {};
    products.forEach(product => {
      const pid = getId(product._id);
      stockMap[pid] = {
        id: pid,
        name: getStr(product, 'name'),
        sku: getStr(product, 'sku'),
        currentStock: getNum(product, 'stock') || getNum(product, 'moq') || 0,
        moq: getNum(product, 'moq'),
      };
    });

    invoices.forEach(invoice => {
      (invoice.items || []).forEach(item => {
        const pid = getId(item.productId);
        if (stockMap[pid]) {
          stockMap[pid].currentStock -= getNum(item, 'qty');
        }
      });
    });

    return Object.values(stockMap).map(item => ({
      ...item,
      currentStock: Math.max(0, item.currentStock),
      status: getStockStatus(item.currentStock, item.moq),
    }));
  }, [products, invoices]);

  const inStockCount    = stockData.filter(i => i.status === 'IN_STOCK').length;
  const lowStockCount   = stockData.filter(i => i.status === 'LOW_STOCK').length;
  const outOfStockCount = stockData.filter(i => i.status === 'OUT_OF_STOCK').length;

  const filteredData = useMemo(() => {
    if (!activeFilter) return stockData;
    return stockData.filter(item => item.status === activeFilter);
  }, [stockData, activeFilter]);

  const handleFilterPress = (filter) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  if (productsLoading || invoicesLoading) {
    return (
      <div className={`stock-page ${isDark ? 'dark' : ''}`}>
        <div className="stock-loading">
          <Loader className="spin" size={40} />
          <p>Loading stock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`stock-page ${isDark ? 'dark' : ''}`}>
      <div className="stock-header">
        <h1>Stock Visibility</h1>
        <button className="refresh-btn" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="info-banner">
        Stock shown is distributor availability. Actual dispatch depends on order approval.
      </div>

      <div className="chips-row">
        <SummaryChip
          label="In Stock"
          count={inStockCount}
          color="#2E7D32"
          bg="#E8F5E9"
          active={activeFilter === 'IN_STOCK'}
          onPress={() => handleFilterPress('IN_STOCK')}
        />
        <SummaryChip
          label="Low"
          count={lowStockCount}
          color="#E65100"
          bg="#FFF3E0"
          active={activeFilter === 'LOW_STOCK'}
          onPress={() => handleFilterPress('LOW_STOCK')}
        />
        <SummaryChip
          label="Out"
          count={outOfStockCount}
          color="#C62828"
          bg="#FFEBEE"
          active={activeFilter === 'OUT_OF_STOCK'}
          onPress={() => handleFilterPress('OUT_OF_STOCK')}
        />
      </div>

      <div className="stock-grid">
        {filteredData.map(product => (
          <div key={product.id} className="stock-card">
            <div className="card-row">
              <div className="icon-circle">
                <Package size={20} color="#D32F2F" />
              </div>
              <div className="product-info">
                <div className="product-name">{product.name}</div>
                <div className="product-sku">SKU: {product.sku}</div>
              </div>
              <div className="status-badge">
                {product.status === 'IN_STOCK' && (
                  <>
                    <CheckCircle size={16} color="#2E7D32" />
                    <span className="stock-count in-stock">{product.currentStock}</span>
                  </>
                )}
                {product.status === 'LOW_STOCK' && (
                  <>
                    <AlertTriangle size={16} color="#F57C00" />
                    <span className="stock-count low-stock">{product.currentStock}</span>
                  </>
                )}
                {product.status === 'OUT_OF_STOCK' && (
                  <>
                    <XCircle size={16} color="#C62828" />
                    <span className="stock-count out-stock">Out</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="empty-state">
          <p>
            {activeFilter
              ? `No products with "${activeFilter.replace('_', ' ')}" status.`
              : 'No products found.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default StockVisibilityPage;