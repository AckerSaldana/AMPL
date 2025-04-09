import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const MainLayout = () => {
  return (
    <Navbar>
      <Outlet />
    </Navbar>
  );
};

export default MainLayout;
