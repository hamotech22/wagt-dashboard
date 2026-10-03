import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Login from "../../auth/login/Login";
// import Register from "../../auth/register/Register";


export default function WebsiteRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      {/* <Route path="/register" element={<Register />} /> */}

      <Route path="*" element={<Home />} />
    </Routes>
  );
}