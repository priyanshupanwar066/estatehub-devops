import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomeListings from './pages/HomeListings';
import PropertyDetail from './pages/PropertyDetail';
import LoginRegister from './pages/LoginRegister';
import MyFavorites from './pages/MyFavorites';
import CreateEditListing from './pages/CreateEditListing';
import AgentDashboard from './pages/AgentDashboard';
import MarketTrends from './pages/MarketTrends';
import MortgageCalculator from './pages/MortgageCalculator';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50/50 flex flex-col">
          {/* Main App Navigation */}
          <Navbar />

          {/* Main App Content Area — full width, no max-w cap, so every route goes edge to edge.
              Individual pages are responsible for their own inner max-width/container if they
              want a narrower reading column (HomeListings does this via its CONTAINER constant). */}
          <main id="main-content" className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomeListings />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/login" element={<LoginRegister />} />
              <Route path="/market-trends" element={<MarketTrends />} />
              <Route path="/mortgage-calculator" element={<MortgageCalculator />} />

              {/* Protected Routes (Authenticated users / Buyers / Agents) */}
              <Route path="/favorites" element={<MyFavorites />} />

              {/* Protected Routes (Agents only) */}
              <Route path="/agent-dashboard" element={<AgentDashboard />} />
              <Route path="/create-listing" element={<CreateEditListing />} />
              <Route path="/edit-listing/:id" element={<CreateEditListing />} />

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer id="app-footer" className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 mt-auto">
            <div className="w-full px-4">
              <p>&copy; {new Date().getFullYear()} EstateHub. All rights reserved.</p>
              <p className="mt-1">
                Built by Priyanshu Panwar ·{' '}
                <a href="mailto:priyanshupanwar841@gmail.com" className="hover:text-slate-600 transition-colors">
                  priyanshupanwar841@gmail.com
                </a>
              </p>
              
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;