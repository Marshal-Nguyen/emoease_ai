import React from "react";
import TaskProgressChart from "../../../components/Dashboard/Patient/TaskProgressChart";
import MedicalProfile from "../../../components/Dashboard/Patient/MedicalProfile";
import NotionPatient from "../../../components/Dashboard/Patient/NotionPatient";
import MentalHealthDashboard from "../../../components/Dashboard/Patient/MentalHealthDashboard ";
import { useSelector } from "react-redux";
const StatictisPatient = () => {
  const profileId = useSelector((state) => state.auth.profileId);
  return (
    <div>
      <div className="min-h-[calc(100vh-100px)] grid grid-cols-12 grid-rows-1 gap-1">
        <div className=" col-span-8">
          <div>
            <TaskProgressChart />
          </div>
          <div>
            <MentalHealthDashboard />
          </div>
        </div>
        <div className=" col-span-4 col-start-9 space-y-4">
          <div>
            <MedicalProfile patientId={profileId} />
          </div>
          <div>
            <NotionPatient />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatictisPatient;
