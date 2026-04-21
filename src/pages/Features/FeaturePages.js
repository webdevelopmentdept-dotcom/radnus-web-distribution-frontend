// ═══════════════════════════════════════════════════════════════════════════════
//  Distributors Page
// ═══════════════════════════════════════════════════════════════════════════════
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Truck, Map, Users, UserCog, ChevronDown, ChevronRight, MapPin, Trash2, SquarePen, UserCheck } from 'lucide-react';
import { fetchDistributors, addDistributor, deleteDistributor } from '../../services/features/distributor/distributorSlice';
import { getManagers, addManager, deleteManager } from '../../services/features/manager/managerSlice';
import { getExecutives, addExecutive, deleteExecutive } from '../../services/features/executive/executiveSlice';
import { fetchFSE, addFSE } from '../../services/features/fse/fseSlice';
import { fetchTerritory, addTerritory, updateTerritory, deleteState, deleteDistrict, deleteTaluk, assignTaluk, addBeat } from '../../services/features/Territory/TerritorySlice';
import { selectAuthState } from '../../store/selectors/authSelector';
import { SectionHeader, Button, Badge, Modal, Input, Select, DataTable, Avatar, toast, ConfirmDialog, Card, EmptyState, Spinner } from '../../components/ui/UI';
import locationData from '../../assets/json/Location.json';

/* ─── Shared helpers ─────────────────────────────────────────────────────────── */
const statusBadge = (s) => <Badge variant={s === 'Active' ? 'active' : s === 'Inactive' ? 'inactive' : 'pending'}>{s || 'Pending'}</Badge>;

/* ═══════════════════════════════════════════════════════════════════════════════
   DISTRIBUTORS PAGE
════════════════════════════════════════════════════════════════════════════════ */
export const DistributorsPage = () => {
  const dispatch = useDispatch();
  const { role } = useSelector(selectAuthState);
  const { list, loading } = useSelector(s => s.distributors);
  const [search, setSearch] = useState('');
  const [modal,  setModal]  = useState(false);
  const [view,   setView]   = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [vals, setVals] = useState({ name: '', contactPerson: '', phone: '', email: '', state: '', district: '', city: '', password: '' });
  const [errs, setErrs] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { dispatch(fetchDistributors()); }, [dispatch]);

  const states    = Object.keys(locationData || {});
  const districts = vals.state ? Object.keys(locationData[vals.state] || {}) : [];
  const set = (k, v) => { setVals(p => ({ ...p, [k]: v, ...(k === 'state' ? { district: '' } : {}) })); setErrs(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!vals.name) e.name = 'Company name required';
    if (!vals.phone || vals.phone.length < 10) e.phone = 'Valid phone required';
    if (!vals.password || vals.password.length < 6) e.password = 'Min 6 characters';
    setErrs(e); return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const fd = new FormData();
    Object.entries(vals).forEach(([k, v]) => v && fd.append(k, v));
    try { await dispatch(addDistributor(fd)).unwrap(); setModal(false); toast.success('Distributor added'); }
    catch (e) { toast.error(e?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const filtered = list.filter(d => !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.city?.toLowerCase().includes(search.toLowerCase()));

  const stateOpts    = [{ value: '', label: 'Select state' },    ...states.map(s => ({ value: s, label: s }))];
  const districtOpts = [{ value: '', label: 'Select district' }, ...districts.map(d => ({ value: d, label: d }))];

  const canManage = ['Admin', 'Radnus', 'MarketingManager'].includes(role);

  const columns = [
    { key: 'name', label: 'Company', render: (_, d) => (
      <div className="avatar-row">
        <Avatar name={d.name} size="sm" />
        <div className="avatar-row-info">
          <span className="avatar-row-name">{d.name}</span>
          <span className="avatar-row-sub">{d.contactPerson || d.contact || ''}</span>
        </div>
      </div>
    )},
    { key: 'phone', label: 'Phone', render: v => v || '—' },
    { key: 'city',  label: 'City',  render: v => v || '—' },
    { key: 'state', label: 'Territory', render: (_, d) => <Badge variant="info">{d.state || d.territory || '—'}</Badge> },
    { key: 'status', label: 'Status', render: v => statusBadge(v) },
    { key: '_id', label: 'Actions', render: (_, d) => (
      <div className="td-actions">
        <Button variant="outline" size="xs" onClick={() => setView(d)}>View</Button>
        {canManage && <Button variant="secondary" size="xs" onClick={() => setDeleteId(d._id)}>Remove</Button>}
      </div>
    )},
  ];

  return (
    <div>
      <SectionHeader title="Distributor Network" count={list.length} action={canManage && <Button variant="primary" size="sm" onClick={() => { setVals({ name:'',contactPerson:'',phone:'',email:'',state:'',district:'',city:'',password:'' }); setModal(true); }}>+ Add Distributor</Button>} />
      <DataTable columns={columns} data={filtered} loading={loading} searchValue={search} onSearch={setSearch} searchPlaceholder="Search by name, city…" emptyIcon={<Truck size={36}/>} emptyText="No distributors found" />

      <Modal open={modal} onClose={() => setModal(false)} title="Add Distributor" size="lg"
        footer={<><Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button><Button variant="primary" loading={saving} onClick={handleSave}>Add Distributor</Button></>}
      >
        <div className="form-row">
          <Input label="Company Name"   placeholder="Company"    value={vals.name}          onChange={e => set('name', e.target.value)}          error={errs.name} />
          <Input label="Contact Person" placeholder="Name"       value={vals.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
        </div>
        <div className="form-row">
          <Input label="Phone" type="tel"   placeholder="Mobile"   value={vals.phone} onChange={e => set('phone', e.target.value)} error={errs.phone} />
          <Input label="Email" type="email" placeholder="Email"    value={vals.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div className="form-row">
          <Select label="State"    options={stateOpts}    value={vals.state}    onChange={e => set('state',    e.target.value)} />
          <Select label="District" options={districtOpts} value={vals.district} onChange={e => set('district', e.target.value)} />
        </div>
        <div className="form-row">
          <Input label="City"     placeholder="City"             value={vals.city}     onChange={e => set('city', e.target.value)} />
          <Input label="Password" type="password" placeholder="Min 6 chars" value={vals.password} onChange={e => set('password', e.target.value)} error={errs.password} />
        </div>
      </Modal>

      <Modal open={!!view} onClose={() => setView(null)} title={view?.name || 'Distributor'} footer={<Button variant="primary" onClick={() => setView(null)}>Close</Button>}>
        {view && (
          <>
            <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:16 }}>
              <Avatar name={view.name} size="lg" />
              <div><div style={{ fontWeight:700, fontSize:16 }}>{view.name}</div><div style={{ color:'var(--text-muted)', fontSize:13 }}>{view.contactPerson || view.contact}</div>{statusBadge(view.status)}</div>
            </div>
            <div className="divider" />
            <div className="form-row">
              <div><div className="field-label" style={{ marginBottom:4 }}>Phone</div>{view.phone || '—'}</div>
              <div><div className="field-label" style={{ marginBottom:4 }}>Email</div>{view.email || '—'}</div>
            </div>
            <div className="form-row" style={{ marginTop:14 }}>
              <div><div className="field-label" style={{ marginBottom:4 }}>City</div>{view.city || '—'}</div>
              <div><div className="field-label" style={{ marginBottom:4 }}>Territory</div>{view.state || '—'}</div>
            </div>
          </>
        )}
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { await dispatch(deleteDistributor(deleteId)).unwrap(); toast.success('Removed'); }} title="Remove Distributor" message="Remove this distributor from the network?" confirmLabel="Remove" />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════════
   TERRITORY PAGE
════════════════════════════════════════════════════════════════════════════════ */
export const TerritoryPage = () => {
  const dispatch = useDispatch();
  const { role } = useSelector(selectAuthState);
  // data mirrors mobile: { "StateName": { "DistrictName": [{_id,taluk,beats,assignedTo,active}] } }
  const { data, loading } = useSelector(s => s.territory);

  const [expandedState,    setExpandedState]    = useState(null);
  const [expandedDistrict, setExpandedDistrict] = useState(null);

  // Add territory modal
  const [addModal,  setAddModal]  = useState(false);
  const [addVals,   setAddVals]   = useState({ state: '', district: '', taluk: '' });
  const [addSaving, setAddSaving] = useState(false);

  // Edit taluk modal
  const [editModal,   setEditModal]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null); // { ...item, state, district }
  const [editVals,    setEditVals]    = useState({ taluk: '', beats: '' });
  const [editSaving,  setEditSaving]  = useState(false);

  // Assign modal
  const [assignModal,  setAssignModal]  = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignName,   setAssignName]   = useState('');
  const [assignSaving, setAssignSaving] = useState(false);

  // Add beat modal
  const [beatModal,  setBeatModal]  = useState(false);
  const [beatTarget, setBeatTarget] = useState(null);
  const [beatName,   setBeatName]   = useState('');
  const [beatSaving, setBeatSaving] = useState(false);

  // Delete confirm
  const [deleteModal, setDeleteModal]   = useState(false);
  const [deleteType,  setDeleteType]    = useState(null);
  const [deleteItem,  setDeleteItem]    = useState(null);

  useEffect(() => { dispatch(fetchTerritory()); }, [dispatch]);

  const canManage = ['Admin', 'Radnus'].includes(role);

  const toggleState    = (s) => { setExpandedState(expandedState === s ? null : s); setExpandedDistrict(null); };
  const toggleDistrict = (d) => { setExpandedDistrict(expandedDistrict === d ? null : d); };

  // ── Delete handlers ────────────────────────────────────────────────────────
  const handleDeleteClick = (type, payload) => {
    setDeleteType(type);
    setDeleteItem(payload);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteType === 'state')    await dispatch(deleteState(deleteItem)).unwrap();
      if (deleteType === 'district') await dispatch(deleteDistrict(deleteItem)).unwrap();
      if (deleteType === 'taluk')    await dispatch(deleteTaluk(deleteItem)).unwrap();
      toast.success('Deleted successfully');
    } catch { toast.error('Delete failed'); }
    setDeleteModal(false);
  };

  const getDeleteMessage = () => {
    if (deleteType === 'state')    return 'Delete this state and all its data?';
    if (deleteType === 'district') return 'Delete this district and all its taluks?';
    if (deleteType === 'taluk')    return 'Delete this taluk?';
    return 'Are you sure you want to delete?';
  };

  // ── Add territory ──────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!addVals.state || !addVals.district || !addVals.taluk) {
      toast.error('All fields are required'); return;
    }
    setAddSaving(true);
    try {
      await dispatch(addTerritory({ state: addVals.state, district: addVals.district, taluk: addVals.taluk })).unwrap();
      setAddModal(false);
      setAddVals({ state: '', district: '', taluk: '' });
      toast.success('Territory added');
    } catch { toast.error('Failed to add'); }
    finally { setAddSaving(false); }
  };

  // ── Edit taluk ─────────────────────────────────────────────────────────────
  const openEdit = (item, stateName, districtName) => {
    setEditTarget({ ...item, state: stateName, district: districtName });
    setEditVals({ taluk: item.taluk || '', beats: (item.beats || []).join(', ') });
    setEditModal(true);
  };

  const handleEdit = async () => {
    setEditSaving(true);
    try {
      const beats = editVals.beats.split(',').map(b => b.trim()).filter(Boolean);
      await dispatch(updateTerritory({ id: editTarget._id, data: { taluk: editVals.taluk, beats, state: editTarget.state, district: editTarget.district } })).unwrap();
      setEditModal(false);
      toast.success('Updated');
    } catch { toast.error('Update failed'); }
    finally { setEditSaving(false); }
  };

  // ── Assign FSE ─────────────────────────────────────────────────────────────
  const openAssign = (item, stateName, districtName) => {
    setAssignTarget({ ...item, state: stateName, district: districtName });
    setAssignName(item.assignedTo || '');
    setAssignModal(true);
  };

  const handleAssign = async () => {
    setAssignSaving(true);
    try {
      await dispatch(assignTaluk({ id: assignTarget._id, assignedTo: assignName })).unwrap();
      setAssignModal(false);
      toast.success('Assigned successfully');
    } catch { toast.error('Assign failed'); }
    finally { setAssignSaving(false); }
  };

  // ── Add Beat ───────────────────────────────────────────────────────────────
  const openAddBeat = (item) => {
    setBeatTarget(item);
    setBeatName('');
    setBeatModal(true);
  };

  const handleAddBeat = async () => {
    if (!beatName.trim()) { toast.error('Beat name required'); return; }
    setBeatSaving(true);
    try {
      await dispatch(addBeat({ id: beatTarget._id, beat: beatName.trim() })).unwrap();
      setBeatModal(false);
      toast.success('Beat added');
    } catch { toast.error('Failed to add beat'); }
    finally { setBeatSaving(false); }
  };

  const stateNames = Object.keys(data || {});

  return (
    <div>
      <SectionHeader
        title="Territory Mapping"
        action={canManage && <Button variant="primary" size="sm" onClick={() => setAddModal(true)}>+ Add Territory</Button>}
      />
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
        Manage state, district, taluk, and beat assignments
      </p>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size="lg" /></div>
      ) : stateNames.length === 0 ? (
        <EmptyState icon={<Map size={40}/>} title="No territories configured"
          subtitle="Add states, districts and taluks"
          action={canManage && <Button variant="primary" size="sm" onClick={() => setAddModal(true)}>+ Add Territory</Button>}
        />
      ) : (
        stateNames.map(stateName => (
          <div key={stateName} className="terr-state-card">
            {/* ── State Row ── */}
            <div className="terr-state-row">
              <button className="terr-expand-btn" onClick={() => toggleState(stateName)}>
                {expandedState === stateName ? <ChevronDown size={20} color="var(--red)"/> : <ChevronRight size={20} color="var(--red)"/>}
                <span className="terr-state-name">{stateName}</span>
              </button>
              {canManage && (
                <button className="terr-delete-btn" onClick={() => handleDeleteClick('state', stateName)} title="Delete state">
                  <Trash2 size={18}/>
                </button>
              )}
            </div>

            {/* ── Districts ── */}
            {expandedState === stateName && (
              <div className="terr-districts-wrap">
                {Object.keys(data[stateName] || {}).map(districtName => (
                  <div key={districtName} className="terr-district-block">
                    <div className="terr-district-row">
                      <button className="terr-expand-btn" onClick={() => toggleDistrict(districtName)}>
                        {expandedDistrict === districtName ? <ChevronDown size={18} color="var(--red)"/> : <ChevronRight size={18} color="var(--red)"/>}
                        <span className="terr-district-name">{districtName}</span>
                      </button>
                      {canManage && (
                        <button className="terr-delete-btn" onClick={() => handleDeleteClick('district', { state: stateName, district: districtName })} title="Delete district">
                          <Trash2 size={16}/>
                        </button>
                      )}
                    </div>

                    {/* ── Taluks ── */}
                    {expandedDistrict === districtName && (
                      <div className="terr-taluks-wrap">
                        {(data[stateName][districtName] || []).map((item, idx) => (
                          <div key={item._id || idx} className="terr-taluk-card">
                            {/* Taluk header */}
                            <div className="terr-taluk-header">
                              <span className="terr-taluk-name">{item.taluk || 'N/A'}</span>
                              {canManage && (
                                <div className="terr-taluk-actions">
                                  <button className="terr-icon-btn" onClick={() => openEdit(item, stateName, districtName)} title="Edit"><SquarePen size={18}/></button>
                                  <button className="terr-icon-btn terr-icon-delete" onClick={() => handleDeleteClick('taluk', item._id)} title="Delete"><Trash2 size={18}/></button>
                                </div>
                              )}
                            </div>

                            {/* Assigned person */}
                            {item.assignedTo ? (
                              <div className="terr-assigned">
                                <UserCheck size={13}/> Assigned: <strong>{item.assignedTo}</strong>
                              </div>
                            ) : (
                              <div className="terr-unassigned">Unassigned</div>
                            )}

                            {/* Beats */}
                            <div className="terr-beats-row">
                              {item.beats && item.beats.length > 0 ? (
                                item.beats.map((beat, bi) => (
                                  <span key={bi} className="terr-beat-chip">{beat}</span>
                                ))
                              ) : (
                                <span className="terr-no-beats">No Beats</span>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="terr-btn-row">
                              <Button variant="primary" size="sm" onClick={() => openAssign(item, stateName, districtName)}>Assign</Button>
                              <Button variant="secondary" size="sm" onClick={() => openAddBeat(item)}>Add Beat</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* ── Add Territory Modal ── */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Territory"
        footer={<><Button variant="ghost" onClick={() => setAddModal(false)}>Cancel</Button><Button variant="primary" loading={addSaving} onClick={handleAdd}>Add Territory</Button></>}
      >
        <Input label="State" placeholder="e.g. Tamil Nadu"   value={addVals.state}    onChange={e => setAddVals(p => ({...p, state:    e.target.value}))} />
        <Input label="District" placeholder="e.g. Chennai"   value={addVals.district} onChange={e => setAddVals(p => ({...p, district: e.target.value}))} />
        <Input label="Taluk" placeholder="e.g. Ambattur"     value={addVals.taluk}    onChange={e => setAddVals(p => ({...p, taluk:    e.target.value}))} />
      </Modal>

      {/* ── Edit Taluk Modal ── */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Taluk"
        footer={<><Button variant="ghost" onClick={() => setEditModal(false)}>Cancel</Button><Button variant="primary" loading={editSaving} onClick={handleEdit}>Save Changes</Button></>}
      >
        <Input label="Taluk Name" value={editVals.taluk} onChange={e => setEditVals(p => ({...p, taluk: e.target.value}))} />
        <Input label="Beats (comma-separated)" placeholder="Beat 1, Beat 2" value={editVals.beats} onChange={e => setEditVals(p => ({...p, beats: e.target.value}))} hint="Enter beat names separated by commas" />
      </Modal>

      {/* ── Assign Modal ── */}
      <Modal open={assignModal} onClose={() => setAssignModal(false)} title={`Assign — ${assignTarget?.taluk || ''}`}
        footer={<><Button variant="ghost" onClick={() => setAssignModal(false)}>Cancel</Button><Button variant="primary" loading={assignSaving} onClick={handleAssign}>Assign</Button></>}
      >
        <Input label="Assigned Person Name / ID" placeholder="Enter FSE name or ID" value={assignName} onChange={e => setAssignName(e.target.value)} autoFocus />
      </Modal>

      {/* ── Add Beat Modal ── */}
      <Modal open={beatModal} onClose={() => setBeatModal(false)} title={`Add Beat — ${beatTarget?.taluk || ''}`}
        footer={<><Button variant="ghost" onClick={() => setBeatModal(false)}>Cancel</Button><Button variant="primary" loading={beatSaving} onClick={handleAddBeat}>Add Beat</Button></>}
      >
        <Input label="Beat Name" placeholder="e.g. Market Area" value={beatName} onChange={e => setBeatName(e.target.value)} autoFocus />
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <ConfirmDialog open={deleteModal} onClose={() => setDeleteModal(false)} onConfirm={confirmDelete}
        title="Delete Territory" message={getDeleteMessage()} confirmLabel="Delete" variant="danger"
      />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════════
   MANAGERS PAGE
════════════════════════════════════════════════════════════════════════════════ */
export const ManagersPage = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(s => s.manager);
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [vals, setVals] = useState({ name:'', phone:'', email:'', territory:'', password:'' });
  const [errs, setErrs] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { dispatch(getManagers()); }, [dispatch]);

  const set = (k, v) => { setVals(p => ({ ...p, [k]: v })); setErrs(p => ({ ...p, [k]: '' })); };

  const handleSave = async () => {
    const e = {};
    if (!vals.name) e.name = 'Name required';
    if (!vals.phone) e.phone = 'Phone required';
    if (!vals.password || vals.password.length < 6) e.password = 'Min 6 chars';
    if (Object.keys(e).length) { setErrs(e); return; }
    setSaving(true);
    const fd = new FormData();
    Object.entries(vals).forEach(([k, v]) => v && fd.append(k, v));
    try { await dispatch(addManager(fd)).unwrap(); setModal(false); toast.success('Manager added'); }
    catch (e) { toast.error(e?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const filtered = list.filter(m => !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.territory?.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'name', label: 'Manager', render: (_, m) => (
      <div className="avatar-row"><Avatar name={m.name} size="sm" /><div className="avatar-row-info"><span className="avatar-row-name">{m.name}</span><span className="avatar-row-sub">{m.email}</span></div></div>
    )},
    { key: 'phone',     label: 'Phone',     render: v => v || '—' },
    { key: 'territory', label: 'Territory', render: v => v ? <Badge variant="info">{v}</Badge> : '—' },
    { key: 'status',    label: 'Status',    render: v => statusBadge(v || 'Active') },
    { key: '_id', label: 'Actions', render: (_, m) => (
      <div className="td-actions">
        <Button variant="secondary" size="xs" onClick={() => setDeleteId(m._id)}>Remove</Button>
      </div>
    )},
  ];

  return (
    <div>
      <SectionHeader title="Marketing Managers" count={list.length} action={<Button variant="primary" size="sm" onClick={() => { setVals({ name:'',phone:'',email:'',territory:'',password:'' }); setModal(true); }}>+ Add Manager</Button>} />
      <DataTable columns={columns} data={filtered} loading={loading} searchValue={search} onSearch={setSearch} searchPlaceholder="Search managers…" emptyIcon={<UserCog size={36}/>} emptyText="No managers added" />

      <Modal open={modal} onClose={() => setModal(false)} title="Add Marketing Manager"
        footer={<><Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button><Button variant="primary" loading={saving} onClick={handleSave}>Add Manager</Button></>}
      >
        <div className="form-row">
          <Input label="Full Name"  placeholder="Manager name" value={vals.name}  onChange={e => set('name',  e.target.value)} error={errs.name} />
          <Input label="Phone"      type="tel" placeholder="Phone" value={vals.phone} onChange={e => set('phone', e.target.value)} error={errs.phone} />
        </div>
        <Input label="Email" type="email" placeholder="Email" value={vals.email} onChange={e => set('email', e.target.value)} />
        <Input label="Territory"   placeholder="e.g. Tamil Nadu"  value={vals.territory} onChange={e => set('territory', e.target.value)} />
        <Input label="Set Password" type="password" placeholder="Min 6 chars" value={vals.password} onChange={e => set('password', e.target.value)} error={errs.password} />
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { await dispatch(deleteManager(deleteId)).unwrap(); toast.success('Removed'); }} title="Remove Manager" message="Remove this manager from the system?" confirmLabel="Remove" />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════════
   EXECUTIVES PAGE
════════════════════════════════════════════════════════════════════════════════ */
export const ExecutivesPage = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(s => s.executive);
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [vals, setVals] = useState({ name:'', phone:'', email:'', territory:'', password:'' });
  const [saving, setSaving] = useState(false);
  const [errs, setErrs] = useState({});

  useEffect(() => { dispatch(getExecutives()); }, [dispatch]);

  const set = (k, v) => { setVals(p => ({ ...p, [k]: v })); setErrs(p => ({ ...p, [k]: '' })); };

  const handleSave = async () => {
    const e = {};
    if (!vals.name) e.name = 'Name required';
    if (!vals.phone) e.phone = 'Phone required';
    if (!vals.password || vals.password.length < 6) e.password = 'Min 6 chars';
    if (Object.keys(e).length) { setErrs(e); return; }
    setSaving(true);
    const fd = new FormData();
    Object.entries(vals).forEach(([k, v]) => v && fd.append(k, v));
    try { await dispatch(addExecutive(fd)).unwrap(); setModal(false); toast.success('Executive added'); }
    catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const filtered = list.filter(e => !search || e.name?.toLowerCase().includes(search.toLowerCase()));
  const columns = [
    { key: 'name', label: 'Executive', render: (_, e) => (
      <div className="avatar-row"><Avatar name={e.name} size="sm"/><div className="avatar-row-info"><span className="avatar-row-name">{e.name}</span><span className="avatar-row-sub">{e.email}</span></div></div>
    )},
    { key: 'phone',     label: 'Phone',     render: v => v || '—' },
    { key: 'territory', label: 'Territory', render: v => v ? <Badge variant="info">{v}</Badge> : '—' },
    { key: 'status',    label: 'Status',    render: v => statusBadge(v || 'Active') },
    { key: '_id', label: 'Actions', render: (_, e) => (
      <div className="td-actions"><Button variant="secondary" size="xs" onClick={() => setDeleteId(e._id)}>Remove</Button></div>
    )},
  ];

  return (
    <div>
      <SectionHeader title="Marketing Executives" count={list.length} action={<Button variant="primary" size="sm" onClick={() => { setVals({ name:'',phone:'',email:'',territory:'',password:'' }); setModal(true); }}>+ Add Executive</Button>} />
      <DataTable columns={columns} data={filtered} loading={loading} searchValue={search} onSearch={setSearch} emptyIcon={<Users size={36}/>} emptyText="No executives added" />

      <Modal open={modal} onClose={() => setModal(false)} title="Add Marketing Executive"
        footer={<><Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button><Button variant="primary" loading={saving} onClick={handleSave}>Add Executive</Button></>}
      >
        <div className="form-row">
          <Input label="Full Name" placeholder="Executive name" value={vals.name}  onChange={e => set('name',  e.target.value)} error={errs.name} />
          <Input label="Phone"     type="tel" placeholder="Phone"  value={vals.phone} onChange={e => set('phone', e.target.value)} error={errs.phone} />
        </div>
        <Input label="Email" type="email" placeholder="Email" value={vals.email} onChange={e => set('email', e.target.value)} />
        <Input label="Territory" placeholder="e.g. Tamil Nadu" value={vals.territory} onChange={e => set('territory', e.target.value)} />
        <Input label="Password" type="password" placeholder="Min 6 chars" value={vals.password} onChange={e => set('password', e.target.value)} error={errs.password} />
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { await dispatch(deleteExecutive(deleteId)).unwrap(); toast.success('Removed'); }} title="Remove Executive" message="Remove this executive?" confirmLabel="Remove" />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════════
   FSE PAGE
════════════════════════════════════════════════════════════════════════════════ */
export const FSEPage = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(s => s.fse);
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(false);
  const [vals, setVals]     = useState({ name:'', phone:'', email:'', territory:'', password:'' });
  const [errs, setErrs]     = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { dispatch(fetchFSE()); }, [dispatch]);

  const set = (k, v) => { setVals(p => ({ ...p, [k]: v })); setErrs(p => ({ ...p, [k]: '' })); };

  const handleSave = async () => {
    const e = {};
    if (!vals.name) e.name = 'Name required';
    if (!vals.phone) e.phone = 'Phone required';
    if (!vals.password || vals.password.length < 6) e.password = 'Min 6 chars';
    if (Object.keys(e).length) { setErrs(e); return; }
    setSaving(true);
    const fd = new FormData();
    Object.entries(vals).forEach(([k, v]) => v && fd.append(k, v));
    try { await dispatch(addFSE(fd)).unwrap(); setModal(false); toast.success('FSE added'); }
    catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const filtered = list.filter(f => !search || f.name?.toLowerCase().includes(search.toLowerCase()) || f.territory?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <SectionHeader title="Field Sales Executives" count={list.length} action={<Button variant="primary" size="sm" onClick={() => { setVals({ name:'',phone:'',email:'',territory:'',password:'' }); setModal(true); }}>+ Add FSE</Button>} />

      {loading ? <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size="lg"/></div>
        : filtered.length === 0 ? <EmptyState icon={<Users size={40}/>} title="No FSEs found" />
        : (
          <div className="fse-grid">
            {filtered.map(f => (
              <div key={f._id} className="fse-card">
                <div className="fse-card-head">
                  <Avatar name={f.name} size="md" />
                  <div className="fse-info">
                    <div className="fse-name">{f.name}</div>
                    <div className="fse-territory">{f.territory || '—'}</div>
                  </div>
                  <div className="fse-status-dot" style={{ background: f.isOnline ? 'var(--success)' : 'var(--text-muted)', boxShadow: f.isOnline ? '0 0 8px var(--success)' : 'none' }} />
                </div>
                <div className="fse-card-footer">
                  <div className="fse-stat"><span className="fse-stat-lbl">Phone</span><span>{f.phone || '—'}</span></div>
                  <div className="fse-stat"><span className="fse-stat-lbl">Status</span><span style={{ color: f.isOnline ? 'var(--success)' : 'var(--text-muted)' }}>{f.isOnline ? 'Online' : 'Offline'}</span></div>
                  <div className="fse-stat"><span className="fse-stat-lbl">Today</span><span>0 visits</span></div>
                </div>
              </div>
            ))}
          </div>
        )
      }

      <Modal open={modal} onClose={() => setModal(false)} title="Add Field Sales Executive"
        footer={<><Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button><Button variant="primary" loading={saving} onClick={handleSave}>Add FSE</Button></>}
      >
        <div className="form-row">
          <Input label="Full Name" placeholder="FSE name" value={vals.name}  onChange={e => set('name',  e.target.value)} error={errs.name} />
          <Input label="Phone" type="tel" placeholder="Phone" value={vals.phone} onChange={e => set('phone', e.target.value)} error={errs.phone} />
        </div>
        <Input label="Email" type="email" placeholder="Email" value={vals.email} onChange={e => set('email', e.target.value)} />
        <Input label="Territory" placeholder="e.g. Chennai North" value={vals.territory} onChange={e => set('territory', e.target.value)} />
        <Input label="Password" type="password" placeholder="Min 6 chars" value={vals.password} onChange={e => set('password', e.target.value)} error={errs.password} />
      </Modal>
    </div>
  );
};