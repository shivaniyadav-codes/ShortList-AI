import express from 'express';
import Candidate from '../models/Candidate.js';

const router = express.Router();

// ─── Basic Matching Logic (Skill + Experience + Preferred) ───
router.post('/match', async (req, res) => {
  try {
    const { requiredSkills, minExperience, preferredSkills } = req.body;
    
    if (!requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({ message: 'Required skills are missing.' });
    }

    const candidates = await Candidate.find();
    const prefSkills = preferredSkills || [];
    
    const matchedCandidates = candidates.map(candidate => {
      const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase());

      // 1) Skill Match Score
      const reqSkillsLower = requiredSkills.map(s => s.toLowerCase());
      const matchedRequired = candidate.skills.filter(skill =>
        reqSkillsLower.includes(skill.toLowerCase())
      );
      const skillScore = (matchedRequired.length / requiredSkills.length) * 100;

      // 2) Experience Score
      let experienceScore = 0;
      if (minExperience > 0) {
        experienceScore = Math.min(candidate.experience / minExperience, 1) * 100;
      } else {
        experienceScore = 100; // No min experience required = full marks
      }

      // 3) Preferred Skill Score
      let preferredScore = 0;
      let matchedPreferred = [];
      if (prefSkills.length > 0) {
        const prefSkillsLower = prefSkills.map(s => s.toLowerCase());
        matchedPreferred = candidate.skills.filter(skill =>
          prefSkillsLower.includes(skill.toLowerCase())
        );
        preferredScore = (matchedPreferred.length / prefSkills.length) * 100;
      } else {
        preferredScore = 0; // No preferred skills defined
      }

      // Preliminary Final Score (without AI, AI will be added later)
      // Formula: (0.5 × Skill) + (0.2 × Experience) + (0.1 × Preferred) + (0.2 × AI)
      // Without AI: we calculate the non-AI portion = 80% of formula
      const preliminaryScore = (0.5 * skillScore) + (0.2 * experienceScore) + (0.1 * preferredScore);

      return {
        ...candidate.toObject(),
        skillScore: Math.round(skillScore * 10) / 10,
        experienceScore: Math.round(experienceScore * 10) / 10,
        preferredScore: Math.round(preferredScore * 10) / 10,
        aiScore: null, // Will be filled by AI endpoint
        matchScore: Math.round(preliminaryScore * 10) / 10,
        matchedRequired,
        matchedPreferred,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Rank
    const ranked = matchedCandidates.map(c => {
      let rank = 'Low Match';
      if (c.matchScore >= 60) rank = 'High Match';
      else if (c.matchScore >= 35) rank = 'Partial Match';
      return { ...c, rank };
    });

    res.json(ranked);
  } catch (error) {
    res.status(500).json({ message: 'Error during matching', error: error.message });
  }
});

// ─── AI-Based Shortlisting (returns AI score + analysis) ───
router.post('/ai/shortlist', async (req, res) => {
  try {
    const { requiredSkills, minExperience, preferredSkills, candidates } = req.body;

    if (!candidates || candidates.length === 0) {
      return res.status(400).json({ message: 'No candidates provided for AI analysis.' });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const prefSkills = preferredSkills || [];
    
    const candidateData = candidates.map((c, i) => 
      `${i + 1}. ${c.name} - Skills: ${c.skills.join(', ')} - Experience: ${c.experience} years${c.bio ? ' - Bio: ' + c.bio : ''}`
    ).join('\n');

    const promptContent = `
      You are an expert technical recruiter and HR analyst.
      
      Job Requirements:
      - Required Skills: ${requiredSkills.join(', ')}
      - Minimum Experience: ${minExperience} years
      ${prefSkills.length > 0 ? '- Preferred Skills: ' + prefSkills.join(', ') : ''}
      
      Candidates:
      ${candidateData}
      
      For EACH candidate, provide a deep analysis:
      1. "aiScore": A numeric score from 0 to 100 based on overall profile quality, project relevance, skill depth, and job fit. Be critical and realistic — not everyone deserves a high score.
      2. "aiRecommendation": A comprehensive explanation of why they fit or don't fit.
      3. "strengths": Top 2 key strengths.
      4. "weaknesses": Top 2 skill gaps or weaknesses.
      5. "interviewQuestions": Exactly 5 highly specific, advanced, scenario-based interview questions tailored to THIS candidate. They must probe weaknesses and test claimed strengths. No generic questions.
      
      Output MUST be exactly valid JSON as an array:
      [
        {
          "candidateName": "Name",
          "aiScore": 75,
          "aiRecommendation": "Detailed explanation...",
          "strengths": ["Strength 1", "Strength 2"],
          "weaknesses": ["Gap 1", "Gap 2"],
          "interviewQuestions": ["Q1", "Q2", "Q3", "Q4", "Q5"]
        }
      ]
      DO NOT include markdown block characters. ONLY return the raw JSON array.
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: promptContent
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content.trim();
      let parsedResponse;
      try {
        const jsonStr = content.replace(/^```json/m, '').replace(/```$/m, '').trim();
        parsedResponse = JSON.parse(jsonStr);
      } catch (parseError) {
         return res.status(500).json({ message: 'Failed to parse AI response.', raw: content });
      }
      res.json(parsedResponse);
    } else {
      res.status(500).json({ message: 'Invalid response from OpenRouter API', data });
    }

  } catch (error) {
    res.status(500).json({ message: 'Error during AI shortlisting', error: error.message });
  }
});

export default router;
