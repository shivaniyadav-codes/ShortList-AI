import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  skills: [{ type: String }],
  experience: { type: Number, required: true },
  bio: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Candidate', CandidateSchema);
