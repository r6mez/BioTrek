import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/AIChat');
    } else {
      navigate('/login');
    }
  };

  // Data for charts
  const publicationsData = [
    { name: "Animal Studies", value: 202 },
    { name: "Plant Biology", value: 94 },
    { name: "Other", value: 79 },
    { name: "Molecular Biology", value: 60 },
    { name: "Microbiology", value: 51 },
    { name: "Human Health", value: 46 },
    { name: "Space Environment", value: 33 },
    { name: "Radiation Effects", value: 31 },
    { name: "Technology", value: 6 },
  ];

  const publicationsPercentages = [
    { name: "Animal Studies", percent: 33.6 },
    { name: "Plant Biology", percent: 15.6 },
    { name: "Other", percent: 13.1 },
    { name: "Molecular Biology", percent: 10.0 },
    { name: "Microbiology", percent: 8.5 },
    { name: "Human Health", percent: 7.6 },
    { name: "Space Environment", percent: 5.5 },
    { name: "Radiation Effects", percent: 5.1 },
    { name: "Technology", percent: 1.0 },
  ];

  // Colors for the charts
  const COLORS = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", 
    "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B739"
  ];

  return (
    <>
      <Navbar />
      
      {/* Main container with unified gradient background */}
      <div className="relative w-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 text-white overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 pt-24 pb-20">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            {/* Left content */}
            <div className="z-10 flex-1 max-w-2xl text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-blue-400 font-extrabold leading-tight mb-6">
                Welcome to <br /> BioTrek
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
                Bridging NASA's vast bioscience research with accessible, AI-powered insights for the next generation of space exploration
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={handleGetStarted}
                  className="px-8 py-4 rounded-full font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                </button>
                {!isAuthenticated && (
                  <button 
                    onClick={handleLogin}
                    className="px-8 py-4 rounded-full font-semibold border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transition-all duration-300"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>

            {/* Right illustration */}
            <div className="relative flex-1 max-w-lg flex justify-center items-center">
              {/* Planet with enhanced glowing effect */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-60 lg:h-60 rounded-full bg-gradient-to-br from-blue-400 via-blue-600 to-purple-800 shadow-[0_0_80px_30px_rgba(59,130,246,0.3),0_0_120px_40px_rgba(147,51,234,0.2)] animate-spin-slow">
                {/* Planet surface details */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-300 to-purple-600 opacity-60"></div>
                <div className="absolute top-8 left-8 w-4 h-4 rounded-full bg-blue-200 opacity-40"></div>
                <div className="absolute bottom-12 right-12 w-3 h-3 rounded-full bg-purple-200 opacity-50"></div>
                <div className="absolute top-16 right-8 w-2 h-2 rounded-full bg-cyan-200 opacity-60"></div>
              </div>

              {/* Planet Orbit Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                className="absolute w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bottom-8 sm:bottom-10 animate-float text-blue-400"
                fill="currentColor"
              >
                <circle cx="32" cy="32" r="14" />
                <path
                  d="M8 28c10 8 38 8 48 0"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  d="M8 36c10 8 38 8 48 0"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Floating stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-8 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-24 right-16 w-1 h-1 bg-blue-300 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-40 left-1/4 w-1 h-1 bg-purple-300 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute top-60 right-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-32 left-1/2 w-1 h-1 bg-white rounded-full animate-pulse delay-1500"></div>
          <div className="absolute top-80 right-8 w-1 h-1 bg-blue-200 rounded-full animate-pulse delay-3000"></div>
          <div className="absolute top-72 left-12 w-1 h-1 bg-purple-200 rounded-full animate-pulse delay-4000"></div>
          <div className="absolute top-48 right-1/4 w-1 h-1 bg-cyan-200 rounded-full animate-pulse delay-2500"></div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="relative px-10 md:px-20 py-20">
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="bg-gray-900 rounded-2xl p-8 md:p-12 border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-white">
              Our Mission
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed text-center">
              We're creating a smart dashboard that transforms NASA's complex
              space biology research into easily digestible, searchable
              insights. Our AI-powered platform helps researchers, students, and
              mission architects quickly understand the impact and applications
              of NASA's bioscience experiments.
            </p>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="relative px-10 md:px-20 py-20">
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-900/20 rounded-2xl p-8 border border-red-700 hover:border-red-500 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-1 group">
              <h3 className="text-2xl font-bold mb-4 text-red-300 group-hover:text-red-200 transition-colors duration-300">
                The Challenge
              </h3>
              <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                NASA has tons of biology experiment data from space, but it's
                hard to search and understand. Researchers, students, and
                developers struggle to find the exact information they need and
                understand the key takeaways from technical papers.
              </p>
            </div>
            <div className="bg-green-900/20 rounded-2xl p-8 border border-green-700 hover:border-green-500 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1 group">
              <h3 className="text-2xl font-bold mb-4 text-green-300 group-hover:text-green-200 transition-colors duration-300">
                Our Solution
              </h3>
              <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                A chatbot-powered dashboard that automatically summarizes key
                sections of NASA research papers, making complex scientific data
                easy to digest through AI summarization and interactive
                exploration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="relative px-10 md:px-20 py-20">
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-wide text-white">
              Our Story
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-gray-300 text-lg leading-relaxed">
              We have collected over{" "}
              <span className="text-blue-400 font-bold">600+</span> scientific
              articles and multiple datasets. Extracting useful insights from
              this massive amount of information is challenging. Our mission is
              to simplify and visualize this knowledge to make it accessible for
              everyone.
            </p>
          </div>

          {/* Graphs Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Pie Chart */}
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1">
              <h3 className="text-base font-semibold mb-4 text-center text-blue-300">
                Publications by Field (%)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={publicationsPercentages}
                    dataKey="percent"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => `${entry.percent}%`}
                    labelStyle={{ fontSize: "11px", fontWeight: "bold" }}
                  >
                    {publicationsPercentages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700 hover:border-green-500 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1">
              <h3 className="text-base font-semibold mb-4 text-center text-green-300">
                Publications Count by Field
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={publicationsData}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#fff" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    style={{ fontSize: "10px" }}
                  />
                  <YAxis stroke="#fff" style={{ fontSize: "11px" }} />
                  <Tooltip contentStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {publicationsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights Section */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Insights We Aim to Discover
            </h3>
            <p className="max-w-3xl mx-auto text-gray-300 text-lg leading-relaxed">
              Beyond visualization, we are working on extracting new findings
              from the data itself. This includes detecting trends,
              correlations, and predictions that were not obvious in the
              original publications.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative px-10 md:px-20 py-20 pb-32">
        <div className="relative z-10 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
            Meet The BioTrek Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 group">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/50">
                  <span className="text-2xl font-bold text-white">ES</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                  Essam Shenhab
                </h3>
                <p className="text-blue-400 font-semibold group-hover:text-blue-300 transition-colors duration-300">
                  Team Lead – AI & Data
                </p>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                Guides the team and ensures smooth coordination. Designs systems
                for handling scientific articles and datasets, with expertise in
                English, script writing, and presenting.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-2 group">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-green-500/50">
                  <span className="text-2xl font-bold text-white">AO</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-green-300 transition-colors duration-300">
                  Abdulrahman Omar
                </h3>
                <p className="text-green-400 font-semibold group-hover:text-green-300 transition-colors duration-300">
                  Software Engineer
                </p>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                Builds the backend with Nest.js and designs multi-agent systems.
                Combines backend development skills with AI systems knowledge to
                bridge infrastructure and intelligence.
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 group">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/50">
                  <span className="text-2xl font-bold text-white">RM</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                  Ramez Medhat
                </h3>
                <p className="text-purple-400 font-semibold group-hover:text-purple-300 transition-colors duration-300">
                  Software Engineer
                </p>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                Builds backend systems with Nest.js, integrates AI services, and
                implements authentication. Ensures seamless communication
                between components for scalable and reliable solutions.
              </p>
            </div>

            {/* Team Member 4 */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-pink-500 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/20 hover:-translate-y-2 group">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-pink-500/50">
                  <span className="text-2xl font-bold text-white">MM</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-pink-300 transition-colors duration-300">
                  Menna Medhat
                </h3>
                <p className="text-pink-400 font-semibold group-hover:text-pink-300 transition-colors duration-300">
                  Content & Presentation
                </p>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                Drafts proposals and delivers presentations with voice-overs for
                demos. Translates complex scientific concepts into accessible,
                engaging narratives for clear communication.
              </p>
            </div>

            {/* Team Member 5 */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-2 group">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-orange-500/50">
                  <span className="text-2xl font-bold text-white">BT</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-orange-300 transition-colors duration-300">
                  Bassant Tamer
                </h3>
                <p className="text-orange-400 font-semibold group-hover:text-orange-300 transition-colors duration-300">
                  Frontend Developer
                </p>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                Builds chatbot interfaces and dynamic dashboards for user
                interaction. Creates intuitive, user-friendly experiences with
                React and UI design expertise, plus video editing skills.
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Animations */}
      <style>{`
        .animate-spin-slow {
          animation: spin 25s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </>
  );
}
