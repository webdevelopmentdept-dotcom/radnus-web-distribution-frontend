// src/pages/Feedback/AdminFeedbackPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchFeedbacks,
  updateFeedbackStatus,
  deleteFeedback,
} from '../../services/features/retailer/feedbackSlice';
import {
  DataTable,
  Badge,
  Button,
  ConfirmDialog,
  toast,
  SectionHeader,
  Select,
} from '../../components/ui/UI';
import { Trash2 } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'READ', label: 'Read' },
  { value: 'RESOLVED', label: 'Resolved' },
];

const statusVariant = (status) => {
  switch (status) {
    case 'PENDING': return 'warning';
    case 'READ': return 'info';
    case 'RESOLVED': return 'success';
    default: return 'secondary';
  }
};

const AdminFeedbackPage = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(state => state.feedback);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    dispatch(fetchFeedbacks());
  }, [dispatch]);

  const filtered = filterStatus === 'ALL'
    ? list
    : list.filter(f => f.status === filterStatus);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await dispatch(updateFeedbackStatus({ id, status: newStatus })).unwrap();
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteFeedback(id)).unwrap();
      toast.success('Feedback deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const columns = [
    {
      key: 'message',
      label: 'Feedback',
      render: (_, f) => (
        <div>
          <div style={{ marginBottom: 4 }}>{f.message}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {f.user} · {f.phone || '—'} · {new Date(f.createdAt).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (s) => <Badge variant={statusVariant(s)}>{s}</Badge>,
    },
    {
      key: '_id',
      label: 'Actions',
      render: (_, f) => (
        <div className="td-actions">
          <Select
            value={f.status}
            options={STATUS_OPTIONS}
            onChange={(e) => handleStatusUpdate(f._id, e.target.value)}
            style={{ width: 120, marginRight: 8 }}
          />
          <Button variant="secondary" size="xs" onClick={() => setDeleteId(f._id)}>
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader title="Customer Feedback" count={list.length}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span>Filter by status:</span>
          <Select
            value={filterStatus}
            options={[
              { value: 'ALL', label: 'All' },
              ...STATUS_OPTIONS,
            ]}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: 140 }}
          />
        </div>
      </SectionHeader>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyText="No feedback entries"
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId).then(() => setDeleteId(null))}
        title="Delete Feedback"
        message="Permanently delete this feedback entry?"
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AdminFeedbackPage;