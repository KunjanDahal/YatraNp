import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import backgroundImage from "../assets/images/bg.jpg";
import Spinner from "../components/spinner/LoadingSpinner";

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: undefined,
    password: undefined,
  });
  const [loading2, setLoading2] = useState(false);
  const { loading, error, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleGoogleLogin = (e) => {
    e?.preventDefault();
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleClick = async (e) => {
    e.preventDefault();
    dispatch({ type: "LOGIN_START" });

    if (!credentials.email || !credentials.password) {
      Swal.fire("Please enter your email and password", "", "error");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      Swal.fire("Please enter a valid email address", "", "error");
      return; // Add return statement to prevent the API call
    }
    
    try {
      setLoading2(true);
      const res = await axios.post("/api/auth/login", credentials, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data.details });
      setLoading2(false);
      
      if (res.data.isAdmin === true) {
        navigate("/admin");
      } else if (res.data.details.type === "financeManager") { // Changed == to ===
        navigate("/finance");
      } else if (res.data.isAdmin === false) {
        navigate("/");
      }
    } catch (err) {
      setLoading2(false);
      dispatch({ type: "LOGIN_FAILURE", payload: err.response?.data });
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.response?.data?.message || "Invalid credentials. Please try again.",
      });
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="py-32 lg:py-32">
        <div className="container mx-auto">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="relative mx-auto mt-[-5rem] max-w-[525px] overflow-hidden bg-transparent py-16 px-10 text-center sm:px-12 md:px-[60px]">
                <div className="mb-10 text-center md:mb-16">
                  <h2 className="text-5xl font-bold">LOGIN</h2>
                </div>
                <form>
                  <div className="mb-6">
                    <input
                      type="email"
                      placeholder="Email"
                      id="email"
                      name="email"
                      onChange={handleChange}
                      className="bordder-[#E9EDF4] w-full rounded-3xl focus:ring border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-[#41A4FF] focus-visible:shadow-none"
                    />
                  </div>
                  <div className="mb-9">
                    <input
                      type="password"
                      placeholder="Password"
                      id="password"
                      name="password"
                      onChange={handleChange}
                      className="bordder-[#E9EDF4] w-full rounded-3xl border focus:ring bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:border-[#41A4FF] focus-visible:shadow-none"
                    />
                  </div>
                  <div className="mb-10">
                    <button
                      disabled={loading}
                      onClick={handleClick}
                      className="w-full cursor-pointer rounded-3xl font-bold bg-[#41A4FF] text-center hover:bg-gray-600 py-3 px-5 text-white transition hover:bg-opacity-90"
                    >
                      Sign In
                    </button>
     <br />
     <br />
     <br />
     <br />

     <div className="login-container">
       
        
        <button 
  onClick={handleGoogleLogin}
  type="button" 
  className="w-full mt-4 cursor-pointer rounded-3xl border-none bg-[#4285f4] py-3 px-5 text-white transition hover:bg-opacity-90"
>
  Sign in with Google
</button>
    </div>


                  </div>
                </form>
                {loading && <Spinner />}

                <Link
                  to="/reset-password"
                  className="mb-2 inline-block text-base text-red-500 font-semibold cursor-pointer hover:text-primary hover:underline"
                >
                  Forget Password?
                </Link>
                <p className="text-base text-[#adadad]">
                  Not a member yet?
                  <Link
                    to="/register"
                    className="text-primary cursor-pointer hover:underline ms-2 font-bold"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;