// import React, { useState, useEffect, useRef } from "react";

// const MedicalProfile = ({ patientId }) => {
//   const [patient, setPatient] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const symptomsContainerRef = useRef(null);
//   const VITE_API = import.meta.env.VITE_API;

//   useEffect(() => {
//     const fetchPatientData = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(
//           `${VITE_API}//patient-profiles/${patientId}`,
//           {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           }
//         );

//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const data = await response.json();
//         setPatient(data.patientProfileDto);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching patient data:", err);
//         setError("Failed to fetch patient data. Please try again later.");
//         setLoading(false);
//       }
//     };

//     fetchPatientData();
//   }, [patientId]);

//   // Scroll handling for symptoms
//   const scrollLeft = () => {
//     if (symptomsContainerRef.current) {
//       symptomsContainerRef.current.scrollBy({ left: -100, behavior: "smooth" });
//     }
//   };

//   const scrollRight = () => {
//     if (symptomsContainerRef.current) {
//       symptomsContainerRef.current.scrollBy({ left: 100, behavior: "smooth" });
//     }
//   };

//   // Get initials for avatar
//   const getInitials = (name) => {
//     if (!name) return "";
//     return name
//       .split(" ")
//       .map((word) => word[0])
//       .join("")
//       .toUpperCase();
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64 bg-white">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64 bg-white p-4">
//         <div className="text-red-500 text-center">
//           <p>{error}</p>
//           <button
//             className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
//             onClick={() => window.location.reload()}
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!patient) {
//     return (
//       <div className="flex items-center justify-center h-64 bg-white">
//         <p className="text-gray-500">No patient data available</p>
//       </div>
//     );
//   }

//   const hasSymptoms =
//     patient.medicalHistory?.physicalSymptoms &&
//     patient.medicalHistory.physicalSymptoms.length > 0;
//   const hasMultipleSymptoms =
//     hasSymptoms && patient.medicalHistory.physicalSymptoms.length > 3;

//   return (
//     <div className="bg-white px-4 flex items-center justify-center">
//       <div className="bg-white rounded-3xl shadow-md overflow-hidden max-w-md w-full">
//         {/* Header */}
//         <div className="px-6 pt-6 flex items-center relative">
//           <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mr-4 border-2 border-teal-100">
//             <span className="text-teal-800 text-xl font-bold">
//               {getInitials(patient.fullName)}
//             </span>
//           </div>

//           <div className="flex-1">
//             <h2 className="text-xl font-medium text-gray-800">
//               {patient.fullName}
//             </h2>
//             <p className="text-gray-500 text-sm">
//               {patient.gender} - Diagnosed{" "}
//               {formatDate(patient.medicalHistory?.diagnosedAt)}
//             </p>
//           </div>

//           <button className="text-gray-400 hover:text-gray-600 transition">
//             <svg
//               width="24"
//               height="24"
//               viewBox="0 0 24 24"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <circle cx="5" cy="12" r="2" fill="currentColor" />
//               <circle cx="12" cy="12" r="2" fill="currentColor" />
//               <circle cx="19" cy="12" r="2" fill="currentColor" />
//             </svg>
//           </button>
//         </div>

//         {/* Physical Symptoms with Scroll */}
//         <div className="px-6 pt-4 pb-2 relative">
//           <div className="flex items-center justify-between mb-2">
//             <h3 className="font-bold text-gray-800 text-sm">
//               Physical Symptoms
//             </h3>
//             {hasMultipleSymptoms && (
//               <div className="flex space-x-2">
//                 <button
//                   onClick={scrollLeft}
//                   className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
//                 >
//                   <span>←</span>
//                 </button>
//                 <button
//                   onClick={scrollRight}
//                   className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
//                 >
//                   <span>→</span>
//                 </button>
//               </div>
//             )}
//           </div>

//           {hasSymptoms ? (
//             <div
//               ref={symptomsContainerRef}
//               className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide"
//               style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
//             >
//               {patient.medicalHistory.physicalSymptoms.map((symptom) => (
//                 <div
//                   key={symptom.id}
//                   className="flex flex-col items-center flex-shrink-0"
//                 >
//                   <div className="w-10 h-10 rounded-full flex items-center justify-center">
//                     <img
//                       src={`/MedicalHistory/${symptom.name.replace(
//                         " ",
//                         ""
//                       )}.png`}
//                       className="w-8 h-8 shadow-2xl"
//                       alt={symptom.name}
//                     />
//                   </div>
//                   <span className="text-sm font-medium text-gray-700 mt-1 whitespace-nowrap">
//                     {symptom.name}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-sm text-gray-500 py-2">
//               No physical symptoms recorded
//             </div>
//           )}
//         </div>

//         <div className="mx-4 h-px bg-gray-200 my-2"></div>

//         <div className="overflow-y-auto max-h-52">
//           {/* Personal Info */}
//           <SectionItem
//             title="Personal Information"
//             content={`Allergies: ${patient.allergies || "None"} | Traits: ${
//               patient.personalityTraits || "Not specified"
//             }`}
//           />

//           {/* Latest Notes */}
//           {patient.medicalRecords && patient.medicalRecords.length > 0 && (
//             <SectionItem
//               title="Latest Notes"
//               content={patient.medicalRecords[0].notes || "No notes available"}
//               status={patient.medicalRecords[0].status}
//             />
//           )}

//           {/* Mental Disorders */}
//           <div className="px-6 py-2">
//             <h3 className="font-bold text-gray-800 text-sm pb-1">
//               Specific Mental Disorders
//             </h3>
//             <ol className="list-disc px-6 space-y-1 text-xs">
//               {patient.medicalHistory &&
//               patient.medicalHistory.specificMentalDisorders?.length > 0 ? (
//                 patient.medicalHistory.specificMentalDisorders.map(
//                   (symptom) => (
//                     <li key={symptom.id} className="text-gray-600">
//                       {symptom.name}
//                     </li>
//                   )
//                 )
//               ) : (
//                 <p className="text-xs text-gray-500 px-2">
//                   No mental disorders recorded
//                 </p>
//               )}
//             </ol>
//           </div>

//           {/* Contact Info */}
//           <div className="px-6 py-2 mb-4">
//             <h3 className="font-bold text-gray-800 text-sm pb-1">
//               Contact Information
//             </h3>
//             {patient.contactInfo ? (
//               <>
//                 <p className="text-gray-600 text-xs">
//                   {patient.contactInfo.email || "No email provided"}
//                 </p>
//                 <p className="text-gray-600 text-xs">
//                   {patient.contactInfo.phoneNumber || "No phone provided"}
//                 </p>
//                 <p className="text-gray-600 text-xs">
//                   {patient.contactInfo.address || "No address provided"}
//                 </p>
//               </>
//             ) : (
//               <p className="text-xs text-gray-500">No contact info available</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Add CSS to hide scrollbar (can be placed in your global styles)
// const style = document.createElement("style");
// style.textContent = `
//   .scrollbar-hide::-webkit-scrollbar {
//     display: none;
//   }
// `;
// document.head.appendChild(style);

// // Helper Component
// const SectionItem = ({ title, content, status }) => (
//   <div className="px-6 py-2">
//     <div className="flex items-center justify-between">
//       <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
//       {status && (
//         <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
//           {status}
//         </span>
//       )}
//     </div>
//     <p className="text-gray-600 text-xs mt-1">{content}</p>
//   </div>
// );

// export default MedicalProfile;

import React, { useState, useEffect } from "react";

const MedicalProfile = ({ patientId }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const VITE_API = import.meta.env.VITE_API;

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${VITE_API}/patient-profiles/${patientId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setPatient(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError("Failed to fetch patient data. Please try again later.");
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-white p-4">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64 bg-white">
        <p className="text-gray-500">No patient data available</p>
      </div>
    );
  }

  return (
    // <div className="bg-black px-4 py-6 flex items-center justify-center">
    <div className="bg-white rounded-2xl shadow-md px-6 py-6 w-full mx-auto">
      <div className=" flex items-center  relative">
        <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mr-4 border-2 border-teal-100">
          <span className="text-teal-800 text-xl font-bold">
            {getInitials(patient.FullName)}
          </span>
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-medium text-gray-800">
            {patient.FullName}
          </h2>
          <p className="text-gray-500 text-sm">{patient.Gender}</p>
        </div>
      </div>

      <div className="mx-4 h-px bg-gray-200 my-4"></div>

      <div className="overflow-y-auto max-h-60">
        <SectionItem
          title="Address"
          content={patient.Address || "No address"}
        />
        <SectionItem title="Email" content={patient.Email || "No email"} />
        <SectionItem
          title="Phone"
          content={patient.PhoneNumber || "No phone"}
        />
        <SectionItem title="Allergies" content={patient.Allergies || "None"} />
        <SectionItem
          title="Personality Traits"
          content={patient.PersonalityTraits || "Not specified"}
        />
      </div>
    </div>
    // </div>
  );
};

const SectionItem = ({ title, content }) => (
  <div className="px-6 py-2 w-full mx-auto">
    <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
    <p className="text-gray-600 text-xs mt-1">{content}</p>
  </div>
);

export default MedicalProfile;
