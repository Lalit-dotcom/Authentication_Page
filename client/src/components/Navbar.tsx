import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

function Navbar() {
  const navigate = useNavigate();
  const { userData, backendURL, setUserData, setIsLoggedIn } = useAppContext();

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(backendURL + "/api/auth/sendVerifyOTP");
      if (data.success) {
        navigate("/emailVerify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      if (error?.response?.data.message) {
        toast.error(error?.response?.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendURL + "/api/auth/logout");
      if (data.success) {
        setIsLoggedIn(false);
        setUserData(null);
        navigate("/");
      }
    } catch (error: any) {
      if (error?.response?.data.message) {
        toast.error(error?.response?.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
      <img src={assets.logo} alt="image" className="w-28 sm:w-32"></img>
      {userData ? (
        <div className="w-8 h-8 rounded-full flex justify-center items-center bg-black text-white relative group">
          {userData?.name?.[0]?.toUpperCase() || "U"}
          <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
              {!userData.isAccountVerified && (
                <li className="py-1 px-2 hover:bg-gray-200 cursor-pointer" onClick={sendVerificationOtp}>
                  Verify Email
                </li>
              )}
              <li
                className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10"
                onClick={logout}
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 cursor-pointer hover:bg-gray-100 transition-all"
          onClick={() => navigate("/login")}
        >
          Login <img src={assets.arrow_icon}></img>
        </button>
      )}
    </div>
  );
}

export default Navbar;
