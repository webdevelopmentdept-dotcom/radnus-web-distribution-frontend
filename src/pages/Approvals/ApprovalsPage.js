import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserCheck, Clock } from 'lucide-react';
import {
  fetchPendingApprovals,
  fetchProcessedApprovals,
  approveRegistration,
  rejectRegistration,
} from '../../services/features/approvals/approvalSlice';
import { selectAuthState } from '../../store/selectors/authSelector';
import {
  SectionHeader, Button, Badge, Modal, Textarea, DataTable, Avatar, toast, ConfirmDialog,
} from '../../components/ui/UI';

/* ─── Role display labels — mirrors backend utils/roleHierarchy.js ─────────── */
const ROLE_LABELS = {
  Admin: 'Admin',
  Radnus: 'Radnus Employee',
  MarketingManager: 'Marketing Manager',
  MarketingExecutive: 'Marketing Executive',
  Distributor: 'Distributor',
  FSE: 'FSE',
  Retailer: 'Retailer',
};

const roleLabel = (role) => ROLE_LABELS[role] || role;

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
};

const statusVariant = (status) => {
  if (status === 'Approved') return 'active';
  if (status === 'Rejected') return 'inactive';
  if (status === 'Inactive') return 'default';
  return 'pending';
};

/* ─── View Details Modal ────────────────────────────────────────────────────── */
const RequestDetailModal = ({ open, onClose, request }) => {
  if (!request) return null;
  return (
    <Modal open={open} onClose={onClose} title="Registration Request" size="md"
      footer={<Button variant="primary" onClick={onClose}>Close</Button>}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <Avatar name={request.name || ''} size="lg" />
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{request.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{roleLabel(request.role)}</div>
          <Badge variant={statusVariant(request.status)} style={{ marginTop: 6 }}>{request.status || 'Pending'}</Badge>
        </div>
      </div>
      <div className="divider" />
      <div className="form-row">
        <div><div className="field-label" style={{ marginBottom: 4 }}>Email</div><div>{request.email || '—'}</div></div>
        <div><div className="field-label" style={{ marginBottom: 4 }}>Mobile</div><div>{request.mobile || '—'}</div></div>
      </div>
      <div className="form-row" style={{ marginTop: 14 }}>
        <div><div className="field-label" style={{ marginBottom: 4 }}>State</div><div>{request.state || '—'}</div></div>
        <div><div className="field-label" style={{ marginBottom: 4 }}>District</div><div>{request.district || '—'}</div></div>
      </div>
      <div className="form-row" style={{ marginTop: 14 }}>
        <div><div className="field-label" style={{ marginBottom: 4 }}>Taluk</div><div>{request.taluk || '—'}</div></div>
        <div><div className="field-label" style={{ marginBottom: 4 }}>Registered On</div><div>{fmtDate(request.createdAt)}</div></div>
      </div>
      {request.status === 'Approved' && (
        <div style={{ marginTop: 14 }}>
          <div className="field-label" style={{ marginBottom: 4 }}>Approved On</div>
          <div>{fmtDate(request.approvedAt)}</div>
        </div>
      )}
      {request.status === 'Rejected' && (
        <div style={{ marginTop: 14 }}>
          <div className="field-label" style={{ marginBottom: 4 }}>Rejection Reason</div>
          <div>{request.rejectionReason || '—'}</div>
        </div>
      )}
    </Modal>
  );
};

/* ─── Reject Modal (reason required) ────────────────────────────────────────── */
const RejectModal = ({ open, onClose, onConfirm, request, loading }) => {
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => { if (!open) { setReason(''); setErr(''); } }, [open]);

  const handleConfirm = () => {
    if (!reason.trim()) { setErr('Rejection reason is required'); return; }
    onConfirm(reason.trim());
  };

  return (
    <Modal open={open} onClose={onClose} title="Reject Registration" size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={loading} onClick={handleConfirm}>Reject Request</Button>
        </>
      }
    >
      <p style={{ marginBottom: 12, color: 'var(--text-muted)', fontSize: 13 }}>
        You're rejecting the registration for <strong>{request?.name}</strong> ({roleLabel(request?.role)}).
        Please provide a reason — it will be shown to the applicant.
      </p>
      <Textarea
        label="Rejection Reason"
        placeholder="e.g. Incomplete details, duplicate account…"
        value={reason}
        onChange={(e) => { setReason(e.target.value); setErr(''); }}
        error={err}
      />
    </Modal>
  );
};

/* ═══ Approvals Page ══════════════════════════════════════════════════════════ */
const ApprovalsPage = () => {
  const dispatch = useDispatch();
  const { role } = useSelector(selectAuthState);
  const {
    pending, processed, loading, processedLoading, actionLoading,
  } = useSelector((s) => s.approvals);

  const [tab, setTab] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [search, setSearch] = useState('');
  const [viewTarget, setViewTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchPendingApprovals());
  }, [dispatch]);

  useEffect(() => {
    if (tab !== 'pending') dispatch(fetchProcessedApprovals(tab));
  }, [tab, dispatch]);

  const sourceList = tab === 'pending' ? pending : processed;
  const isLoading = tab === 'pending' ? loading : processedLoading;

  const filtered = sourceList.filter((u) =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.mobile?.includes(search) ||
    roleLabel(u.role)?.toLowerCase().includes(search.toLowerCase())
  );

  const refresh = () => {
    dispatch(fetchPendingApprovals());
    if (tab !== 'pending') dispatch(fetchProcessedApprovals(tab));
  };

  const handleApprove = async (user) => {
    try {
      await dispatch(approveRegistration(user._id)).unwrap();
      toast.success(`${user.name} approved successfully`);
      setApproveTarget(null);
      refresh();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Approval failed');
    }
  };

  const handleReject = async (reason) => {
    try {
      await dispatch(rejectRegistration({ userId: rejectTarget._id, reason })).unwrap();
      toast.success(`${rejectTarget.name}'s registration was rejected`);
      setRejectTarget(null);
      refresh();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Rejection failed');
    }
  };

  const columns = [
    {
      key: 'name', label: 'Name',
      render: (_, u) => (
        <div className="avatar-row">
          <Avatar name={u.name || ''} size="sm" />
          <div className="avatar-row-info">
            <span className="avatar-row-name">{u.name || '—'}</span>
            <span className="avatar-row-sub">{u.district ? `${u.district}, ${u.state || ''}` : ''}</span>
          </div>
        </div>
      ),
    },
    { key: 'role', label: 'Role', render: (v) => <Badge variant="info">{roleLabel(v)}</Badge> },
    { key: 'email', label: 'Email', render: (v) => v || '—' },
    { key: 'mobile', label: 'Mobile Number', render: (v) => v || '—' },
    { key: 'createdAt', label: 'Registration Date', render: (v) => fmtDate(v) },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={statusVariant(v)}>{v || 'Pending'}</Badge> },
    {
      key: '_id', label: 'Actions',
      render: (_, u) => (
        <div className="td-actions">
          <Button variant="outline" size="xs" onClick={() => setViewTarget(u)}>View Details</Button>
          {tab === 'pending' && (
            <>
              <Button variant="success" size="xs" onClick={() => setApproveTarget(u)}>Approve</Button>
              <Button variant="danger" size="xs" onClick={() => setRejectTarget(u)}>Reject</Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Registration Approvals"
        count={tab === 'pending' ? pending.length : processed.length}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { key: 'pending', label: 'Pending', icon: Clock },
          { key: 'approved', label: 'Approved', icon: UserCheck },
          { key: 'rejected', label: 'Rejected', icon: UserCheck },
        ].map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search by name, email, mobile, role…"
        emptyIcon={<UserCheck size={36} />}
        emptyText={tab === 'pending' ? 'No pending requests' : `No ${tab} requests`}
      />

      <RequestDetailModal open={!!viewTarget} onClose={() => setViewTarget(null)} request={viewTarget} />

      <ConfirmDialog
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={() => handleApprove(approveTarget)}
        title="Approve Registration"
        message={`Approve ${approveTarget?.name}'s registration as ${roleLabel(approveTarget?.role)}? They will be able to log in immediately.`}
        confirmLabel="Approve"
        variant="success"
      />

      <RejectModal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        request={rejectTarget}
        loading={actionLoading}
      />
    </div>
  );
};

export default ApprovalsPage;
