import { useState, type FormEvent } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

//Define interface for API response
interface ApiResponse {
  success: boolean;
  message?: string;
}

function Login() {
  const navigate = useNavigate();

  const { backendURL, setIsLoggedIn, getUserData } = useAppContext();

  const [state, setState] = useState<string>("Sign Up");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      axios.defaults.withCredentials = true; //to get the cookies also
      if (state === "Sign Up") {
        const { data } = await axios.post<ApiResponse>(
          backendURL + "/api/auth/register",
          {
            name,
            email,
            password,
          }
        );
        if (data.success) {
          setIsLoggedIn(true);
          getUserData();
          toast.success("Account created successsfully!");
          navigate("/");
        } else {
          toast.error(data.message || "Registration failed");
        }
      } else {
        const { data } = await axios.post<ApiResponse>(
          backendURL + "/api/auth/login",
          {
            email,
            password,
          }
        );
        if (data.success) {
          setIsLoggedIn(true);
          getUserData();
          toast.success("Logged in successfully!");
          navigate("/");
        } else {
          toast.error(data.message || "Login failed");
        }
      }
    } catch (error: any) {
      // Proper error handling
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
        <img
          src={assets.logo}
          onClick={() => navigate("/")}
          alt=""
          className="absolute left-5 sm-left-20 top-5 w-28 sm:w-32 cursor-pointer"
        />
        <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
          <h2 className="text-3xl font-semibold text-white text-center mb-3">
            {state === "Sign Up" ? "Create Account" : "Login"}
          </h2>
          <p className="text-center text-sm mb-6">
            {state === "Sign Up"
              ? "Create your account"
              : "Login to your account"}
          </p>
          <form onSubmit={onSubmitHandler}>
            {state === "Sign Up" && (
              <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                <img src={assets.person_icon} alt="person_icon" />
                <input
                  className="outline-none"
                  type="text"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  placeholder="Full Name"
                  disabled={isLoading}
                  autoFocus
                  required
                />
              </div>
            )}
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.mail_icon} alt="mail_icon" />
              <input
                className="outline-none"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                placeholder="Email id"
                disabled={isLoading}
                required
              />
            </div>
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.lock_icon} alt="lock_icon" />
              <input
                className="outline-none"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                disabled={isLoading}
                placeholder="Password"
                required
              />
            </div>
            <p
              className="mb-4 text-indigo-500 cursor-pointer"
              onClick={() => navigate("/resetPassword")}
            >
              Forgot Password?
            </p>
            <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 cursor-pointer text-white font-medium">
              {state}
            </button>
          </form>
          {state === "Sign Up" ? (
            <p className="text-gray-400 text-center text-xs mt-4">
              Already have an account?{" "}
              <span
                className="text-blue-400 cursor-pointer underline"
                onClick={() => setState("Login")}
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-gray-400 text-center text-xs mt-4">
              Don't have an account?{" "}
              <span
                className="text-blue-400 cursor-pointer underline"
                onClick={() => setState("Sign Up")}
              >
                Sign Up
              </span>
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default Login;
