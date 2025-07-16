import React from "react";
import Navigation from "../../../components/Dashboard/Patient/Navigation";
import { Outlet } from "react-router-dom";

const DashboardPartient = () => {
  return (
    <div className="grid grid-cols-6 grid-rows-5 w-full h-screen">
      <div className="row-span-5 w-full p-5">
        <Navigation />
      </div>
      <div className="col-span-5 min-h-screen row-span-5 w-full overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardPartient;
