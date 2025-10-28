import React, { useContext, useEffect, useState, useCallback } from "react";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import FullPageSpinner from "./FullPageSpinner.jsx";
import Spinner from "./Spinner.jsx";
import { AuthContext } from "../context/AuthContext.jsx";

// const API_BASE_URL = "http://localhost:5000/api/dashboard";
import { API_BASE_URL } from "../../config.js";
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Reusable Stat Card Component
const StatCard = ({ title, value, darkMode }) => (
  <div className={`p-4 shadow rounded-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
    <h3 className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{title}</h3>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
);

const Dashboard = () => {
  const { isAdmin, isManager } = useContext(AuthContext);
  const navigate = useNavigate();
  const { darkMode } = useContext(DarkModeContext);
  const [stats, setStats] = useState(null);
  const [salesReport, setSalesReport] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [lastUsedParams, setLastUsedParams] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [reportError, setReportError] = useState(null);
  const [reportParams, setReportParams] = useState({
    period: "weekly",
    numOfDays: 28,
    includeProducts: true,
  });

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    setStatsError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Stats fetch error:", err);
      setStatsError("Failed to load dashboard stats");
      toast.error("Failed to load dashboard stats");
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  const fetchSalesReport = useCallback(async (params) => {
    setIsReportLoading(true);
    setReportError(null);
    try {
      const { period, numOfDays, includeProducts } = params;
      const res = await fetch(`${API_BASE_URL}/api/dashboard/sales-report?period=${period}&numOfDays=${numOfDays}&includeProducts=${includeProducts}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        throw new Error(data.message || "Failed to fetch sales report");
      }
      setSalesReport(data);
      setLastUsedParams(params);
    } catch (err) {
      console.error("Sales report fetch error:", err);
      setReportError(err.message);
      toast.error(err.message);
    } finally {
      setIsReportLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin && !isManager) {
      navigate('/ims/products');
    } else {
      fetchStats();
      fetchSalesReport(reportParams); // Fetch initial report on load
    }
  }, [isAdmin, isManager, navigate, fetchStats, fetchSalesReport]);

  useEffect(() => {
    if (!salesReport.length || !lastUsedParams) return;
    const newChartData = salesReport.map((item) => {
      let label = "N/A";
      if(lastUsedParams.period === "daily") label = `${item._id.day}/${item._id.month}/${item._id.year}`;
      else if (lastUsedParams.period === "monthly") label = `${item._id.month}/${item._id.year}`;
      else if (lastUsedParams.period === "weekly") label = `Week ${item._id.week + 1}`;
      return { ...item, label };
    });
    setChartData(newChartData);
  }, [salesReport, lastUsedParams]);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    if(reportParams.numOfDays < 1) return toast.error("Number of days must be positive.");
    if(reportParams.period === 'weekly' && reportParams.numOfDays < 7) return toast.error("Weekly reports require at least 7 days.");
    if(reportParams.period === 'monthly' && reportParams.numOfDays < 28) return toast.error("Monthly reports require at least 28 days.");
    fetchSalesReport(reportParams);
  };

  const updateReportParams = (e) => {
    const { name, value, type, checked } = e.target;
    setReportParams(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  if (isStatsLoading) return <FullPageSpinner />;
  if (statsError && !stats) return <div className="text-red-500 text-center p-6 dark:text-red-400">{statsError}</div>;

  return (
    <div className={`container mx-auto p-4 sm:p-6 min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      <h1 className={`text-2xl sm:text-3xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-800"}`}>Dashboard</h1>

      {stats && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
          <StatCard title="Total Products" value={stats.products?.totalProducts ?? 0} darkMode={darkMode} />
          <StatCard title="Total Stock Value" value={stats.products?.totalStock ?? 0} darkMode={darkMode} />
          <StatCard title="Low Stock Items" value={stats.products?.lowStockItems?.length ?? 0} darkMode={darkMode} />
          <StatCard title="Total Purchases" value={stats.purchases?.totalPurchases ?? 0} darkMode={darkMode} />
          <StatCard title="Total Spent" value={`$${stats.purchases?.totalSpent?.toFixed(2) ?? 0}`} darkMode={darkMode} />
          <StatCard title="Total Issues" value={stats.issues?.totalIssues ?? 0} darkMode={darkMode} />
          <StatCard title="Products Issued" value={stats.issues?.totalProductsIssued ?? 0} darkMode={darkMode} />
          <StatCard title="Total Revenue" value={`$${stats.issues?.totalRevenue?.toFixed(2) ?? 0}`} darkMode={darkMode} />
        </div>
      )}
      
      {stats?.purchases?.purchasesByType && (
        <div className={`p-4 sm:p-6 shadow rounded-lg mb-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>Purchase Types</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.purchases.purchasesByType} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label>
                {stats.purchases.purchasesByType.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className={`p-4 sm:p-6 shadow rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>Generate Sales Report</h2>
        <form onSubmit={handleGenerateReport} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Period</label>
            <select name="period" value={reportParams.period} onChange={updateReportParams} className={`mt-1 block w-full rounded-md border p-2 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Number of Days</label>
            <input type="number" name="numOfDays" value={reportParams.numOfDays} onChange={updateReportParams} className={`mt-1 block w-full rounded-md border p-2 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`} min="1" required/>
          </div>
          <div className="flex items-center pt-5">
            <input type="checkbox" name="includeProducts" checked={reportParams.includeProducts} onChange={updateReportParams} className="h-4 w-4 rounded"/>
            <label className={`ml-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Include Products</label>
          </div>
          <button type="submit" disabled={isReportLoading} className={`px-4 py-2 rounded-md w-full ${darkMode ? "bg-indigo-500 text-white hover:bg-indigo-600" : "bg-indigo-600 text-white hover:bg-indigo-700"} disabled:opacity-50`}>
            {isReportLoading ? <Spinner /> : "Generate"}
          </button>
        </form>
      </div>

      {isReportLoading && <div className="text-center p-4"><Spinner/></div>}
      {reportError && <div className="text-red-500 text-center p-4 dark:text-red-400">{reportError}</div>}

      {salesReport.length > 0 && !isReportLoading && (
        <div className={`p-4 sm:p-6 shadow rounded-lg mt-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>Sales Report</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
              <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
              {lastUsedParams?.includeProducts && <Bar dataKey="productsSold" fill="#ffc658" name="Products Sold" />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
