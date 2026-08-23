import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  LogOut,
  LogIn,
  TrendingUp,
  Calculator,
  LayoutDashboard,
  Menu,
  X,
  Home,
  ChevronDown,
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-blue-50 text-blue-600'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <header
      id="app-header"
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/70 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">

          {/* ================= LOGO ================= */}
          <Link
            id="nav-logo"
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transition-transform duration-200 group-hover:scale-105">
                <Home className="w-5 h-5" strokeWidth={2.5} />
              </div>

              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="leading-none">
              <div className="text-[18px] font-extrabold tracking-tight text-slate-900">
                Estate<span className="text-blue-600">Hub</span>
              </div>

              <span className="hidden sm:block text-[9px] font-bold tracking-[0.18em] uppercase text-slate-400 mt-1">
                Find your place
              </span>
            </div>
          </Link>

          {/* ================= DESKTOP NAV ================= */}
          <nav
            id="nav-menu"
            className="hidden lg:flex items-center gap-1 ml-8"
          >
            <NavLink
              to="/"
              end
              className={navLinkClass}
            >
              <Home className="w-4 h-4" />
              <span>Listings</span>
            </NavLink>

            <NavLink
              to="/market-trends"
              className={navLinkClass}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Market Trends</span>
            </NavLink>

            <NavLink
              to="/mortgage-calculator"
              className={navLinkClass}
            >
              <Calculator className="w-4 h-4" />
              <span>Calculator</span>
            </NavLink>

            {user && (
              <NavLink
                to="/favorites"
                className={navLinkClass}
              >
                <Heart className="w-4 h-4" />
                <span>Favorites</span>
              </NavLink>
            )}

            {user && user.role === 'agent' && (
              <NavLink
                to="/agent-dashboard"
                className={navLinkClass}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Agent Center</span>
              </NavLink>
            )}
          </nav>

          {/* ================= RIGHT SIDE ================= */}
          <div
            id="nav-user-actions"
            className="flex items-center gap-3 ml-auto"
          >
            {user ? (
              <div className="flex items-center gap-3">

                {/* User Profile */}
                <div className="hidden sm:flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="hidden md:block leading-tight">
                    <div className="text-sm font-bold text-slate-800 max-w-[120px] truncate">
                      {user.name}
                    </div>

                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        {user.role}
                      </span>

                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Logout */}
                <button
                  id="btn-logout"
                  onClick={handleLogout}
                  className="group flex items-center justify-center gap-2 h-10 px-3.5 sm:px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm hover:bg-slate-800 hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">

                {/* Sign In */}
                <Link
                  id="link-login"
                  to="/login"
                  className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>

                {/* Sign Up */}
                <Link
                  id="link-register"
                  to="/login?mode=register"
                  className="relative flex items-center justify-center h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-200 active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* ================= MOBILE MENU ================= */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 py-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1">

              <NavLink
                to="/"
                end
                onClick={closeMobileMenu}
                className={navLinkClass}
              >
                <Home className="w-4 h-4" />
                <span>Listings</span>
              </NavLink>

              <NavLink
                to="/market-trends"
                onClick={closeMobileMenu}
                className={navLinkClass}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Market Trends</span>
              </NavLink>

              <NavLink
                to="/mortgage-calculator"
                onClick={closeMobileMenu}
                className={navLinkClass}
              >
                <Calculator className="w-4 h-4" />
                <span>Mortgage Calculator</span>
              </NavLink>

              {user && (
                <NavLink
                  to="/favorites"
                  onClick={closeMobileMenu}
                  className={navLinkClass}
                >
                  <Heart className="w-4 h-4" />
                  <span>My Favorites</span>
                </NavLink>
              )}

              {user && user.role === 'agent' && (
                <NavLink
                  to="/agent-dashboard"
                  onClick={closeMobileMenu}
                  className={navLinkClass}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Agent Center</span>
                </NavLink>
              )}

              {/* Mobile Auth */}
              {!user && (
                <div className="flex gap-2 pt-3 mt-2 border-t border-slate-100">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex-1 flex items-center justify-center h-11 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm"
                  >
                    Sign In
                  </Link>

                  <Link
                    to="/login?mode=register"
                    onClick={closeMobileMenu}
                    className="flex-1 flex items-center justify-center h-11 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile User */}
              {user && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {user.name}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        {user.role} account
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;