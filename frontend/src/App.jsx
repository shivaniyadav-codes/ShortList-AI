import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CandidateForm from './components/CandidateForm';
import JobRequirementForm from './components/JobRequirementForm';
import CandidateList from './components/CandidateList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="container page-container">
          <Routes>
            <Route path="/" element={<CandidateList />} />
            <Route path="/add-candidate" element={<CandidateForm />} />
            <Route path="/match" element={<JobRequirementForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
