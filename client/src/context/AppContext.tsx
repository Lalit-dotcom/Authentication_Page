import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "react-toastify";

//Define types for your context
export interface UserData {
  _id?: string;
  name?: string;
  email?: string;
  isAccountVerified?: boolean;
}

export interface AppContextType {
  backendURL: string;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  userData: UserData | null;
  setUserData: (userData: UserData | null) => void;
  getUserData: () => Promise<void>;
}

//Create context with typescript type
export const AppContext = createContext<AppContextType | undefined>(undefined);

//Define props for the Provider
interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({
  children,
}) => {

  axios.defaults.withCredentials = true;
  const backendURL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const getAuthState = async () => {
    try {
      const { data } = await axios.get(
        backendURL + "/api/auth/isAuthenticated"
      );
      if (data.success) {
        setIsLoggedIn(true);
        getUserData();
      }
    } catch (error: any) {
      if (error?.response?.data.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const getUserData = async () => {
    try {
      const { data } = await axios.get(backendURL + "/api/user/userDetails");
      data.success ? setUserData(data.userData) : toast.error(data.message);
    } catch (error: any) {
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
    getAuthState();
  }, []);

  const value = {
    backendURL,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }

  return context;
};
