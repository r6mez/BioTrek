import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const defaultLineData = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 500 },
    { name: "Apr", value: 700 },
    { name: "May", value: 600 },
    { name: "Jun", value: 800 },
  ];

  const defaultBarData = [
    { name: "Mon", users: 40 },
    { name: "Tue", users: 60 },
    { name: "Wed", users: 80 },
    { name: "Thu", users: 30 },
    { name: "Fri", users: 70 },
    { name: "Sat", users: 50 },
  ];

  const defaultPieData = [
    { name: "Success", value: 400 },
    { name: "Failure", value: 100 },
    { name: "Pending", value: 200 },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

  const [lineData, setLineData] = useState(defaultLineData);
  const [barData, setBarData] = useState(defaultBarData);
  const [pieData, setPieData] = useState(defaultPieData);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    fetch("/api/dashboard-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.lineData) setLineData(data.lineData);
        if (data.barData) setBarData(data.barData);
        if (data.pieData) setPieData(data.pieData);
      })
      .catch((err) => {
        console.log("Using default data, no API data found:", err);
      });
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col h-screen w-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-blue-900 text-white font-poppins pt-20">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="relative min-h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 text-white px-10 md:px-20 pt-24 pb-20">
        {/* Header Section */}
        <div className="relative z-10 flex flex-col items-center text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-wide text-white">
            AI Dashboard
          </h1>
          <p className="max-w-4xl text-lg md:text-xl text-gray-300 leading-relaxed">
            Real-time insights and analytics for NASA's bioscience research
            platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="relative z-10 max-w-6xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 group">
              <div className="text-sm text-gray-400 group-hover:text-blue-300 transition-colors duration-300">
                Total Users
              </div>
              <div className="text-3xl font-bold mt-2 text-white group-hover:text-blue-200 transition-colors duration-300">
                12,430
              </div>
              <div className="text-sm text-gray-500 mt-2 group-hover:text-gray-300 transition-colors duration-300">
                +4.2% this month
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-green-500 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1 group">
              <div className="text-sm text-gray-400 group-hover:text-green-300 transition-colors duration-300">
                Active Sessions
              </div>
              <div className="text-3xl font-bold mt-2 text-white group-hover:text-green-200 transition-colors duration-300">
                1,243
              </div>
              <div className="text-sm text-gray-500 mt-2 group-hover:text-gray-300 transition-colors duration-300">
                +1.8% this week
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 group">
              <div className="text-sm text-gray-400 group-hover:text-purple-300 transition-colors duration-300">
                Model Accuracy
              </div>
              <div className="text-3xl font-bold mt-2 text-white group-hover:text-purple-200 transition-colors duration-300">
                92.4%
              </div>
              <div className="text-sm text-gray-500 mt-2 group-hover:text-gray-300 transition-colors duration-300">
                Last trained: 3 days ago
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 mb-8">
            {/* Line Chart */}
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1">
              <h3 className="text-xl font-semibold mb-4 text-center text-blue-300">
                Monthly Predictions
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700 hover:border-green-500 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1">
              <h3 className="text-xl font-semibold mb-4 text-center text-green-300">
                Weekly Active Users
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Bar dataKey="users" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart - Full Width */}
          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1">
            <h3 className="text-xl font-semibold mb-4 text-center text-purple-300">
              Outcome Distribution
            </h3>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Dashboard;
