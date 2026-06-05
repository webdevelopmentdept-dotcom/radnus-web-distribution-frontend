// src/components/Reports/DataTableModal.js
import React from 'react';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import './DataTableModal.css';

const DataTableModal = ({ 
  isOpen, 
  onClose, 
  title, 
  data, 
  reportType,
  currentPage,
  itemsPerPage,
  onPageChange,
  onExport
}) => {
  if (!isOpen) return null;

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Define columns based on report type
  const getColumns = () => {
    switch(reportType) {
      case 'invoices':
        return [
          { key: 'invoiceNumber', label: 'Invoice No' },
          { key: 'invoiceDate', label: 'Date' },
          { key: 'customerName', label: 'Customer' },
          { key: 'customerPhone', label: 'Phone' },
          { key: 'totalAmount', label: 'Amount (₹)' },
          { key: 'paymentMode', label: 'Payment' },
          { key: 'status', label: 'Status' }
        ];
      case 'salesReturns':
        return [
          { key: 'returnNumber', label: 'Return No' },
          { key: 'createdAt', label: 'Date' },
          { key: 'customerName', label: 'Customer' },
          { key: 'referenceInvoice', label: 'Reference Invoice' },
          { key: 'totalAmount', label: 'Amount (₹)' },
          { key: 'status', label: 'Status' }
        ];
      case 'purchaseReturns':
        return [
          { key: 'returnNumber', label: 'Return No' },
          { key: 'createdAt', label: 'Date' },
          { key: 'supplierName', label: 'Supplier' },
          { key: 'referencePO', label: 'Reference PO' },
          { key: 'totalAmount', label: 'Amount (₹)' },
          { key: 'status', label: 'Status' }
        ];
      case 'products':
        return [
          { key: 'name', label: 'Product Name' },
          { key: 'sku', label: 'SKU' },
          { key: 'category', label: 'Category' },
          { key: 'mrp', label: 'MRP (₹)' },
          { key: 'retailerPrice', label: 'Retail Price (₹)' },
          { key: 'status', label: 'Status' }
        ];
      case 'customers':
        return [
          { key: 'name', label: 'Name' },
          { key: 'phone', label: 'Phone' },
          { key: 'type', label: 'Type' },
          { key: 'shopName', label: 'Shop Name' },
          { key: 'city', label: 'City' },
          { key: 'state', label: 'State' }
        ];
      default:
        return [];
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatValue = (item, key) => {
    const value = item[key];
    if (key === 'createdAt' || key === 'invoiceDate') {
      return formatDate(value);
    }
    if (key === 'totalAmount' || key === 'mrp' || key === 'retailerPrice') {
      return typeof value === 'number' ? value.toFixed(2) : value;
    }
    return value || '-';
  };

  const columns = getColumns();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <div className="modal-actions">
            <button className="modal-export-btn" onClick={onExport}>
              <Download size={18} />
              Export to Excel
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="modal-content">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  {columns.map(col => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>{indexOfFirstItem + idx + 1}</td>
                      {columns.map(col => (
                        <td key={col.key}>{formatValue(item, col.key)}</td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="no-data">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <span className="total-records">Total Records: {data.length}</span>
        </div>
      </div>
    </div>
  );
};

export default DataTableModal;