import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            🧰 ITKit
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-blue-200 transition">
              Home
            </Link>
            <Link to="/categories" className="hover:text-blue-200 transition">
              Categories
            </Link>
            <Link to="/search" className="hover:text-blue-200 transition">
              Search
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;