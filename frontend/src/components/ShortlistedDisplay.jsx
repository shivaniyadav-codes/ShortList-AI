import { Bookmark, BookmarkCheck, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import MatchGraph from './MatchGraph';

const ScoreBar = ({ label, value, weight }) => (
  <div style={{ marginBottom: '10px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.78rem' }}>
      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label} <span style={{ color: 'var(--text-dim)' }}>×{weight}</span></span>
      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{value !== null ? Math.round(value) : '—'}</span>
    </div>
    <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '100px', overflow: 'hidden' }}>
      <div style={{ 
        width: value !== null ? `${Math.min(value, 100)}%` : '0%', 
        height: '100%', 
        background: value !== null ? 'var(--text)' : 'var(--border)',
        borderRadius: '100px',
        transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      }} />
    </div>
  </div>
);

const ShortlistedDisplay = ({ candidates, aiData, requiredSkills, preferredSkills = [], showGraph }) => {
  const [saved, setSaved] = useState({});

  const toggleSave = (id) => {
    setSaved(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="grid" style={{ gap: '16px' }}>
      {showGraph && <MatchGraph candidates={candidates} />}

      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {candidates.length} result{candidates.length !== 1 ? 's' : ''} {aiData ? '· AI scored' : '· Without AI (run AI for full score)'}
      </p>

      {candidates.map((candidate) => {
        const aiInfo = aiData ? aiData[candidate.name] : null;
        const isSaved = saved[candidate._id];

        let matchClass = 'match-low';
        if (candidate.matchScore >= 60) matchClass = 'match-high';
        else if (candidate.matchScore >= 35) matchClass = 'match-medium';

        return (
          <div key={candidate._id} className="glass-panel candidate-card" style={{ position: 'relative' }}>
            <button 
              onClick={() => toggleSave(candidate._id)}
              style={{ 
                position: 'absolute', top: '28px', right: '28px', 
                background: 'none', border: 'none', cursor: 'pointer', 
                color: isSaved ? 'var(--text)' : 'var(--text-dim)',
                transition: 'color 0.2s'
              }}
              title={isSaved ? "Saved" : "Save candidate"}
            >
              {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            </button>

            <div className="candidate-header" style={{ paddingRight: '40px' }}>
              <div>
                <h3 className="candidate-name">{candidate.name}</h3>
                <div className="candidate-email">{candidate.email} · {candidate.experience} yrs exp</div>
              </div>
              <div className={`match-score ${matchClass}`}>
                {Math.round(candidate.matchScore)}
              </div>
            </div>

            {/* Skills */}
            <div className="skills-container">
              {candidate.skills.map((skill, idx) => {
                const isRequired = requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase());
                const isPreferred = preferredSkills.some(pref => pref.toLowerCase() === skill.toLowerCase());
                let className = 'tag';
                if (isRequired) className += ' matched';
                return (
                  <span key={idx} className={className} style={isPreferred && !isRequired ? { borderColor: '#555', color: '#aaa' } : {}}>
                    {skill}
                  </span>
                );
              })}
            </div>

            {/* Score Breakdown */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '4px' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Score Breakdown</p>
              <ScoreBar label="Skill Match" value={candidate.skillScore} weight="0.5" />
              <ScoreBar label="Experience" value={candidate.experienceScore} weight="0.2" />
              <ScoreBar label="Preferred Skills" value={candidate.preferredScore} weight="0.1" />
              <ScoreBar label="AI Score" value={candidate.aiScore} weight="0.2" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Final Score</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{Math.round(candidate.matchScore)}</span>
              </div>
            </div>

            {/* AI Analysis */}
            {aiInfo && (
              <div className="ai-recommendation">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                  <Brain size={16} /> AI Analysis
                </div>
                <p style={{ fontSize: '0.92rem', lineHeight: '1.65', color: 'var(--text-muted)' }}>{aiInfo.aiRecommendation}</p>
                
                <div className="ai-deep-dive">
                  {aiInfo.strengths && aiInfo.strengths.length > 0 && (
                    <div className="ai-section">
                      <h4><TrendingUp size={14} /> Strengths</h4>
                      <ul>
                        {aiInfo.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  
                  {aiInfo.weaknesses && aiInfo.weaknesses.length > 0 && (
                    <div className="ai-section">
                      <h4><AlertTriangle size={14} /> Gaps</h4>
                      <ul>
                        {aiInfo.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                {aiInfo.interviewQuestions && aiInfo.interviewQuestions.length > 0 && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>
                      Interview Questions
                    </h4>
                    <ol style={{ paddingLeft: '18px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      {aiInfo.interviewQuestions.map((q, i) => (
                        <li key={i} style={{ marginBottom: '10px', lineHeight: '1.5', paddingLeft: '4px' }}>{q}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ShortlistedDisplay;
