import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";

// --- SVG Icon Components ---
const LogoIcon = ({ className }) => (
    <svg className={`w-8 h-8 ${className || ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const ModulesIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);
const BoxIcon = ({ className }) => ( // Products
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);
const ShoppingCartIcon = ({ className }) => ( // Purchases
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);
const DocumentTextIcon = ({ className }) => ( // Issue Orders / Manage Requests
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const DocumentAddIcon = ({ className }) => ( // Request Leave
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const BriefcaseIcon = ({ className }) => ( // Vendors / Customers
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
const CalendarIcon = ({ className }) => ( // Schedules
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const UsersIcon = ({ className }) => ( // Users
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-11a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const TruckIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h12v6H3v-6zm0-2h12V5H3v6zm12 0h6l3 3v5h-6v-8zM7 21a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
);

const ChartBarIcon = ({ className }) => ( // Dashboard
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);
const LogoutIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);
const SunIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
const MoonIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const LogsIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-6-8h6M5 6h14M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ChevronDownIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const NavLink = ({ to, icon, children, onClick }) => {
    const location = useLocation();
    const { darkMode } = useContext(DarkModeContext);
    const isActive = location.pathname === to || (to !=='/' && location.pathname.startsWith(to) && to.length > 1);

    const activeClasses = darkMode ? "bg-gray-700 text-white" : "bg-indigo-100 text-indigo-700";
    const inactiveClasses = darkMode ? "text-gray-400 hover:text-white hover:bg-gray-700/50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100";

    return (
        <Link to={to} onClick={onClick} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${isActive ? activeClasses : inactiveClasses}`}>
            {isActive && <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full ${darkMode ? 'bg-indigo-400' : 'bg-indigo-600'}`}></span>}
            {icon}
            <span>{children}</span>
        </Link>
    );
};

const CollapsibleSection = ({ title, children, moduleName }) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(location.pathname.split('/')[1] === moduleName);

    useEffect(() => {
        setIsOpen(location.pathname.split('/')[1] === moduleName);
    }, [location, moduleName]);

    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-3 py-2 text-left">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
                <ChevronDownIcon className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`mt-1 space-y-1 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                {children}
            </div>
        </div>
    );
};

const LeftNavbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { darkMode, setDarkMode } = useContext(DarkModeContext);
  const { user, logout, isAdmin, isManager } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : 'auto';
  }, [isMobileOpen]);

  const handleLogout = () => {
    if (window.confirm("Do you really want to logout?")) {
      logout();
      navigate("/login");
      setIsMobileOpen(false);
    }
  };

  const closeMobileMenu = () => setIsMobileOpen(false);
  const canSeeAdvancedOptions = isAdmin || isManager;
  const currentModule = location.pathname.split('/')[1];

  const mainNavContent = (
    <>
      <div className={`flex items-center gap-3 px-3 mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <LogoIcon className="text-indigo-500" />
          <span className="text-xl font-bold">ERP System</span>
      </div>

      <nav className="flex-grow space-y-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
              <NavLink to="/dashboard" icon={<ChartBarIcon />} onClick={closeMobileMenu}>Dashboard</NavLink>
              {currentModule && currentModule !== 'dashboard' && (
                  <NavLink to="/modules" icon={<ModulesIcon />} onClick={closeMobileMenu}>Back to Modules</NavLink>
              )}
          </div>

          <CollapsibleSection title="Inventory" moduleName="ims">
              <NavLink to="/ims/products" icon={<BoxIcon />} onClick={closeMobileMenu}>Products</NavLink>
              <NavLink to="/ims/purchases" icon={<ShoppingCartIcon />} onClick={closeMobileMenu}>Purchases</NavLink>
              <NavLink to="/ims/issue-orders" icon={<DocumentTextIcon />} onClick={closeMobileMenu}>Issue Orders</NavLink>
              {canSeeAdvancedOptions && <>
                  <NavLink to="/ims/vendors" icon={<BriefcaseIcon />} onClick={closeMobileMenu}>Vendors</NavLink>
                  <NavLink to="/ims/customers" icon={<UsersIcon />} onClick={closeMobileMenu}>Customers</NavLink>
              </>}
          </CollapsibleSection>

          <CollapsibleSection title="Human Resources" moduleName="hr">
              <NavLink to="/hr/schedules" icon={<CalendarIcon />} onClick={closeMobileMenu}>Schedules</NavLink>
              <NavLink to="/hr/leave-request/new" icon={<DocumentAddIcon />} onClick={closeMobileMenu}>Request Leave</NavLink>
              {canSeeAdvancedOptions && (
                 <NavLink to="/hr/leave-requests" icon={<DocumentTextIcon />} onClick={closeMobileMenu}>Manage Requests</NavLink>
              )}
          </CollapsibleSection>

          {isAdmin && (
              <CollapsibleSection title="Admin" moduleName="users">
                  <NavLink to="/users/" icon={<UsersIcon />} onClick={closeMobileMenu}>Manage Users</NavLink>
                  <NavLink to="/logs/" icon={<LogsIcon />} onClick={closeMobileMenu}>View Logs</NavLink>
              </CollapsibleSection>
          )}
      </nav>
    </>
  );

  const footerNavContent = (
    <div className="mt-auto flex-shrink-0 space-y-4">
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.username || 'Guest'}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.role || 'No Role'}</p>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg">
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Theme</span>
            <button onClick={() => setDarkMode(!darkMode)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                <span className="absolute left-1.5">{darkMode ? <MoonIcon className="h-4 w-4 text-yellow-300"/> : ''}</span>
                <span className="absolute right-1.5">{darkMode ? '' : <SunIcon className="h-4 w-4 text-yellow-500"/>}</span>
            </button>
        </div>
        <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${darkMode ? 'text-red-400 hover:bg-red-800/20' : 'text-red-600 hover:bg-red-100'}`}>
            <LogoutIcon />
            <span>Logout</span>
        </button>
    </div>
  );

  return (
    <div>
      <button
        className={`fixed top-4 left-4 z-50 p-2 rounded-md md:hidden transition-colors ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800 shadow-md"}`}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Open navigation"
        aria-expanded={isMobileOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      <div
        className={`fixed inset-0 z-40 md:hidden bg-black/60 transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileOpen(false)}
      ></div>

      <aside className={`fixed top-0 left-0 h-full w-64 p-4 flex flex-col transform transition-transform duration-300 ease-in-out z-50 md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ${darkMode ? "bg-gray-800 border-r border-gray-700" : "bg-white border-r border-gray-200"}`}>
        {mainNavContent}
        {footerNavContent}
      </aside>
    </div>
  );
};

export default LeftNavbar;