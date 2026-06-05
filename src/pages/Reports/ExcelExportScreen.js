// // // src/pages/Reports/ExcelExportScreen.js
// // import React, { useState, useEffect } from 'react';
// // import { useDispatch, useSelector } from 'react-redux';
// // import { useTheme } from '../../context/ThemeContext';
// // import { 
// //   Download, 
// //   FileText, 
// //   Package, 
// //   Users, 
// //   ShoppingCart,
// //   TrendingUp,
// //   Calendar,
// //   X,
// //   CheckCircle,
// //   AlertCircle
// // } from 'lucide-react';
// // import {
// //   exportInvoicesToExcel,
// //   exportInvoiceItemsToExcel,
// //   exportSalesReturnsToExcel,
// //   exportSalesReturnItemsToExcel,
// //   exportPurchaseReturnsToExcel,
// //   exportProductsToExcel,
// //   exportCustomersToExcel
// // } from '../../utils/excelExport';
// // import { fetchInvoices } from '../../services/features/invoice/invoiceSlice';
// // import { fetchSalesReturns, fetchPurchaseReturns } from '../../services/features/returns/returnsSlice';
// // import { fetchProducts } from '../../services/features/products/productSlice';
// // import API from '../../services/API/api';
// // import './ExcelExportScreen.css';

// // const ExcelExportScreen = () => {
// //   const dispatch = useDispatch();
// //   const { theme } = useTheme();
// //   const isDark = theme === 'dark';
// //   const { user } = useSelector((state) => state.auth);
  
// //   // State for data
// //   const [invoices, setInvoices] = useState([]);
// //   const [salesReturns, setSalesReturns] = useState([]);
// //   const [purchaseReturns, setPurchaseReturns] = useState([]);
// //   const [products, setProducts] = useState([]);
// //   const [customers, setCustomers] = useState([]);
  
// //   // Loading states
// //   const [loading, setLoading] = useState({
// //     invoices: false,
// //     salesReturns: false,
// //     purchaseReturns: false,
// //     products: false,
// //     customers: false
// //   });
  
// //   // Filter states
// //   const [dateRange, setDateRange] = useState({
// //     fromDate: '',
// //     toDate: ''
// //   });
// //   const [showDateFilter, setShowDateFilter] = useState(false);
// //   const [exporting, setExporting] = useState(false);
// //   const [successMessage, setSuccessMessage] = useState('');

// //   // Report options
// //   const reportOptions = [
// //     {
// //       id: 'invoices',
// //       title: 'Invoices',
// //       icon: FileText,
// //       color: '#3b82f6',
// //       description: 'Export all invoice details including customer info, amounts, and payment modes',
// //       types: [
// //         { id: 'summary', name: 'Summary Report', description: 'Basic invoice information' },
// //         { id: 'detailed', name: 'Detailed Report', description: 'Invoice with item-wise details' }
// //       ]
// //     },
// //     {
// //       id: 'salesReturns',
// //       title: 'Sales Returns',
// //       icon: TrendingUp,
// //       color: '#ef4444',
// //       description: 'Export sales return records with customer and product details',
// //       types: [
// //         { id: 'summary', name: 'Summary Report', description: 'Basic return information' },
// //         { id: 'detailed', name: 'Detailed Report', description: 'Returns with item-wise details' }
// //       ]
// //     },
// //     {
// //       id: 'purchaseReturns',
// //       title: 'Purchase Returns',
// //       icon: ShoppingCart,
// //       color: '#f59e0b',
// //       description: 'Export purchase return records with supplier details',
// //       types: [
// //         { id: 'summary', name: 'Summary Report', description: 'Basic purchase return information' }
// //       ]
// //     },
// //     {
// //       id: 'products',
// //       title: 'Products',
// //       icon: Package,
// //       color: '#10b981',
// //       description: 'Export product catalog with pricing and inventory details',
// //       types: [
// //         { id: 'summary', name: 'Products Report', description: 'Complete product list' }
// //       ]
// //     },
// //     {
// //       id: 'customers',
// //       title: 'Customers',
// //       icon: Users,
// //       color: '#8b5cf6',
// //       description: 'Export customer database with contact and address details',
// //       types: [
// //         { id: 'summary', name: 'Customers Report', description: 'Complete customer list' }
// //       ]
// //     }
// //   ];

// //   // Fetch data when component mounts
// //   useEffect(() => {
// //     fetchAllData();
// //   }, []);

// //   const fetchAllData = async () => {
// //     const billerName = user?.role === 'Radnus' ? user?.name : '';
    
// //     // Fetch Invoices
// //     setLoading(prev => ({ ...prev, invoices: true }));
// //     try {
// //       const result = await dispatch(fetchInvoices({ filter: 'all', billerName })).unwrap();
// //       setInvoices(result?.data || []);
// //     } catch (error) {
// //       console.error('Error fetching invoices:', error);
// //       setInvoices([]);
// //     } finally {
// //       setLoading(prev => ({ ...prev, invoices: false }));
// //     }
    
// //     // Fetch Sales Returns
// //     setLoading(prev => ({ ...prev, salesReturns: true }));
// //     try {
// //       const result = await dispatch(fetchSalesReturns({ billerName })).unwrap();
// //       setSalesReturns(result || []);
// //     } catch (error) {
// //       console.error('Error fetching sales returns:', error);
// //       setSalesReturns([]);
// //     } finally {
// //       setLoading(prev => ({ ...prev, salesReturns: false }));
// //     }
    
// //     // Fetch Purchase Returns
// //     setLoading(prev => ({ ...prev, purchaseReturns: true }));
// //     try {
// //       const result = await dispatch(fetchPurchaseReturns({ billerName })).unwrap();
// //       setPurchaseReturns(result || []);
// //     } catch (error) {
// //       console.error('Error fetching purchase returns:', error);
// //       setPurchaseReturns([]);
// //     } finally {
// //       setLoading(prev => ({ ...prev, purchaseReturns: false }));
// //     }
    
// //     // Fetch Products
// //     setLoading(prev => ({ ...prev, products: true }));
// //     try {
// //       const result = await dispatch(fetchProducts()).unwrap();
// //       setProducts(result || []);
// //     } catch (error) {
// //       console.error('Error fetching products:', error);
// //       setProducts([]);
// //     } finally {
// //       setLoading(prev => ({ ...prev, products: false }));
// //     }
    
// //     // Fetch Customers - Direct API call
// //     setLoading(prev => ({ ...prev, customers: true }));
// //     try {
// //       const response = await API.get('/api/customers');
// //       setCustomers(response?.data || []);
// //     } catch (error) {
// //       console.error('Error fetching customers:', error);
// //       setCustomers([]);
// //     } finally {
// //       setLoading(prev => ({ ...prev, customers: false }));
// //     }
// //   };

// //   const filterDataByDate = (data, dateField = 'createdAt') => {
// //     if (!data || !Array.isArray(data)) return [];
// //     if (!dateRange.fromDate && !dateRange.toDate) return data;
    
// //     return data.filter(item => {
// //       const itemDate = new Date(item?.[dateField] || item?.invoiceDate || item?.createdAt);
// //       if (dateRange.fromDate && new Date(dateRange.fromDate) > itemDate) return false;
// //       if (dateRange.toDate) {
// //         const toDate = new Date(dateRange.toDate);
// //         toDate.setHours(23, 59, 59, 999);
// //         if (toDate < itemDate) return false;
// //       }
// //       return true;
// //     });
// //   };

// //   const handleExport = async (reportId, type) => {
// //     setExporting(true);
// //     setSuccessMessage('');
    
// //     try {
// //       let dataToExport = [];
// //       let filename = '';
      
// //       switch(reportId) {
// //         case 'invoices':
// //           dataToExport = filterDataByDate(invoices, 'createdAt');
// //           filename = `Invoices_${type === 'summary' ? 'Summary' : 'Detailed'}`;
// //           if (type === 'summary') {
// //             exportInvoicesToExcel(dataToExport, filename);
// //           } else {
// //             exportInvoiceItemsToExcel(dataToExport, filename);
// //           }
// //           break;
          
// //         case 'salesReturns':
// //           dataToExport = filterDataByDate(salesReturns, 'createdAt');
// //           filename = `Sales_Returns_${type === 'summary' ? 'Summary' : 'Detailed'}`;
// //           if (type === 'summary') {
// //             exportSalesReturnsToExcel(dataToExport, filename);
// //           } else {
// //             exportSalesReturnItemsToExcel(dataToExport, filename);
// //           }
// //           break;
          
// //         case 'purchaseReturns':
// //           dataToExport = filterDataByDate(purchaseReturns, 'createdAt');
// //           filename = 'Purchase_Returns_Report';
// //           exportPurchaseReturnsToExcel(dataToExport, filename);
// //           break;
          
// //         case 'products':
// //           dataToExport = products;
// //           filename = 'Products_Report';
// //           exportProductsToExcel(dataToExport, filename);
// //           break;
          
// //         case 'customers':
// //           dataToExport = customers;
// //           filename = 'Customers_Report';
// //           exportCustomersToExcel(dataToExport, filename);
// //           break;
          
// //         default:
// //           break;
// //       }
      
// //       setSuccessMessage(`${reportOptions.find(r => r.id === reportId)?.title} exported successfully!`);
// //       setTimeout(() => setSuccessMessage(''), 3000);
      
// //     } catch (error) {
// //       console.error('Export error:', error);
// //       alert('Failed to export data. Please try again.');
// //     } finally {
// //       setExporting(false);
// //     }
// //   };

// //   const getDataCount = (reportId) => {
// //     try {
// //       switch(reportId) {
// //         case 'invoices': 
// //           return Array.isArray(invoices) ? invoices.length : 0;
// //         case 'salesReturns': 
// //           return Array.isArray(salesReturns) ? salesReturns.length : 0;
// //         case 'purchaseReturns': 
// //           return Array.isArray(purchaseReturns) ? purchaseReturns.length : 0;
// //         case 'products': 
// //           return Array.isArray(products) ? products.length : 0;
// //         case 'customers': 
// //           return Array.isArray(customers) ? customers.length : 0;
// //         default: 
// //           return 0;
// //       }
// //     } catch (error) {
// //       console.error('Error getting data count:', error);
// //       return 0;
// //     }
// //   };

// //   const getLoadingState = (reportId) => {
// //     switch(reportId) {
// //       case 'invoices': return loading.invoices;
// //       case 'salesReturns': return loading.salesReturns;
// //       case 'purchaseReturns': return loading.purchaseReturns;
// //       case 'products': return loading.products;
// //       case 'customers': return loading.customers;
// //       default: return false;
// //     }
// //   };

// //   const resetDateFilter = () => {
// //     setDateRange({ fromDate: '', toDate: '' });
// //     setShowDateFilter(false);
// //   };

// //   // Safe number formatting function
// //   const formatNumber = (num) => {
// //     if (num === undefined || num === null) return '0';
// //     try {
// //       return num.toLocaleString();
// //     } catch (error) {
// //       return String(num);
// //     }
// //   };

// //   return (
// //     <div className={`excel-export-screen ${isDark ? 'dark' : ''}`}>
// //       <div className="export-header">
// //         <div className="header-title">
// //           <Download size={28} />
// //           <h1>Excel Export Center</h1>
// //         </div>
// //         <p className="header-description">
// //           Export your data to Excel format. Choose from various report types and export options.
// //         </p>
// //       </div>

// //       {successMessage && (
// //         <div className="success-toast">
// //           <CheckCircle size={18} />
// //           <span>{successMessage}</span>
// //         </div>
// //       )}

// //       <div className="filters-bar">
// //         <button 
// //           className={`filter-toggle-btn ${showDateFilter ? 'active' : ''}`}
// //           onClick={() => setShowDateFilter(!showDateFilter)}
// //         >
// //           <Calendar size={16} />
// //           Date Filter
// //           {showDateFilter && <X size={14} className="close-icon" onClick={(e) => {
// //             e.stopPropagation();
// //             resetDateFilter();
// //           }} />}
// //         </button>
        
// //         {showDateFilter && (
// //           <div className="date-filter-panel">
// //             <div className="date-input-group">
// //               <label>From Date</label>
// //               <input 
// //                 type="date" 
// //                 value={dateRange.fromDate}
// //                 onChange={(e) => setDateRange({...dateRange, fromDate: e.target.value})}
// //               />
// //             </div>
// //             <div className="date-input-group">
// //               <label>To Date</label>
// //               <input 
// //                 type="date" 
// //                 value={dateRange.toDate}
// //                 onChange={(e) => setDateRange({...dateRange, toDate: e.target.value})}
// //               />
// //             </div>
// //             {(dateRange.fromDate || dateRange.toDate) && (
// //               <button className="clear-filter-btn" onClick={resetDateFilter}>
// //                 Clear Filter
// //               </button>
// //             )}
// //           </div>
// //         )}
// //       </div>

// //       <div className="reports-grid">
// //         {reportOptions.map((report) => {
// //           const Icon = report.icon;
// //           const isLoading = getLoadingState(report.id);
// //           const dataCount = getDataCount(report.id);
          
// //           return (
// //             <div key={report.id} className="report-card">
// //               <div className="report-card-header" style={{ borderBottomColor: report.color }}>
// //                 <div className="report-icon" style={{ backgroundColor: `${report.color}15`, color: report.color }}>
// //                   <Icon size={24} />
// //                 </div>
// //                 <div className="report-info">
// //                   <h3>{report.title}</h3>
// //                   <p className="report-description">{report.description}</p>
// //                 </div>
// //               </div>
              
// //               <div className="report-stats">
// //                 <span className="stat-label">Total Records:</span>
// //                 <span className="stat-value">
// //                   {isLoading ? 'Loading...' : formatNumber(dataCount)}
// //                 </span>
// //               </div>
              
// //               <div className="export-options">
// //                 {report.types.map((type) => (
// //                   <button
// //                     key={type.id}
// //                     className="export-option-btn"
// //                     style={{ borderColor: report.color }}
// //                     onClick={() => handleExport(report.id, type.id)}
// //                     disabled={exporting || isLoading || dataCount === 0}
// //                   >
// //                     <Download size={16} style={{ color: report.color }} />
// //                     <div className="export-option-text">
// //                       <span className="export-name">{type.name}</span>
// //                       <span className="export-desc">{type.description}</span>
// //                     </div>
// //                   </button>
// //                 ))}
// //               </div>
              
// //               {dataCount === 0 && !isLoading && (
// //                 <div className="no-data-message">
// //                   <AlertCircle size={14} />
// //                   <span>No data available</span>
// //                 </div>
// //               )}
// //             </div>
// //           );
// //         })}
// //       </div>

// //       <div className="export-tips">
// //         <h4>Export Tips:</h4>
// //         <ul>
// //           <li>Use date filters to export data within a specific timeframe</li>
// //           <li>Summary reports provide overview data without item-level details</li>
// //           <li>Detailed reports include individual item/transaction details</li>
// //           <li>Exported files will be saved with timestamp in filename</li>
// //           <li>All exports are in .xlsx format compatible with Microsoft Excel</li>
// //         </ul>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ExcelExportScreen;

// //=======================================

// // src/pages/Reports/ExcelExportScreen.js
// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useTheme } from '../../context/ThemeContext';
// import { 
//   Download, 
//   FileText, 
//   Package, 
//   Users, 
//   ShoppingCart,
//   TrendingUp,
//   Calendar,
//   X,
//   CheckCircle,
//   AlertCircle
// } from 'lucide-react';
// import {
//   exportInvoicesToExcel,
//   exportInvoiceItemsToExcel,
//   exportSalesReturnsToExcel,
//   exportSalesReturnItemsToExcel,
//   exportPurchaseReturnsToExcel,
//   exportProductsToExcel,
//   exportCustomersToExcel
// } from '../../utils/excelExport';
// import { fetchInvoices } from '../../services/features/invoice/invoiceSlice';
// import { fetchSalesReturns, fetchPurchaseReturns } from '../../services/features/returns/returnsSlice';
// import { fetchProducts } from '../../services/features/products/productSlice';
// import API from '../../services/API/api';
// import './ExcelExportScreen.css';

// const ExcelExportScreen = () => {
//   const dispatch = useDispatch();
//   const { theme } = useTheme();
//   const isDark = theme === 'dark';
//   const { user } = useSelector((state) => state.auth);
  
//   // State for data
//   const [invoices, setInvoices] = useState([]);
//   const [salesReturns, setSalesReturns] = useState([]);
//   const [purchaseReturns, setPurchaseReturns] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [customers, setCustomers] = useState([]);
  
//   // Loading states
//   const [loading, setLoading] = useState({
//     invoices: false,
//     salesReturns: false,
//     purchaseReturns: false,
//     products: false,
//     customers: false
//   });
  
//   // Filter states
//   const [dateRange, setDateRange] = useState({
//     fromDate: '',
//     toDate: ''
//   });
//   const [showDateFilter, setShowDateFilter] = useState(false);
//   const [exporting, setExporting] = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');

//   // Report options
//   const reportOptions = [
//     {
//       id: 'invoices',
//       title: 'Invoices',
//       icon: FileText,
//       color: '#3b82f6',
//       description: 'Export all invoice details including customer info, amounts, and payment modes',
//       types: [
//         { id: 'summary', name: 'Summary Report', description: 'Basic invoice information' },
//         { id: 'detailed', name: 'Detailed Report', description: 'Invoice with item-wise details' }
//       ]
//     },
//     {
//       id: 'salesReturns',
//       title: 'Sales Returns',
//       icon: TrendingUp,
//       color: '#ef4444',
//       description: 'Export sales return records with customer and product details',
//       types: [
//         { id: 'summary', name: 'Summary Report', description: 'Basic return information' },
//         { id: 'detailed', name: 'Detailed Report', description: 'Returns with item-wise details' }
//       ]
//     },
//     {
//       id: 'purchaseReturns',
//       title: 'Purchase Returns',
//       icon: ShoppingCart,
//       color: '#f59e0b',
//       description: 'Export purchase return records with supplier details',
//       types: [
//         { id: 'summary', name: 'Summary Report', description: 'Basic purchase return information' }
//       ]
//     },
//     {
//       id: 'products',
//       title: 'Products',
//       icon: Package,
//       color: '#10b981',
//       description: 'Export product catalog with pricing and inventory details',
//       types: [
//         { id: 'summary', name: 'Products Report', description: 'Complete product list' }
//       ]
//     },
//     {
//       id: 'customers',
//       title: 'Customers',
//       icon: Users,
//       color: '#8b5cf6',
//       description: 'Export customer database with contact and address details',
//       types: [
//         { id: 'summary', name: 'Customers Report', description: 'Complete customer list' }
//       ]
//     }
//   ];

//   // Fetch data when component mounts
//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   const fetchAllData = async () => {
//     const billerName = user?.role === 'Radnus' ? user?.name : '';
    
//     // Fetch Invoices
//     setLoading(prev => ({ ...prev, invoices: true }));
//     try {
//       const result = await dispatch(fetchInvoices({ filter: 'all', billerName })).unwrap();
//       setInvoices(result.data || []);
//     } catch (error) {
//       console.error('Error fetching invoices:', error);
//     } finally {
//       setLoading(prev => ({ ...prev, invoices: false }));
//     }
    
//     // Fetch Sales Returns
//     setLoading(prev => ({ ...prev, salesReturns: true }));
//     try {
//       const result = await dispatch(fetchSalesReturns({ billerName })).unwrap();
//       setSalesReturns(result || []);
//     } catch (error) {
//       console.error('Error fetching sales returns:', error);
//     } finally {
//       setLoading(prev => ({ ...prev, salesReturns: false }));
//     }
    
//     // Fetch Purchase Returns
//     setLoading(prev => ({ ...prev, purchaseReturns: true }));
//     try {
//       const result = await dispatch(fetchPurchaseReturns({ billerName })).unwrap();
//       setPurchaseReturns(result || []);
//     } catch (error) {
//       console.error('Error fetching purchase returns:', error);
//     } finally {
//       setLoading(prev => ({ ...prev, purchaseReturns: false }));
//     }
    
//     // Fetch Products
//     setLoading(prev => ({ ...prev, products: true }));
//     try {
//       const result = await dispatch(fetchProducts()).unwrap();
//       setProducts(result || []);
//     } catch (error) {
//       console.error('Error fetching products:', error);
//     } finally {
//       setLoading(prev => ({ ...prev, products: false }));
//     }
    
//     // Fetch Customers - Direct API call
//     setLoading(prev => ({ ...prev, customers: true }));
//     try {
//       const response = await API.get('/api/customers');
//       setCustomers(response.data || []);
//     } catch (error) {
//       console.error('Error fetching customers:', error);
//       setCustomers([]);
//     } finally {
//       setLoading(prev => ({ ...prev, customers: false }));
//     }
//   };

//   const filterDataByDate = (data, dateField = 'createdAt') => {
//     if (!dateRange.fromDate && !dateRange.toDate) return data;
    
//     return data.filter(item => {
//       const itemDate = new Date(item[dateField] || item.invoiceDate || item.createdAt);
//       if (dateRange.fromDate && new Date(dateRange.fromDate) > itemDate) return false;
//       if (dateRange.toDate) {
//         const toDate = new Date(dateRange.toDate);
//         toDate.setHours(23, 59, 59, 999);
//         if (toDate < itemDate) return false;
//       }
//       return true;
//     });
//   };

//   const handleExport = async (reportId, type) => {
//     setExporting(true);
//     setSuccessMessage('');
    
//     try {
//       let dataToExport = [];
//       let filename = '';
      
//       switch(reportId) {
//         case 'invoices':
//           dataToExport = filterDataByDate(invoices, 'createdAt');
//           filename = `Invoices_${type === 'summary' ? 'Summary' : 'Detailed'}`;
//           if (type === 'summary') {
//             exportInvoicesToExcel(dataToExport, filename);
//           } else {
//             exportInvoiceItemsToExcel(dataToExport, filename);
//           }
//           break;
          
//         case 'salesReturns':
//           dataToExport = filterDataByDate(salesReturns, 'createdAt');
//           filename = `Sales_Returns_${type === 'summary' ? 'Summary' : 'Detailed'}`;
//           if (type === 'summary') {
//             exportSalesReturnsToExcel(dataToExport, filename);
//           } else {
//             exportSalesReturnItemsToExcel(dataToExport, filename);
//           }
//           break;
          
//         case 'purchaseReturns':
//           dataToExport = filterDataByDate(purchaseReturns, 'createdAt');
//           filename = 'Purchase_Returns_Report';
//           exportPurchaseReturnsToExcel(dataToExport, filename);
//           break;
          
//         case 'products':
//           dataToExport = products;
//           filename = 'Products_Report';
//           exportProductsToExcel(dataToExport, filename);
//           break;
          
//         case 'customers':
//           dataToExport = customers;
//           filename = 'Customers_Report';
//           exportCustomersToExcel(dataToExport, filename);
//           break;
          
//         default:
//           break;
//       }
      
//       setSuccessMessage(`${reportOptions.find(r => r.id === reportId)?.title} exported successfully!`);
//       setTimeout(() => setSuccessMessage(''), 3000);
      
//     } catch (error) {
//       console.error('Export error:', error);
//       alert('Failed to export data. Please try again.');
//     } finally {
//       setExporting(false);
//     }
//   };

//   const getDataCount = (reportId) => {
//     switch(reportId) {
//       case 'invoices': return invoices.length;
//       case 'salesReturns': return salesReturns.length;
//       case 'purchaseReturns': return purchaseReturns.length;
//       case 'products': return products.length;
//       case 'customers': return customers.length;
//       default: return 0;
//     }
//   };

//   const getLoadingState = (reportId) => {
//     switch(reportId) {
//       case 'invoices': return loading.invoices;
//       case 'salesReturns': return loading.salesReturns;
//       case 'purchaseReturns': return loading.purchaseReturns;
//       case 'products': return loading.products;
//       case 'customers': return loading.customers;
//       default: return false;
//     }
//   };

//   const resetDateFilter = () => {
//     setDateRange({ fromDate: '', toDate: '' });
//     setShowDateFilter(false);
//   };

//   return (
//     <div className={`excel-export-screen ${isDark ? 'dark' : ''}`}>
//       <div className="export-header">
//         <div className="header-title">
//           <Download size={28} />
//           <h1>Excel Export Center</h1>
//         </div>
//         <p className="header-description">
//           Export your data to Excel format. Choose from various report types and export options.
//         </p>
//       </div>

//       {successMessage && (
//         <div className="success-toast">
//           <CheckCircle size={18} />
//           <span>{successMessage}</span>
//         </div>
//       )}

//       <div className="filters-bar">
//         <button 
//           className={`filter-toggle-btn ${showDateFilter ? 'active' : ''}`}
//           onClick={() => setShowDateFilter(!showDateFilter)}
//         >
//           <Calendar size={16} />
//           Date Filter
//           {showDateFilter && <X size={14} className="close-icon" onClick={(e) => {
//             e.stopPropagation();
//             resetDateFilter();
//           }} />}
//         </button>
        
//         {showDateFilter && (
//           <div className="date-filter-panel">
//             <div className="date-input-group">
//               <label>From Date</label>
//               <input 
//                 type="date" 
//                 value={dateRange.fromDate}
//                 onChange={(e) => setDateRange({...dateRange, fromDate: e.target.value})}
//               />
//             </div>
//             <div className="date-input-group">
//               <label>To Date</label>
//               <input 
//                 type="date" 
//                 value={dateRange.toDate}
//                 onChange={(e) => setDateRange({...dateRange, toDate: e.target.value})}
//               />
//             </div>
//             {(dateRange.fromDate || dateRange.toDate) && (
//               <button className="clear-filter-btn" onClick={resetDateFilter}>
//                 Clear Filter
//               </button>
//             )}
//           </div>
//         )}
//       </div>

//       <div className="reports-grid">
//         {reportOptions.map((report) => {
//           const Icon = report.icon;
//           const isLoading = getLoadingState(report.id);
//           const dataCount = getDataCount(report.id);
          
//           return (
//             <div key={report.id} className="report-card">
//               <div className="report-card-header" style={{ borderBottomColor: report.color }}>
//                 <div className="report-icon" style={{ backgroundColor: `${report.color}15`, color: report.color }}>
//                   <Icon size={24} />
//                 </div>
//                 <div className="report-info">
//                   <h3>{report.title}</h3>
//                   <p className="report-description">{report.description}</p>
//                 </div>
//               </div>
              
//               <div className="report-stats">
//                 <span className="stat-label">Total Records:</span>
//                 <span className="stat-value">
//                   {isLoading ? 'Loading...' : dataCount.toLocaleString()}
//                 </span>
//               </div>
              
//               <div className="export-options">
//                 {report.types.map((type) => (
//                   <button
//                     key={type.id}
//                     className="export-option-btn"
//                     style={{ borderColor: report.color }}
//                     onClick={() => handleExport(report.id, type.id)}
//                     disabled={exporting || isLoading || dataCount === 0}
//                   >
//                     <Download size={16} style={{ color: report.color }} />
//                     <div className="export-option-text">
//                       <span className="export-name">{type.name}</span>
//                       <span className="export-desc">{type.description}</span>
//                     </div>
//                   </button>
//                 ))}
//               </div>
              
//               {dataCount === 0 && !isLoading && (
//                 <div className="no-data-message">
//                   <AlertCircle size={14} />
//                   <span>No data available</span>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       <div className="export-tips">
//         <h4>Export Tips:</h4>
//         <ul>
//           <li>Use date filters to export data within a specific timeframe</li>
//           <li>Summary reports provide overview data without item-level details</li>
//           <li>Detailed reports include individual item/transaction details</li>
//           <li>Exported files will be saved with timestamp in filename</li>
//           <li>All exports are in .xlsx format compatible with Microsoft Excel</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default ExcelExportScreen;

//++++++++++++++++++++++++++++++++++++

// src/pages/Reports/ExcelExportScreen.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { 
  Download, 
  FileText, 
  Package, 
  Users, 
  ShoppingCart,
  TrendingUp,
  Calendar,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  exportInvoicesToExcel,
  exportInvoiceItemsToExcel,
  exportSalesReturnsToExcel,
  exportSalesReturnItemsToExcel,
  exportPurchaseReturnsToExcel,
  exportProductsToExcel,
  exportCustomersToExcel
} from '../../utils/excelExport';
import { fetchInvoices } from '../../services/features/invoice/invoiceSlice';
import { fetchSalesReturns, fetchPurchaseReturns } from '../../services/features/returns/returnsSlice';
import { fetchProducts } from '../../services/features/products/productSlice';
import API from '../../services/API/api';
import DataTableModal from '../../pages/Reports/DataTableModal';
import './ExcelExportScreen.css';

const ExcelExportScreen = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useSelector((state) => state.auth);
  
  // State for data
  const [invoices, setInvoices] = useState([]);
  const [salesReturns, setSalesReturns] = useState([]);
  const [purchaseReturns, setPurchaseReturns] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    invoices: false,
    salesReturns: false,
    purchaseReturns: false,
    products: false,
    customers: false
  });
  
  // Filter states
  const [dateRange, setDateRange] = useState({
    fromDate: '',
    toDate: ''
  });
  const [periodFilter, setPeriodFilter] = useState('all'); // all, today, yesterday, last7days, thisWeek, lastWeek, thisMonth, lastMonth, custom
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal states
  const [selectedModal, setSelectedModal] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Report options
  const reportOptions = [
    {
      id: 'invoices',
      title: 'Invoices',
      icon: FileText,
      color: '#3b82f6',
      description: 'Export all invoice details including customer info, amounts, and payment modes',
      types: [
        { id: 'summary', name: 'Summary Report', description: 'Basic invoice information' },
        { id: 'detailed', name: 'Detailed Report', description: 'Invoice with item-wise details' }
      ]
    },
    {
      id: 'salesReturns',
      title: 'Sales Returns',
      icon: TrendingUp,
      color: '#ef4444',
      description: 'Export sales return records with customer and product details',
      types: [
        { id: 'summary', name: 'Summary Report', description: 'Basic return information' },
        { id: 'detailed', name: 'Detailed Report', description: 'Returns with item-wise details' }
      ]
    },
    {
      id: 'purchaseReturns',
      title: 'Purchase Returns',
      icon: ShoppingCart,
      color: '#f59e0b',
      description: 'Export purchase return records with supplier details',
      types: [
        { id: 'summary', name: 'Summary Report', description: 'Basic purchase return information' }
      ]
    },
    {
      id: 'products',
      title: 'Products',
      icon: Package,
      color: '#10b981',
      description: 'Export product catalog with pricing and inventory details',
      types: [
        { id: 'summary', name: 'Products Report', description: 'Complete product list' }
      ]
    },
    {
      id: 'customers',
      title: 'Customers',
      icon: Users,
      color: '#8b5cf6',
      description: 'Export customer database with contact and address details',
      types: [
        { id: 'summary', name: 'Customers Report', description: 'Complete customer list' }
      ]
    }
  ];

  // Period options for filtering
  const periodOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' }
  ];

  // Fetch data when component mounts
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const billerName = user?.role === 'Radnus' ? user?.name : '';
    
    // Fetch Invoices
    setLoading(prev => ({ ...prev, invoices: true }));
    try {
      const result = await dispatch(fetchInvoices({ filter: 'all', billerName })).unwrap();
      setInvoices(result.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(prev => ({ ...prev, invoices: false }));
    }
    
    // Fetch Sales Returns
    setLoading(prev => ({ ...prev, salesReturns: true }));
    try {
      const result = await dispatch(fetchSalesReturns({ billerName })).unwrap();
      setSalesReturns(result || []);
    } catch (error) {
      console.error('Error fetching sales returns:', error);
    } finally {
      setLoading(prev => ({ ...prev, salesReturns: false }));
    }
    
    // Fetch Purchase Returns
    setLoading(prev => ({ ...prev, purchaseReturns: true }));
    try {
      const result = await dispatch(fetchPurchaseReturns({ billerName })).unwrap();
      setPurchaseReturns(result || []);
    } catch (error) {
      console.error('Error fetching purchase returns:', error);
    } finally {
      setLoading(prev => ({ ...prev, purchaseReturns: false }));
    }
    
    // Fetch Products
    setLoading(prev => ({ ...prev, products: true }));
    try {
      const result = await dispatch(fetchProducts()).unwrap();
      setProducts(result || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
    
    // Fetch Customers - Direct API call
    setLoading(prev => ({ ...prev, customers: true }));
    try {
      const response = await API.get('/api/customers');
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(prev => ({ ...prev, customers: false }));
    }
  };

  // Helper function to get date range based on period filter
  const getDateRangeFromPeriod = (period) => {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch(period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last7days':
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case 'thisWeek':
        const day = now.getDay();
        start.setDate(now.getDate() - day);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastWeek':
        const lastWeekDate = new Date(now);
        lastWeekDate.setDate(now.getDate() - 7);
        const lastWeekDay = lastWeekDate.getDay();
        start.setDate(lastWeekDate.getDate() - lastWeekDay);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastMonth':
        start.setMonth(now.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(now.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        return null;
    }

    return { fromDate: start, toDate: end };
  };

  const filterDataByDate = (data, dateField = 'createdAt') => {
    let fromDate = dateRange.fromDate ? new Date(dateRange.fromDate) : null;
    let toDate = dateRange.toDate ? new Date(dateRange.toDate) : null;

    // Apply period filter if not custom
    if (periodFilter !== 'custom' && periodFilter !== 'all') {
      const periodRange = getDateRangeFromPeriod(periodFilter);
      if (periodRange) {
        fromDate = periodRange.fromDate;
        toDate = periodRange.toDate;
      }
    }
    
    if (!fromDate && !toDate) return data;
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField] || item.invoiceDate || item.createdAt);
      if (fromDate && fromDate > itemDate) return false;
      if (toDate && toDate < itemDate) return false;
      return true;
    });
  };

  const handleViewData = (reportId) => {
    let data = [];
    let title = '';
    
    switch(reportId) {
      case 'invoices':
        data = filterDataByDate(invoices, 'createdAt');
        title = 'Invoices Data';
        break;
      case 'salesReturns':
        data = filterDataByDate(salesReturns, 'createdAt');
        title = 'Sales Returns Data';
        break;
      case 'purchaseReturns':
        data = filterDataByDate(purchaseReturns, 'createdAt');
        title = 'Purchase Returns Data';
        break;
      case 'products':
        data = products;
        title = 'Products Data';
        break;
      case 'customers':
        data = customers;
        title = 'Customers Data';
        break;
      default:
        return;
    }
    
    setModalData(data);
    setModalTitle(title);
    setSelectedModal(reportId);
    setCurrentPage(1);
  };

  const handleExport = async (reportId, type) => {
    setExporting(true);
    setSuccessMessage('');
    
    try {
      let dataToExport = [];
      let filename = '';
      
      switch(reportId) {
        case 'invoices':
          dataToExport = filterDataByDate(invoices, 'createdAt');
          filename = `Invoices_${type === 'summary' ? 'Summary' : 'Detailed'}`;
          if (type === 'summary') {
            exportInvoicesToExcel(dataToExport, filename);
          } else {
            exportInvoiceItemsToExcel(dataToExport, filename);
          }
          break;
          
        case 'salesReturns':
          dataToExport = filterDataByDate(salesReturns, 'createdAt');
          filename = `Sales_Returns_${type === 'summary' ? 'Summary' : 'Detailed'}`;
          if (type === 'summary') {
            exportSalesReturnsToExcel(dataToExport, filename);
          } else {
            exportSalesReturnItemsToExcel(dataToExport, filename);
          }
          break;
          
        case 'purchaseReturns':
          dataToExport = filterDataByDate(purchaseReturns, 'createdAt');
          filename = 'Purchase_Returns_Report';
          exportPurchaseReturnsToExcel(dataToExport, filename);
          break;
          
        case 'products':
          dataToExport = products;
          filename = 'Products_Report';
          exportProductsToExcel(dataToExport, filename);
          break;
          
        case 'customers':
          dataToExport = customers;
          filename = 'Customers_Report';
          exportCustomersToExcel(dataToExport, filename);
          break;
          
        default:
          break;
      }
      
      setSuccessMessage(`${reportOptions.find(r => r.id === reportId)?.title} exported successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handlePeriodChange = (period) => {
    setPeriodFilter(period);
    if (period !== 'custom') {
      setDateRange({ fromDate: '', toDate: '' });
      setShowDateFilter(false);
    } else {
      setShowDateFilter(true);
    }
  };

  const getDataCount = (reportId) => {
    let data = [];
    switch(reportId) {
      case 'invoices': data = invoices; break;
      case 'salesReturns': data = salesReturns; break;
      case 'purchaseReturns': data = purchaseReturns; break;
      case 'products': data = products; break;
      case 'customers': data = customers; break;
      default: return 0;
    }
    return filterDataByDate(data, 'createdAt').length;
  };

  const getLoadingState = (reportId) => {
    switch(reportId) {
      case 'invoices': return loading.invoices;
      case 'salesReturns': return loading.salesReturns;
      case 'purchaseReturns': return loading.purchaseReturns;
      case 'products': return loading.products;
      case 'customers': return loading.customers;
      default: return false;
    }
  };

  const resetDateFilter = () => {
    setDateRange({ fromDate: '', toDate: '' });
    setShowDateFilter(false);
    setPeriodFilter('all');
  };

  // Get display text for current period filter
  const getPeriodDisplayText = () => {
    const period = periodOptions.find(p => p.value === periodFilter);
    return period ? period.label : 'All Time';
  };

  return (
    <div className={`excel-export-screen ${isDark ? 'dark' : ''}`}>
      <div className="export-header">
        <div className="header-title">
          <Download size={28} />
          <h1>Excel Export Center</h1>
        </div>
        <p className="header-description">
          Export your data to Excel format. Choose from various report types and export options.
        </p>
      </div>

      {successMessage && (
        <div className="success-toast">
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="filters-bar">
        <div className="period-filters">
          <label className="period-label">Time Period:</label>
          <select 
            className="period-select"
            value={periodFilter}
            onChange={(e) => handlePeriodChange(e.target.value)}
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <button 
            className={`filter-toggle-btn ${showDateFilter ? 'active' : ''}`}
            onClick={() => {
              handlePeriodChange('custom');
            }}
          >
            <Calendar size={16} />
            Custom Date Range
          </button>
        </div>
        
        {showDateFilter && (
          <div className="date-filter-panel">
            <div className="date-input-group">
              <label>From Date</label>
              <input 
                type="date" 
                value={dateRange.fromDate}
                onChange={(e) => setDateRange({...dateRange, fromDate: e.target.value})}
              />
            </div>
            <div className="date-input-group">
              <label>To Date</label>
              <input 
                type="date" 
                value={dateRange.toDate}
                onChange={(e) => setDateRange({...dateRange, toDate: e.target.value})}
              />
            </div>
            {(dateRange.fromDate || dateRange.toDate) && (
              <button className="clear-filter-btn" onClick={resetDateFilter}>
                Clear Filter
              </button>
            )}
          </div>
        )}
        
        <div className="active-filter-info">
          {periodFilter !== 'all' && (
            <span className="filter-badge">
              Filter: {getPeriodDisplayText()}
              <X size={14} onClick={resetDateFilter} className="filter-badge-close" />
            </span>
          )}
        </div>
      </div>

      <div className="reports-grid">
        {reportOptions.map((report) => {
          const Icon = report.icon;
          const isLoading = getLoadingState(report.id);
          const dataCount = getDataCount(report.id);
          
          return (
            <div key={report.id} className="report-card">
              <div className="report-card-header" style={{ borderBottomColor: report.color }}>
                <div className="report-icon" style={{ backgroundColor: `${report.color}15`, color: report.color }}>
                  <Icon size={24} />
                </div>
                <div className="report-info">
                  <h3>{report.title}</h3>
                  <p className="report-description">{report.description}</p>
                </div>
              </div>
              
              <div className="report-stats">
                <span className="stat-label">Total Records:</span>
                <span className="stat-value">
                  {isLoading ? 'Loading...' : dataCount.toLocaleString()}
                </span>
              </div>
              
              <div className="action-buttons">
                <button
                  className="view-data-btn"
                  onClick={() => handleViewData(report.id)}
                  disabled={isLoading || dataCount === 0}
                >
                  <Eye size={16} />
                  View Data
                </button>
              </div>
              
              <div className="export-options">
                {report.types.map((type) => (
                  <button
                    key={type.id}
                    className="export-option-btn"
                    style={{ borderColor: report.color }}
                    onClick={() => handleExport(report.id, type.id)}
                    disabled={exporting || isLoading || dataCount === 0}
                  >
                    <Download size={16} style={{ color: report.color }} />
                    <div className="export-option-text">
                      <span className="export-name">{type.name}</span>
                      <span className="export-desc">{type.description}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {dataCount === 0 && !isLoading && (
                <div className="no-data-message">
                  <AlertCircle size={14} />
                  <span>No data available for selected period</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="export-tips">
        <h4>Export Tips:</h4>
        <ul>
          <li>Use time period filters to export data for specific timeframes (Today, This Week, This Month, etc.)</li>
          <li>Use custom date range for specific date intervals</li>
          <li>Click "View Data" to preview data before exporting</li>
          <li>Summary reports provide overview data without item-level details</li>
          <li>Detailed reports include individual item/transaction details</li>
          <li>All exports are in .xlsx format compatible with Microsoft Excel</li>
        </ul>
      </div>

      {/* Data Table Modal */}
      <DataTableModal
        isOpen={selectedModal !== null}
        onClose={() => setSelectedModal(null)}
        title={modalTitle}
        data={modalData}
        reportType={selectedModal}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onExport={() => {
          if (selectedModal) {
            handleExport(selectedModal, 'summary');
          }
        }}
      />
    </div>
  );
};

export default ExcelExportScreen;