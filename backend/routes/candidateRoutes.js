import express from 'express';
import Candidate from '../models/Candidate.js';

const router = express.Router();

// GET all candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// POST new candidate
router.post('/', async (req, res) => {
  try {
    const { name, email, skills, experience, bio } = req.body;
    const newCandidate = new Candidate({
      name,
      email,
      skills,
      experience,
      bio
    });
    const savedCandidate = await newCandidate.save();
    res.status(201).json(savedCandidate);
  } catch (error) {
    res.status(500).json({ message: 'Error adding candidate', error: error.message });
  }
});

// PUT update candidate
router.put('/:id', async (req, res) => {
  try {
    const { name, email, skills, experience, bio } = req.body;
    const updated = await Candidate.findByIdAndUpdate(
      req.params.id,
      { name, email, skills, experience, bio },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Candidate not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating candidate', error: error.message });
  }
});

// DELETE candidate
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Candidate.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Candidate not found' });
    res.json({ message: 'Candidate deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting candidate', error: error.message });
  }
});

export default router;
