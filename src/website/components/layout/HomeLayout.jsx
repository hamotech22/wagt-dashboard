// imports

import { Outlet } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";

export default function HomeLayout() {
  // state, functions, effects, API calls...

  return (
    <>
    <Navbar/>
    <Outlet/>
    <Footer/>
      
    </>
  )
}