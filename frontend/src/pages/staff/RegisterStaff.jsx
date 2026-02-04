import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { lable, logo1 } from "../../assets/img";
import { registerStaff } from "../../redux/slices/staffSlice";

const RegisterStaff = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, validationErrors } = useSelector((state) => state.staff);

  const [formData, setFormData] = useState({
    name: "",
    father_name: "",
    username: "",
    address: "",
    phone: "",
    department: "",
    job_title: "",
    hospital_id: "", // ✅ correct backend field
    gender: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(registerStaff(formData));
    if (res.meta.requestStatus === "fulfilled") {
      navigate("/staff");
    }
  };

  const renderErrorMessages = () => {
    // First check for validation errors (from Laravel validation)
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      const allErrors = Object.values(validationErrors).flat();
      return (
        <div className="alert alert-danger text-center mb-4">
          <strong>Validation Errors:</strong>
          <ul className="mb-0 mt-2">
            {allErrors.map((errorMsg, index) => (
              <li key={index}>{errorMsg}</li>
            ))}
          </ul>
        </div>
      );
    }
    
    // Then check for general error
    if (error) {
      if (typeof error === "string") {
        return (
          <div className="alert alert-danger text-center mb-4">
            {error}
          </div>
        );
      }
      if (typeof error === "object") {
        const allErrors = Object.values(error).flat();
        return (
          <div className="alert alert-danger text-center mb-4">
            {allErrors.join(", ")}
          </div>
        );
      }
    }
    
    return null;
  };

  // Helper function to check if a specific field has error
  const getFieldError = (fieldName) => {
    if (validationErrors && validationErrors[fieldName]) {
      return validationErrors[fieldName][0];
    }
    return null;
  };

  return (
    <div>
      <div className="text-center p-3 container-md">
        <Link to="/">
          <img src={logo1} className="h-25 w-75 rounded" alt="Logo" />
        </Link>
      </div>

      <div id="intro-example" className="text-center bg-image align-items-center">
        <section>
          <div className="container h-100">
            <div className="row d-flex justify-content-center align-items-center h-100">
              <div className="col-lg-12 col-xl-11">
                <div className="card text-black" style={{ borderRadius: "25px" }}>
                  <div className="card-body p-md-5">
                    <div className="row justify-content-center">
                      <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
                        <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">
                          Staff Register Here
                        </p>

                        {/* Error Display Section */}
                        {renderErrorMessages()}

                        <form className="mx-1 mx-md-4" onSubmit={handleSubmit}>
                          {[
                            { name: "name", type: "text", placeholder: "Your Name" },
                            { name: "father_name", type: "text", placeholder: "Father Name" },
                            { name: "username", type: "text", placeholder: "Your Username" },
                            { name: "address", type: "text", placeholder: "Your Address" },
                            { name: "phone", type: "tel", placeholder: "Your Phone Number" },
                            { name: "department", type: "text", placeholder: "Your Department Name" },
                            { name: "job_title", type: "text", placeholder: "Your Job Title" },
                            { name: "hospital_id", type: "number", placeholder: "Your Hospital ID" },
                            { name: "email", type: "email", placeholder: "Your Email" },
                            { name: "password", type: "password", placeholder: "Password" },
                            { name: "password_confirmation", type: "password", placeholder: "Confirm Password" },
                          ].map((input, i) => {
                            const fieldError = getFieldError(input.name);
                            
                            return (
                              <div key={i} className="mb-4">
                                <div className="d-flex flex-row align-items-center">
                                  <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                                  <div className="form-outline flex-fill mb-0">
                                    <input
                                      {...input}
                                      className={`form-control ${fieldError ? 'is-invalid' : ''}`}
                                      value={formData[input.name]}
                                      onChange={handleChange}
                                      required
                                    />
                                  </div>
                                </div>
                                {fieldError && (
                                  <div className="text-danger small mt-1 ms-5">
                                    {fieldError}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          <div className="mb-4">
                            <div className="d-flex flex-row align-items-center">
                              <i className="fas fa-person fa-lg me-3 fa-fw"></i>
                              <div className="form-outline flex-fill mb-0">
                                <select
                                  name="gender"
                                  className={`form-control ${getFieldError('gender') ? 'is-invalid' : ''}`}
                                  value={formData.gender}
                                  onChange={handleChange}
                                  required
                                >
                                  <option value="">Your Gender</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                </select>
                              </div>
                            </div>
                            {getFieldError('gender') && (
                              <div className="text-danger small mt-1 ms-5">
                                {getFieldError('gender')}
                              </div>
                            )}
                          </div>

                          <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                            <button
                              className="btn btn-primary btn-lg"
                              type="submit"
                              disabled={isLoading}
                            >
                              {isLoading ? "Registering..." : "Register"}
                            </button>
                          </div>

                          <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                            <p className="small mb-0">
                              Already have an account?{" "}
                              <Link to="/login-staff">Login to your account</Link>
                            </p>
                          </div>
                        </form>
                      </div>

                      <div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                        <img src={lable} className="img-fluid rounded-4" alt="Sample" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RegisterStaff;