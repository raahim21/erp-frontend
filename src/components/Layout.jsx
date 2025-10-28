// import React, { useState, useContext } from 'react';
// import { NavLink } from 'react-router-dom';
// import { FiHome, FiCalendar, FiUsers, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
// import { DarkModeContext } from '../context/DarkmodeContext.jsx';

// const Layout = ({ children }) => {
//   const [isSidebarOpen, setSidebarOpen] = useState(true);
//   const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

//   const navItems = [
//     { icon: FiHome, name: 'Dashboard', path: '/dashboard' },
//     { icon: FiCalendar, name: 'Schedules', path: '/schedules' },
//     { icon: FiUsers, name: 'Users', path: '/users' },
//   ];

//   return (
//     <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
//       {/* Sidebar */}
//       <aside
//         className={`bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex flex-col transition-all duration-300 ${
//           isSidebarOpen ? 'w-64' : 'w-20'
//         }`}
//       >
//         <div className={`flex items-center justify-between p-4 border-b dark:border-gray-700 ${isSidebarOpen ? '' : 'justify-center'}`}>
//           {isSidebarOpen && <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Scheduler</h1>}
//           <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
//             {isSidebarOpen ? <FiX /> : <FiMenu />}
//           </button>
//         </div>
//         <nav className="flex-1 px-4 py-6 space-y-2">
//           {navItems.map((item) => (
//             <NavLink
//               key={item.name}
//               to={item.path}
//               className={({ isActive }) =>
//                 `flex items-center p-3 rounded-lg transition-colors ${
//                   isActive
//                     ? 'bg-blue-600 text-white'
//                     : 'hover:bg-gray-200 dark:hover:bg-gray-700'
//                 } ${!isSidebarOpen && 'justify-center'}`
//               }
//               title={item.name}
//             >
//               <item.icon size={20} />
//               {isSidebarOpen && <span className="ml-4 font-medium">{item.name}</span>}
//             </NavLink>
//           ))}
//         </nav>
//         <div className="p-4 border-t dark:border-gray-700 flex justify-center">
//             <button onClick={toggleDarkMode} className="p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
//                 {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
//             </button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 flex flex-col overflow-hidden">
//         <div className="flex-1 p-6 overflow-y-auto">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Layout;
