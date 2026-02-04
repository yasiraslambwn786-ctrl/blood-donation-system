import React, { useEffect, useMemo } from "react";
import { Footer, Navigation } from "../../components/common";
import { splash1 } from "../../assets/img";
import { useSelector } from "react-redux";

const ProfileStaff = ({ staffData: propStaffData }) => {
  const { staffData: reduxStaffData, isLoading, error } = useSelector(
    (state) => state.staff
  );

  // ✅ Priority: Prop → Redux → LocalStorage
  const staffData = useMemo(() => {
    const localData = localStorage.getItem("staffData");
    return (
      propStaffData ||
      reduxStaffData ||
      (localData ? JSON.parse(localData) : null)
    );
  }, [propStaffData, reduxStaffData]);

  useEffect(() => {
    console.log("🧩 Loaded Staff Profile Data:", staffData);
    
    // Debug: Show the exact structure
    if (staffData) {
      console.log("🔍 Top-level keys:", Object.keys(staffData));
      console.log("🔍 staffData.staff:", staffData?.staff);
      console.log("🔍 staffData.user:", staffData?.user);
      if (staffData.staff) {
        console.log("📋 Staff object keys:", Object.keys(staffData.staff));
      }
      if (staffData.user) {
        console.log("📋 User object keys:", Object.keys(staffData.user));
      }
    }
  }, [staffData]);

  // ✅ Handle loading/error/no data
  if (isLoading) {
    return (
      <div>
        <Navigation username="Loading..." profileColor="primary" />
        <div className="text-center mt-5">
          <h4>Loading staff profile...</h4>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navigation username="Error" profileColor="danger" />
        <div className="text-center mt-5">
          <h4 className="text-danger">
            Failed to load profile:{" "}
            {typeof error === "string" ? error : error.message || "Unknown error"}
          </h4>
        </div>
        <Footer />
      </div>
    );
  }

  if (!staffData) {
    return (
      <div>
        <Navigation username="No Data" profileColor="primary" />
        <div className="text-center mt-5">
          <h4>No staff data found. Please register or login first.</h4>
        </div>
        <Footer />
      </div>
    );
  }

  // ✅ Updated getField function that checks nested structure
  const getField = (...keys) => {
    if (!staffData) return null;
    
    // ✅ FIRST check staffData.staff object (profile data)
    if (staffData.staff) {
      for (const key of keys) {
        if (staffData.staff[key] !== undefined && staffData.staff[key] !== null && staffData.staff[key] !== "") {
          console.log(`✅ Found in staff: ${key} =`, staffData.staff[key]);
          return staffData.staff[key];
        }
      }
    }
    
    // ✅ THEN check staffData.user object (authentication data)
    if (staffData.user) {
      for (const key of keys) {
        if (staffData.user[key] !== undefined && staffData.user[key] !== null && staffData.user[key] !== "") {
          console.log(`✅ Found in user: ${key} =`, staffData.user[key]);
          return staffData.user[key];
        }
      }
    }
    
    // ✅ LAST check staffData directly (backward compatibility)
    for (const key of keys) {
      if (staffData[key] !== undefined && staffData[key] !== null && staffData[key] !== "") {
        console.log(`✅ Found in root: ${key} =`, staffData[key]);
        return staffData[key];
      }
    }
    
    console.log(`❌ Not found for keys:`, keys);
    return null;
  };

  const displayFields = [
    { label: "Full Name", value: getField("name", "full_name") },
    { label: "Father Name", value: getField("father_name") },
    { label: "Username", value: getField("username") },
    { label: "Gender", value: getField("gender") },
    { label: "Email", value: getField("email") },
    { label: "Phone", value: getField("phone", "phone_number") },
    { label: "Address", value: getField("address") },
    { label: "Department", value: getField("department") },
    { label: "Job Title", value: getField("job_title", "designation") },
    { label: "Hospital ID", value: getField("hospital_id", "hospitalId") },
  ];

  const name = getField("name", "full_name") || getField("username") || "Staff";

  return (
    <div>
      <Navigation username={name || "Staff"} profileColor="primary" />

      <section style={{ backgroundColor: "#eee" }} className="container mb-4">
        <div className="container py-5">
          <div className="row">
            {/* Left Profile Card */}
            <div className="col-lg-4">
              <div className="card mb-4">
                <div className="card-body text-center">
                  <img
                    src={splash1}
                    alt="avatar"
                    className="rounded-circle img-fluid"
                    style={{ width: "150px" }}
                  />
                  <h5 className="my-3">{name || "N/A"}</h5>
                  <p className="text-muted mb-1">
                    {getField("job_title", "designation") || "N/A"}
                  </p>
                  <p className="text-muted mb-4">
                    {getField("address") || "N/A"}
                  </p>
                  <div className="d-flex justify-content-center mb-2">
                    <button type="button" className="btn btn-primary">
                      Active
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-primary ms-1"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Profile Info */}
            <div className="col-lg-8">
              <div className="card mb-4">
                <div className="card-body">
                  {displayFields.map((field, i) => (
                    <div key={i}>
                      <div className="row">
                        <div className="col-sm-3">
                          <p className="mb-0 fw-semibold">{field.label}</p>
                        </div>
                        <div className="col-sm-9">
                          <p className="text-muted mb-0">
                            {field.value || "N/A"}
                          </p>
                        </div>
                      </div>
                      {i < displayFields.length - 1 && <hr />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Cards */}
              <div className="row">
                <div className="col-md-6">
                  <div className="card mb-4 mb-md-0">
                    <div className="card-body">
                      <p className="mb-4">
                        <span className="text-primary font-italic me-1">
                          assignment
                        </span>{" "}
                        Performance Overview
                      </p>
                      {[
                        { label: "Cure Patients", percent: 80 },
                        { label: "Operations", percent: 72 },
                        { label: "Appointments", percent: 89 },
                      ].map((item, i) => (
                        <div key={i}>
                          <p className="mb-1" style={{ fontSize: ".77rem" }}>
                            {item.label}
                          </p>
                          <div
                            className="progress rounded"
                            style={{ height: "5px" }}
                          >
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ width: `${item.percent}%` }}
                            ></div>
                          </div>
                          {i < 2 && <p className="mt-3"></p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card mb-4 mb-md-0">
                    <div className="card-body">
                      <p className="mb-4">
                        <span className="text-primary font-italic me-1">
                          Professional
                        </span>{" "}
                        Stats
                      </p>
                      {[
                        { label: "Supervised Students", percent: 80 },
                        { label: "Passed Students", percent: 72 },
                      ].map((item, i) => (
                        <div key={i}>
                          <p className="mb-1" style={{ fontSize: ".77rem" }}>
                            {item.label}
                          </p>
                          <div
                            className="progress rounded"
                            style={{ height: "5px" }}
                          >
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ width: `${item.percent}%` }}
                            ></div>
                          </div>
                          {i < 1 && <p className="mt-3"></p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProfileStaff;