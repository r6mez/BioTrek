import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { HiOutlineSparkles } from "react-icons/hi2";
import { RiSpaceShipLine } from "react-icons/ri";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  
  // State hooks
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  
  // Auth context
  const { login, isLoading, isAuthenticated } = useAuth();

  // Animation effect
  useEffect(() => {
    setMounted(true);
  }, []);


  // Simple email validation

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  
  // Handle email/password login
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email");
      return;
    }

    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      alert(error.message || "Login failed");
    }
  };



  return (
    <>
      <Navbar />

      {/* Animated Background */}
      <div className="relative min-h-screen w-screen overflow-hidden bg-space-gradient">
        {/* Animated stars */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-bounce" style={{ animationDuration: '4s' }} />
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl animate-bounce" style={{ animationDuration: '5s' }} />
        </div>

        {/* Main Content */}
        <div className="relative flex items-center justify-center min-h-screen p-5 pt-24">
          <div className={`w-full max-w-md transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Glassmorphism Card */}
            <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
              {/* Solid overlay */}
              <div className="absolute inset-0 bg-blue-500/10" />
              
              {/* Content */}
              <div className="relative p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Welcome Back
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Sign in to continue your space journey
                  </p>
                </div>

                {/* Form */}
                <form className="space-y-6">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 backdrop-blur-sm"
                      />
                      <div className="absolute inset-0 rounded-xl bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 block">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 backdrop-blur-sm pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 p-1"
                      >
                        {showPassword ? <AiFillEyeInvisible className="w-5 h-5" /> : <AiFillEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="button"
                    onClick={handleLogin}
                    disabled={isLoading}
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      isLoading 
                        ? "bg-gray-500 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25"
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Logging in...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                  <p className="text-gray-400">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 hover:underline"
                    >
                      Create one here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
