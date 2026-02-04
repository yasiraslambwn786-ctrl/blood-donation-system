import React, { useState } from "react";
import { lable, logo1 } from "../../assets/img";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginStaff } from "../../redux/slices/staffSlice";

function LoginStaff() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.staff);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginStaff(formData));
    if (res.meta.requestStatus === "fulfilled") {
      navigate("/staff"); // redirect after success
    }
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
                          Welcome Back Staff!
                        </p>

                        <form className="mx-1 mx-md-4" onSubmit={handleSubmit}>
                          <div className="d-flex flex-row align-items-center mb-4">
                            <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="Your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="d-flex flex-row align-items-center mb-4">
                            <i className="fas fa-lock fa-lg me-3 fa-fw"></i>
                            <div className="form-outline flex-fill mb-0">
                              <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          {error && (
                            <div className="alert alert-danger py-2 text-center">
                              {typeof error === "string" ? error : "Invalid credentials"}
                            </div>
                          )}

                          <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                            <button
                              name="login"
                              className="btn btn-primary btn-lg"
                              type="submit"
                              disabled={isLoading}
                            >
                              {isLoading ? "Logging in..." : "Login"}
                            </button>
                          </div>

                          <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                            <p className="small mb-0">
                              Don't have an account?{" "}
                              <Link to="/register-staff">Create an account</Link>
                            </p>
                          </div>
                        </form>
                      </div>

                      <div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                        <Link to="/request-donor">
                          <img src={lable} className="img-fluid rounded-4" alt="Sample" />
                        </Link>
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
}

export default LoginStaff;
