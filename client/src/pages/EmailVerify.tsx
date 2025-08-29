import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import React, { useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

const EmailVerify: React.FC = () => {
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;
  const { backendURL, isLoggedIn, userData, getUserData } = useAppContext();
  //Define the ref type
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      // If the current input is empty and we're not on the first input
      if (e.currentTarget.value === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      // If we're backspacing a character, clear the current input
      else if (e.currentTarget.value !== "") {
        e.currentTarget.value = "";
      }
    }
  };

  const handlePaste = (e: any) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char: any, index: any) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitHandler = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    try {
      e.preventDefault();

      // Filter out null refs and get values
      const otpArray = inputRefs.current
        .filter((ref): ref is HTMLInputElement => ref !== null)
        .map((ref) => ref.value);

      const otp = otpArray.join("");

      // Validate OTP length
      if (otp.length !== 6) {
        toast.error("Please enter a valid 6-digit OTP");
        return;
      }

      const { data } = await axios.post<VerifyEmailResponse>(
        `${backendURL}/api/auth/verifyEmail`,
        { otp }
      );

      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      // Proper TypeScript error handling
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  useEffect(() => {
     isLoggedIn && userData && userData.isAccountVerified && navigate("/")
  }, [isLoggedIn, userData])

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        src={assets.logo}
        onClick={() => navigate("/")}
        alt=""
        className="absolute left-5 sm-left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <form
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        onSubmit={onSubmitHandler}
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter the 6-digit code sent to your email id.
        </p>
        <div className="flex justify-between mb-8" onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                type="text"
                maxLength={1}
                key={index}
                required
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                ref={(e) => {
                  inputRefs.current[index] = e;
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInput(e, index)
                }
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleKeyDown(e, index)
                }
              ></input>
            ))}
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">
          Verify email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
