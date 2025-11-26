import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage.jsx";
import Authentication from "./pages/authentication.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import VideoMeet from "./pages/VideoMeet.jsx";
import Home from "./pages/home.jsx";
import History from "./pages/history.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/:url" element={<VideoMeet />} />
          <Route path="/home" element={<Home />} />
          <Route path="/history" element={<History/>}/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
