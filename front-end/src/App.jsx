import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import AIChat from "./Pages/AIChat";
import Register from "./Pages/Register";
import ChartTest from "./Pages/ChartTest";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/AIChat" element={<AIChat />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chart-test" element={<ChartTest />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
