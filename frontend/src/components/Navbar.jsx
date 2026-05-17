import { Link, useLocation } from 'react-router-dom';
import { Users, UserPlus, Search } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">ShortList AI</Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <Users size={16} /> Candidates
          </Link>
          <Link to="/add-candidate" className={`nav-link ${location.pathname === '/add-candidate' ? 'active' : ''}`}>
            <UserPlus size={16} /> Add
          </Link>
          <Link to="/match" className={`nav-link ${location.pathname === '/match' ? 'active' : ''}`}>
            <Search size={16} /> Match
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
