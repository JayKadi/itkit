import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import SearchPage from './pages/SearchPage';
import CategoryPage from './pages/CategoryPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import NewArticlePage from './pages/admin/NewArticlePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes with navbar/footer */}
        <Route path="/" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gray-50">
              <HomePage />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/article/:slug" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gray-50">
              <ArticleDetailPage />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/search" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gray-50">
              <SearchPage />
            </main>
            <Footer />
          </div>
        } />
        
        <Route path="/category/:slug" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gray-50">
              <CategoryPage />
            </main>
            <Footer />
          </div>
        } />

        {/* Admin routes (no navbar/footer) */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/new-article" element={<NewArticlePage />} />
      </Routes>
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/article/:slug" element={<ArticleDetailPage />} />
      <Route path="/login" element={<LoginPage/>} />

      {/* 🔐 Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'it_staff']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/new-article"
        element={
          <ProtectedRoute allowedRoles={['admin', 'it_staff']}>
            <NewArticlePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/edit-article/:id"
        element={
          <ProtectedRoute allowedRoles={['admin', 'it_staff']}>
            <EditArticle/>
          </ProtectedRoute>
        }
      />
    </Routes>
    </Router>
  );
}

export default App;