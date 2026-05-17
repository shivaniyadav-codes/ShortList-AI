import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, X, ArrowRight } from 'lucide-react';

const CandidateForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    experience: '',
    bio: ''
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (newSkill && !skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (skills.length === 0) {
      alert("Please add at least one skill.");
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          skills: skills,
          experience: Number(formData.experience)
        })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      console.error("Error adding candidate", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 40px', maxWidth: '420px', width: '100%' }}>
          <CheckCircle size={48} color="#fff" strokeWidth={1.5} style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Added successfully</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Redirecting to candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      <div className="page-header">
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>New Entry</p>
        <h1 className="page-title">Add Candidate</h1>
        <p className="page-subtitle">Register a new candidate profile for future job matching.</p>
      </div>

      <form className="glass-panel" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" name="name" className="form-input" required onChange={handleChange} placeholder="Rahul Sharma" />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" name="email" className="form-input" required onChange={handleChange} placeholder="rahul@example.com" />
        </div>

        <div className="form-group">
          <label className="form-label">Skills</label>
          <div className="tag-input-container">
            {skills.map((skill, index) => (
              <span key={index} className="tag-item">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)}>
                  <X size={13} />
                </button>
              </span>
            ))}
            <input 
              type="text" 
              className="tag-input" 
              placeholder={skills.length === 0 ? "Type skill, press Enter ↵" : "Add more..."}
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Experience (years)</label>
          <input type="number" name="experience" className="form-input" required min="0" step="0.5" onChange={handleChange} placeholder="2.5" />
        </div>

        <div className="form-group">
          <label className="form-label">Bio / Projects</label>
          <textarea name="bio" className="form-input" rows="3" onChange={handleChange} placeholder="Brief description or project links..."></textarea>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '4px' }} disabled={loading}>
          {loading ? 'Saving...' : 'Add Candidate'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>
    </div>
  );
};

export default CandidateForm;
