import { useState, useEffect } from 'react';
import { Search, Briefcase, Mail, Pencil, Trash2, X, Check } from 'lucide-react';
import { api } from '../api';

const CandidateList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState(null); // candidate being edited
  const [editForm, setEditForm] = useState({ name: '', email: '', experience: '', bio: '' });
  const [editSkills, setEditSkills] = useState([]);
  const [editSkillInput, setEditSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch(api('/api/candidates'));
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      }
    } catch (error) {
      console.error("Error fetching candidates", error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (candidate) => {
    setEditing(candidate._id);
    setEditForm({
      name: candidate.name,
      email: candidate.email,
      experience: candidate.experience,
      bio: candidate.bio || ''
    });
    setEditSkills([...candidate.skills]);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditForm({ name: '', email: '', experience: '', bio: '' });
    setEditSkills([]);
    setEditSkillInput('');
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = editSkillInput.trim();
      if (val && !editSkills.includes(val)) setEditSkills([...editSkills, val]);
      setEditSkillInput('');
    }
  };

  const removeEditSkill = (s) => setEditSkills(editSkills.filter(x => x !== s));

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      const response = await fetch(api(`/api/candidates/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          skills: editSkills,
          experience: Number(editForm.experience)
        })
      });
      if (response.ok) {
        const updated = await response.json();
        setCandidates(prev => prev.map(c => c._id === id ? updated : c));
        cancelEdit();
      }
    } catch (error) {
      console.error("Error updating candidate", error);
    } finally {
      setSaving(false);
    }
  };

  const deleteCandidate = async (id) => {
    if (!confirm("Delete this candidate?")) return;
    try {
      const response = await fetch(api(`/api/candidates/${id}`), { method: 'DELETE' });
      if (response.ok) {
        setCandidates(prev => prev.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error("Error deleting candidate", error);
    }
  };

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Database</p>
        <h1 className="page-title">Talent Pool</h1>
        <p className="page-subtitle">Browse, search, and manage candidate profiles.</p>
      </div>

      <div style={{ marginBottom: '32px', position: 'relative' }}>
        <Search style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-dim)' }} size={18} />
        <input 
          type="text" className="form-input" placeholder="Search by name or skill..." 
          style={{ paddingLeft: '44px', background: 'var(--surface)', border: '1px solid var(--border)' }}
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loader"></div>
      ) : filteredCandidates.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          {candidates.length === 0 ? 'No candidates yet. Add one to get started.' : 'No candidates match your search.'}
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginBottom: '16px', fontWeight: 500 }}>
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2">
            {filteredCandidates.map((candidate) => {
              const isEditing = editing === candidate._id;

              return (
                <div key={candidate._id} className="glass-panel candidate-card" style={{ position: 'relative' }}>
                  
                  {/* Action Buttons */}
                  {!isEditing && (
                    <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => startEdit(candidate)} 
                        style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s', display: 'flex' }}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => deleteCandidate(candidate._id)} 
                        style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px', cursor: 'pointer', color: 'var(--text-dim)', transition: 'all 0.2s', display: 'flex' }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}

                  {isEditing ? (
                    /* ─── Edit Mode ─── */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Editing</p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={cancelEdit} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                            <X size={14} /> Cancel
                          </button>
                          <button onClick={() => saveEdit(candidate._id)} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} disabled={saving}>
                            <Check size={14} /> {saving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <label className="form-label">Name</label>
                        <input type="text" name="name" className="form-input" value={editForm.name} onChange={handleEditChange} />
                      </div>

                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <label className="form-label">Email</label>
                        <input type="email" name="email" className="form-input" value={editForm.email} onChange={handleEditChange} />
                      </div>

                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <label className="form-label">Skills</label>
                        <div className="tag-input-container">
                          {editSkills.map((skill, i) => (
                            <span key={i} className="tag-item">
                              {skill}
                              <button type="button" onClick={() => removeEditSkill(skill)}><X size={13} /></button>
                            </span>
                          ))}
                          <input 
                            type="text" className="tag-input" placeholder="Add skill..."
                            value={editSkillInput} onChange={(e) => setEditSkillInput(e.target.value)} onKeyDown={handleEditSkillKeyDown}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <label className="form-label">Experience (years)</label>
                        <input type="number" name="experience" className="form-input" min="0" step="0.5" value={editForm.experience} onChange={handleEditChange} />
                      </div>

                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <label className="form-label">Bio</label>
                        <textarea name="bio" className="form-input" rows="2" value={editForm.bio} onChange={handleEditChange}></textarea>
                      </div>
                    </div>
                  ) : (
                    /* ─── View Mode ─── */
                    <>
                      <div className="candidate-header" style={{ paddingRight: '70px' }}>
                        <div>
                          <h3 className="candidate-name">{candidate.name}</h3>
                          <div className="candidate-email">
                            <Mail size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                            {candidate.email}
                          </div>
                        </div>
                        <div style={{ 
                          padding: '6px 14px', background: 'var(--surface-raised)', border: '1px solid var(--border)', 
                          borderRadius: '100px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)',
                          display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0
                        }}>
                          <Briefcase size={13} /> {candidate.experience} yrs
                        </div>
                      </div>
                      
                      <div className="skills-container">
                        {candidate.skills.map((skill, idx) => (
                          <span key={idx} className="tag">{skill}</span>
                        ))}
                      </div>
                      
                      {candidate.bio && (
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', lineHeight: '1.5', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                          {candidate.bio}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default CandidateList;
