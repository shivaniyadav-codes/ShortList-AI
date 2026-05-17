import { useState } from 'react';
import ShortlistedDisplay from './ShortlistedDisplay';
import { Sparkles, BarChart2, X, ArrowRight } from 'lucide-react';
import { api } from '../api';

const JobRequirementForm = () => {
  const [formData, setFormData] = useState({
    minExperience: ''
  });
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [preferredSkills, setPreferredSkills] = useState([]);
  const [reqInput, setReqInput] = useState('');
  const [prefInput, setPrefInput] = useState('');
  
  const [shortlisted, setShortlisted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [showGraph, setShowGraph] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Required skills handlers
  const handleReqKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = reqInput.trim();
      if (val && !requiredSkills.includes(val)) setRequiredSkills([...requiredSkills, val]);
      setReqInput('');
    }
  };
  const removeReqSkill = (s) => setRequiredSkills(requiredSkills.filter(x => x !== s));

  // Preferred skills handlers
  const handlePrefKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = prefInput.trim();
      if (val && !preferredSkills.includes(val)) setPreferredSkills([...preferredSkills, val]);
      setPrefInput('');
    }
  };
  const removePrefSkill = (s) => setPreferredSkills(preferredSkills.filter(x => x !== s));

  const handleBasicMatch = async (e) => {
    e.preventDefault();
    if (requiredSkills.length === 0) {
      alert("Please add at least one required skill.");
      return;
    }

    setLoading(true);
    setAiData(null);
    setShowGraph(false);

    try {
      const response = await fetch(api('/api/match'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requiredSkills,
          minExperience: Number(formData.minExperience),
          preferredSkills
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShortlisted(data);
      }
    } catch (error) {
      console.error("Error matching", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIAssessment = async () => {
    if (!shortlisted || shortlisted.length === 0) return;
    
    setAiLoading(true);

    try {
      const response = await fetch(api('/api/ai/shortlist'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requiredSkills,
          minExperience: Number(formData.minExperience),
          preferredSkills,
          candidates: shortlisted.slice(0, 5)
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMap = {};
        data.forEach(item => {
          aiMap[item.candidateName] = item;
        });
        setAiData(aiMap);

        // Recalculate final scores with AI score included
        setShortlisted(prev => {
          const updated = prev.map(c => {
            const ai = aiMap[c.name];
            if (ai && ai.aiScore !== undefined) {
              const finalScore = (0.5 * c.skillScore) + (0.2 * c.experienceScore) + (0.1 * c.preferredScore) + (0.2 * ai.aiScore);
              return { ...c, aiScore: ai.aiScore, matchScore: Math.round(finalScore * 10) / 10 };
            }
            return c;
          });
          return updated.sort((a, b) => b.matchScore - a.matchScore);
        });
      }
    } catch (error) {
      console.error("Error fetching AI assessment", error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Matching Engine</p>
        <h1 className="page-title">Match Candidates</h1>
        <p className="page-subtitle">Define job requirements to find the best-fit talent.</p>
      </div>

      {/* Formula Reference */}
      <div style={{ 
        marginBottom: '28px', 
        padding: '16px 20px', 
        background: 'var(--surface)', 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-body)'
      }}>
        <span style={{ fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>Scoring Formula</span>
        <p style={{ marginTop: '6px' }}>
          Final Score = <span style={{ color: 'var(--text)' }}>(0.5 × Skill)</span> + (0.2 × Experience) + (0.1 × Preferred) + <span style={{ color: 'var(--text)' }}>(0.2 × AI)</span>
        </p>
      </div>

      <div className="grid grid-cols-3">
        <div>
          <form className="glass-panel" onSubmit={handleBasicMatch}>
            {/* Required Skills */}
            <div className="form-group">
              <label className="form-label">Required Skills</label>
              <div className="tag-input-container">
                {requiredSkills.map((skill, i) => (
                  <span key={i} className="tag-item">
                    {skill}
                    <button type="button" onClick={() => removeReqSkill(skill)}><X size={13} /></button>
                  </span>
                ))}
                <input 
                  type="text" className="tag-input" 
                  placeholder={requiredSkills.length === 0 ? "Type skill, press Enter ↵" : "Add more..."}
                  value={reqInput} onChange={(e) => setReqInput(e.target.value)} onKeyDown={handleReqKeyDown}
                />
              </div>
            </div>

            {/* Preferred Skills */}
            <div className="form-group">
              <label className="form-label">Preferred Skills (optional)</label>
              <div className="tag-input-container">
                {preferredSkills.map((skill, i) => (
                  <span key={i} className="tag-item" style={{ borderColor: 'var(--border)' }}>
                    {skill}
                    <button type="button" onClick={() => removePrefSkill(skill)}><X size={13} /></button>
                  </span>
                ))}
                <input 
                  type="text" className="tag-input" 
                  placeholder={preferredSkills.length === 0 ? "Nice-to-have skills..." : "Add more..."}
                  value={prefInput} onChange={(e) => setPrefInput(e.target.value)} onKeyDown={handlePrefKeyDown}
                />
              </div>
            </div>
            
            {/* Min Experience */}
            <div className="form-group">
              <label className="form-label">Min Experience (years)</label>
              <input type="number" name="minExperience" className="form-input" required min="0" step="0.5" onChange={handleChange} placeholder="2" />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Matching...' : 'Run Match'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {shortlisted && shortlisted.length > 0 && (
            <div className="glass-panel" style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Actions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  className="btn btn-outline" 
                  onClick={handleAIAssessment} 
                  disabled={aiLoading}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <Sparkles size={15} />
                  {aiLoading ? 'Analyzing...' : 'Run AI Scoring (+20%)'}
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setShowGraph(!showGraph)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <BarChart2 size={15} />
                  {showGraph ? 'Hide Graph' : 'Score Graph'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          {loading && <div className="loader"></div>}
          {!loading && shortlisted && (
            <ShortlistedDisplay 
              candidates={shortlisted} 
              aiData={aiData} 
              requiredSkills={requiredSkills}
              preferredSkills={preferredSkills}
              showGraph={showGraph}
            />
          )}
          {!loading && !shortlisted && (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--text-dim)' }}>
              <p style={{ fontSize: '0.95rem' }}>Define requirements and run a match to see results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobRequirementForm;
