// // src/pages/Customer/CustomerListPage.js
// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { createSelector } from '@reduxjs/toolkit';
// import {
//   fetchAllCustomers,
//   deleteCustomer,
//   updateCustomer,
//   clearCustomerError,
// } from '../../services/features/customers/customerSlice.js';
// import { useTheme } from '../../context/ThemeContext';
// import './CustomerListPage.css';

// import {
//   Search,
//   X,
//   Phone,
//   MapPin,
//   Building2,
//   User,
//   RefreshCw,
//   Pencil,
//   Trash2,
//   Loader,
// } from 'lucide-react';

// // ----------------------------------------------------------------------
// // Memoized Customer Card (prevents unnecessary re-renders)
// // ----------------------------------------------------------------------
// const CustomerCard = React.memo(({ customer, isAdmin, onEdit, onDelete }) => {
//   return (
//     <div className="customer-card">
//       <div className="card-avatar">
//         {customer.name?.charAt(0).toUpperCase() || '?'}
//       </div>
//       <div className="card-info">
//         <h3 className="customer-name">{customer.name}</h3>
//         <div className="detail-row">
//           <Phone size={12} />
//           <span>{customer.phone}</span>
//         </div>
//         {customer.address && (
//           <div className="detail-row">
//             <MapPin size={12} />
//             <span>{customer.address}</span>
//           </div>
//         )}
//         {(customer.city || customer.state) && (
//           <div className="detail-row">
//             <Building2 size={12} />
//             <span>{[customer.city, customer.state].filter(Boolean).join(', ')}</span>
//           </div>
//         )}
//       </div>
//       {isAdmin && (
//         <div className="card-actions">
//           <button
//             className="action-btn edit"
//             onClick={() => onEdit(customer)}
//             title="Edit"
//           >
//             <Pencil size={14} />
//           </button>
//           <button
//             className="action-btn delete"
//             onClick={() => onDelete(customer)}
//             title="Delete"
//           >
//             <Trash2 size={14} />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// });

// // ----------------------------------------------------------------------
// // Memoized filter selector (only recomputes when customers or search changes)
// // ----------------------------------------------------------------------
// const selectCustomers = (state) => state.customer.list;
// const selectSearchText = (_, searchText) => searchText;

// const makeSelectFilteredCustomers = () =>
//   createSelector(
//     [selectCustomers, selectSearchText],
//     (customers, searchText) => {
//       if (!searchText || !customers) return customers || [];
//       const q = searchText.toLowerCase().trim();
//       return customers.filter(
//         (c) =>
//           c.name?.toLowerCase().includes(q) ||
//           c.phone?.includes(q) ||
//           c.city?.toLowerCase().includes(q) ||
//           c.state?.toLowerCase().includes(q)
//       );
//     }
//   );

// // ----------------------------------------------------------------------
// // Main Component
// // ----------------------------------------------------------------------
// const CustomerListPage = () => {
//   const dispatch = useDispatch();
//   const { theme } = useTheme();
//   const isDark = theme === 'dark';

//   // Auth – adjust to your actual auth slice (e.g., state.adminAuth, state.auth)
//   const { user } = useSelector((state) => state.auth || { user: null });
//   const isAdmin = user?.role === 'Admin' || user?.role === 'MarketingManager';

//   // Redux state
//   const { list: customers = [], loading, error, updateLoading } = useSelector(
//     (state) => state.customer
//   );

//   // Local state
//   const [searchText, setSearchText] = useState('');
//   const [debouncedSearch, setDebouncedSearch] = useState('');
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [editName, setEditName] = useState('');
//   const [editAddress, setEditAddress] = useState('');
//   const [editCity, setEditCity] = useState('');
//   const [editState, setEditState] = useState('');

//   // Memoized filtered list (stable selector + custom equality)
//   const selectFilteredCustomers = useMemo(makeSelectFilteredCustomers, []);
//   const filteredCustomers = useSelector(
//     (state) => selectFilteredCustomers(state, debouncedSearch),
//     (left, right) => {
//       if (left.length !== right.length) return false;
//       for (let i = 0; i < left.length; i++) {
//         if (left[i]._id !== right[i]._id || left[i].phone !== right[i].phone) return false;
//       }
//       return true;
//     }
//   );

//   // ------------------------------------------------------------------
//   // Effects
//   // ------------------------------------------------------------------
//   useEffect(() => {
//     const timer = setTimeout(() => setDebouncedSearch(searchText), 300);
//     return () => clearTimeout(timer);
//   }, [searchText]);

//   useEffect(() => {
//     dispatch(fetchAllCustomers());
//   }, [dispatch]);

//   // Auto-close modal when update finishes without error
//   useEffect(() => {
//     if (!updateLoading && editModalOpen && !error && selectedCustomer) {
//       setEditModalOpen(false);
//     }
//   }, [updateLoading, error, editModalOpen, selectedCustomer]);

//   // ------------------------------------------------------------------
//   // Handlers (useCallback for stability)
//   // ------------------------------------------------------------------
//   const handleRefresh = useCallback(() => {
//     dispatch(fetchAllCustomers());
//   }, [dispatch]);

//   const openEditModal = useCallback((customer) => {
//     if (!isAdmin) return;
//     setSelectedCustomer(customer);
//     setEditName(customer.name || '');
//     setEditAddress(customer.address || '');
//     setEditCity(customer.city || '');
//     setEditState(customer.state || '');
//     setEditModalOpen(true);
//   }, [isAdmin]);

//   const handleSaveEdit = useCallback(() => {
//     if (!isAdmin || !editName.trim() || !selectedCustomer) return;
//     dispatch(
//       updateCustomer({
//         phone: selectedCustomer.phone,
//         data: {
//           name: editName.trim(),
//           address: editAddress.trim(),
//           city: editCity.trim(),
//           state: editState.trim(),
//         },
//       })
//     );
//   }, [isAdmin, editName, editAddress, editCity, editState, selectedCustomer, dispatch]);

//   const handleDelete = useCallback((customer) => {
//     if (!isAdmin) return;
//     if (window.confirm(`Delete "${customer.name}"? This action cannot be undone.`)) {
//       dispatch(deleteCustomer(customer.phone));
//     }
//   }, [isAdmin, dispatch]);

//   const handleRetry = useCallback(() => {
//     dispatch(clearCustomerError());
//     dispatch(fetchAllCustomers());
//   }, [dispatch]);

//   const handleClearSearch = useCallback(() => setSearchText(''), []);
//   const handleCloseModal = useCallback(() => setEditModalOpen(false), []);

//   // Render each customer card (memoized)
//   const renderItem = useCallback((customer) => (
//     <CustomerCard
//       key={customer._id || customer.phone}
//       customer={customer}
//       isAdmin={isAdmin}
//       onEdit={openEditModal}
//       onDelete={handleDelete}
//     />
//   ), [isAdmin, openEditModal, handleDelete]);

//   // ------------------------------------------------------------------
//   // Loading / Error states
//   // ------------------------------------------------------------------
//   if (error && customers.length === 0) {
//     return (
//       <div className={`customer-page ${isDark ? 'dark' : ''}`}>
//         <div className="customer-error">
//           <RefreshCw size={48} />
//           <h3>Connection Error</h3>
//           <p>{error}</p>
//           <button onClick={handleRetry} className="btn-retry">
//             <RefreshCw size={16} /> Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ------------------------------------------------------------------
//   // Main render
//   // ------------------------------------------------------------------
//   return (
//     <div className={`customer-page ${isDark ? 'dark' : ''}`}>
//       <div className="customer-header">
//         <h1>Customers</h1>
//         <div className="search-wrapper">
//           <Search size={18} />
//           <input
//             type="text"
//             placeholder="Search by name, phone or city…"
//             value={searchText}
//             onChange={(e) => setSearchText(e.target.value)}
//             className="search-input"
//           />
//           {searchText && (
//             <button onClick={handleClearSearch} className="search-clear">
//               <X size={16} />
//             </button>
//           )}
//         </div>
//       </div>

//       {loading && customers.length === 0 ? (
//         <div className="customer-loading">
//           <Loader className="spin" size={32} />
//           <p>Loading customers…</p>
//         </div>
//       ) : (
//         <>
//           <div className="customer-grid">
//             {filteredCustomers.map(renderItem)}
//           </div>

//           {filteredCustomers.length === 0 && (
//             <div className="customer-empty">
//               <User size={48} />
//               <h3>{searchText ? 'No results found' : 'No customers yet'}</h3>
//               <p>
//                 {searchText
//                   ? `No customer matches “${searchText}”`
//                   : 'Customers added from orders will appear here'}
//               </p>
//               {searchText && (
//                 <button onClick={handleClearSearch} className="btn-clear-search">
//                   Clear Search
//                 </button>
//               )}
//             </div>
//           )}

//           {customers.length > 0 && (
//             <div className="customer-count">
//               {searchText
//                 ? `${filteredCustomers.length} of ${customers.length} customers`
//                 : `${customers.length} customer${customers.length !== 1 ? 's' : ''}`}
//             </div>
//           )}
//         </>
//       )}

//       {/* Edit Modal */}
//       {editModalOpen && (
//         <div className="modal-overlay" onClick={handleCloseModal}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>
//                 <Pencil size={18} /> Edit Customer
//               </h3>
//               <button className="modal-close" onClick={handleCloseModal}>
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="modal-body">
//               <div className="phone-pill">
//                 <Phone size={12} /> {selectedCustomer?.phone}
//               </div>
//               <input
//                 type="text"
//                 placeholder="Customer Name *"
//                 value={editName}
//                 onChange={(e) => setEditName(e.target.value)}
//                 className="modal-input"
//               />
//               <textarea
//                 placeholder="Address"
//                 value={editAddress}
//                 onChange={(e) => setEditAddress(e.target.value)}
//                 rows={2}
//                 className="modal-input"
//               />
//               <div className="row">
//                 <input
//                   type="text"
//                   placeholder="City"
//                   value={editCity}
//                   onChange={(e) => setEditCity(e.target.value)}
//                   className="modal-input"
//                 />
//                 <input
//                   type="text"
//                   placeholder="State"
//                   value={editState}
//                   onChange={(e) => setEditState(e.target.value)}
//                   className="modal-input"
//                 />
//               </div>
//               <button
//                 onClick={handleSaveEdit}
//                 disabled={updateLoading}
//                 className="btn-save"
//               >
//                 {updateLoading ? <Loader size={16} className="spin" /> : 'Save Changes'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CustomerListPage;

//------------------------------

// src/pages/Customer/CustomerListPage.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllCustomers,
  deleteCustomer,
  updateCustomer,
  clearCustomerError,
} from '../../services/features/customers/customerSlice.js';
import { useTheme } from '../../context/ThemeContext';
import './CustomerListPage.css';

import {
  Search,
  X,
  Phone,
  MapPin,
  Building2,
  User,
  RefreshCw,
  Pencil,
  Trash2,
  Loader,
} from 'lucide-react';

// ----------------------------------------------------------------------
// Memoized Customer Card (prevents unnecessary re-renders)
// ----------------------------------------------------------------------
const CustomerCard = React.memo(({ customer, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="customer-card">
      <div className="card-avatar">
        {customer.name?.charAt(0).toUpperCase() || '?'}
      </div>
      <div className="card-info">
        <h3 className="customer-name">{customer.name}</h3>
        <div className="detail-row">
          <Phone size={12} />
          <span>{customer.phone}</span>
        </div>
        {customer.address && (
          <div className="detail-row">
            <MapPin size={12} />
            <span>{customer.address}</span>
          </div>
        )}
        {(customer.city || customer.state) && (
          <div className="detail-row">
            <Building2 size={12} />
            <span>{[customer.city, customer.state].filter(Boolean).join(', ')}</span>
          </div>
        )}
      </div>
      {isAdmin && (
        <div className="card-actions">
          <button
            className="action-btn edit"
            onClick={() => onEdit(customer)}
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            className="action-btn delete"
            onClick={() => onDelete(customer)}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
});

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
const CustomerListPage = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Auth – adjust to your actual auth slice (e.g., state.adminAuth, state.auth)
  const { user } = useSelector((state) => state.auth || { user: null });
  const isAdmin = user?.role === 'Admin' || user?.role === 'MarketingManager';

  // Redux state
  const { list: customers = [], loading, error, updateLoading } = useSelector(
    (state) => state.customer
  );

  // Local state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');

  // Optimized filtering with useMemo (no extra deep equality checks)
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!debouncedSearch) return customers;
    const q = debouncedSearch.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.state?.toLowerCase().includes(q)
    );
  }, [customers, debouncedSearch]);

  // ------------------------------------------------------------------
  // Effects
  // ------------------------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    dispatch(fetchAllCustomers());
  }, [dispatch]);

  // Auto-close modal when update finishes without error
  useEffect(() => {
    if (!updateLoading && editModalOpen && !error && selectedCustomer) {
      setEditModalOpen(false);
    }
  }, [updateLoading, error, editModalOpen, selectedCustomer]);

  // ------------------------------------------------------------------
  // Handlers (useCallback for stability)
  // ------------------------------------------------------------------
  const handleRefresh = useCallback(() => {
    dispatch(fetchAllCustomers());
  }, [dispatch]);

  const openEditModal = useCallback((customer) => {
    if (!isAdmin) return;
    setSelectedCustomer(customer);
    setEditName(customer.name || '');
    setEditAddress(customer.address || '');
    setEditCity(customer.city || '');
    setEditState(customer.state || '');
    setEditModalOpen(true);
  }, [isAdmin]);

  const handleSaveEdit = useCallback(() => {
    if (!isAdmin || !editName.trim() || !selectedCustomer) return;
    dispatch(
      updateCustomer({
        phone: selectedCustomer.phone,
        data: {
          name: editName.trim(),
          address: editAddress.trim(),
          city: editCity.trim(),
          state: editState.trim(),
        },
      })
    );
  }, [isAdmin, editName, editAddress, editCity, editState, selectedCustomer, dispatch]);

  const handleDelete = useCallback((customer) => {
    if (!isAdmin) return;
    if (window.confirm(`Delete "${customer.name}"? This action cannot be undone.`)) {
      dispatch(deleteCustomer(customer.phone));
    }
  }, [isAdmin, dispatch]);

  const handleRetry = useCallback(() => {
    dispatch(clearCustomerError());
    dispatch(fetchAllCustomers());
  }, [dispatch]);

  const handleClearSearch = useCallback(() => setSearchText(''), []);
  const handleCloseModal = useCallback(() => setEditModalOpen(false), []);

  // Memoized card renderer
  const renderItem = useCallback((customer) => (
    <CustomerCard
      key={customer._id || customer.phone}
      customer={customer}
      isAdmin={isAdmin}
      onEdit={openEditModal}
      onDelete={handleDelete}
    />
  ), [isAdmin, openEditModal, handleDelete]);

  // ------------------------------------------------------------------
  // Loading / Error states
  // ------------------------------------------------------------------
  if (error && customers.length === 0) {
    return (
      <div className={`customer-page ${isDark ? 'dark' : ''}`}>
        <div className="customer-error">
          <RefreshCw size={48} />
          <h3>Connection Error</h3>
          <p>{error}</p>
          <button onClick={handleRetry} className="btn-retry">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Main render
  // ------------------------------------------------------------------
  return (
    <div className={`customer-page ${isDark ? 'dark' : ''}`}>
      <div className="customer-header">
        <div className="title-section">
          <h1>Customers</h1>
          {!loading && customers.length > 0 && (
            <span className="customer-badge">{customers.length}</span>
          )}
        </div>
        <div className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, phone or city…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />
          {searchText && (
            <button onClick={handleClearSearch} className="search-clear">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {loading && customers.length === 0 ? (
        <div className="customer-loading">
          <div className="spinner"></div>
          <p>Loading customers…</p>
        </div>
      ) : (
        <>
          <div className="customer-grid">
            {filteredCustomers.map(renderItem)}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="customer-empty">
              <div className="empty-illustration">
                <User size={56} strokeWidth={1.5} />
              </div>
              <h3>{searchText ? 'No results found' : 'No customers yet'}</h3>
              <p>
                {searchText
                  ? `No customer matches “${searchText}”`
                  : 'Customers added from orders will appear here'}
              </p>
              {searchText && (
                <button onClick={handleClearSearch} className="btn-clear-search">
                  Clear Search
                </button>
              )}
            </div>
          )}

          {customers.length > 0 && (
            <div className="customer-count">
              {searchText
                ? `${filteredCustomers.length} of ${customers.length} customers`
                : `${customers.length} customer${customers.length !== 1 ? 's' : ''}`}
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Pencil size={18} /> Edit Customer
              </h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="phone-pill">
                <Phone size={12} /> {selectedCustomer?.phone}
              </div>
              <input
                type="text"
                placeholder="Customer Name *"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="modal-input"
              />
              <textarea
                placeholder="Address"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                rows={2}
                className="modal-input"
              />
              <div className="row">
                <input
                  type="text"
                  placeholder="City"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="modal-input"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  className="modal-input"
                />
              </div>
              <button
                onClick={handleSaveEdit}
                disabled={updateLoading}
                className="btn-save"
              >
                {updateLoading ? <Loader size={16} className="spin" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerListPage;