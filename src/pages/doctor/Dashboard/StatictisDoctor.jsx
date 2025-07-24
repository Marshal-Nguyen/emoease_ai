import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import DoctorScheduleViewer from "../../../components/Dashboard/Doctor/DoctorScheduleViewer";
import MedicalRecordsList from "../../../components/Dashboard/Doctor/MedicalRecordsList ";


const StatictisDoctor = () => {
  const [currentDate, setCurrentDate] = useState("");
  const profileId = useSelector((state) => state.auth.profileId);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newPatientsCount, setNewPatientsCount] = useState(0);
  const [oldPatientsCount, setOldPatientsCount] = useState(0);

  useEffect(() => {
    const date = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    setCurrentDate(date.toLocaleDateString("en-US", options));
  }, []);

  useEffect(() => {
    if (!profileId) return;

    const fetchDoctorData = async () => {
      try {
        setLoading(true);

        // Fetch doctor profile
        const profileResponse = await axios.get(
          `https://mental-care-server-nodenet.onrender.com/api/doctor-profiles/${profileId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setName(profileResponse.data.FullName);

        // Fetch medical records
        const medicalRecordsResponse = await axios.get(
          `https://mental-care-server-nodenet.onrender.com/api/medical-records/doctor/${profileId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const allRecords = medicalRecordsResponse.data;

        // Count unique patients
        // Since the API doesn't provide a status field, we'll assume all records are "new" patients
        // Alternatively, we could use DiagnosedAt or other criteria to differentiate
        const uniquePatientIds = new Set(
          allRecords.map((record) => record.PatientId)
        );

        setNewPatientsCount(uniquePatientIds.size);
        setOldPatientsCount(0); // Adjust based on your logic for "old" patients
      } catch (err) {
        setError("Error fetching doctor data. Please try again.");
        console.error("Error fetching doctor data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [profileId]);

  return (
    <div className="h-full grid grid-cols-6 grid-rows-5 py-6 gap-4">
      <div className="col-span-4 relative flex row-span-2 h-full bg-gradient-to-br from-[#8047db] to-[#c2a6ee] rounded-2xl">
        <div className="w-[380px] py-6 pl-6">
          <p className="text-sm text-white">{currentDate}</p>
          <h2 className="text-2xl font-bold mt-2 text-white font-sans">
            Welcome back, <br />{" "}
            <span className="ml-23">{loading ? "..." : name || "Doctor"}</span>
          </h2>
          <p className="text-sm opacity-75 text-white italic">
            Always stay updated in your student portal
          </p>
          <div className="bottom-6 absolute flex w-[350px] h-[85px] gap-4 mt-12">
            <div className="bg-[#ffffffb6] relative w-1/2 text-black p-3 rounded-lg shadow-md">
              <p className="text-sm font-semibold">New Patients</p>
              <p className="text-4xl font-serif">{newPatientsCount}</p>
              <span className="text-green-600 absolute bottom-2 right-2 bg-[#d3fdd0] px-3 py-1 rounded-md text-[13px] font-mono">
                51% ↗
              </span>
            </div>
            <div className="bg-[#ffffffb6] relative w-1/2 text-black p-3 rounded-lg shadow-md">
              <p className="text-sm font-semibold">Old Patients</p>
              <p className="text-4xl font-serif">{oldPatientsCount}</p>
              <span className="text-red-600 absolute bottom-2 right-2 bg-red-200 px-3 py-1 rounded-md text-[13px] font-mono">
                20% ↘
              </span>
            </div>
          </div>
        </div>
        <div className="w-fit">
          <img src="/Doctor2.png" className="h-full pt-2 object-center" />
        </div>
        <div className="w-[254px] flex flex-col gap-3 my-auto mx-auto font-serif text-[13px] text-white text-center">
          <p>
            "Listen not only with your ears but also with your heart—because
            sometimes, what a patient needs most is not advice, but
            understanding"
          </p>
          <p>
            "And remember, healing begins the moment someone feels truly heard"
          </p>
        </div>
      </div>
      <div className="col-span-2 row-span-5 col-start-5">
        <DoctorScheduleViewer doctorId={profileId} />
      </div>
      <div className="col-span-4 row-span-3 row-start-3 text-red">
        <MedicalRecordsList profileId={profileId} />
      </div>
    </div>
  );
};

export default StatictisDoctor;