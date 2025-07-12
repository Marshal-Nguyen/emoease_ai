import React from "react";
import Header from "../Chat/Header";
import FloatingParticles from "../Chat/FloatingParticles";

const MainLayout = ({ children }) => {
  console.log("MainLayout rendered");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F8F9FA] via-[#E9ECEF] to-[#DEE2E6] relative overflow-hidden">
      <FloatingParticles />
      <Header />
      <main className="flex-1 relative z-10">{children}</main>
    </div>
  );
};

export default MainLayout;
