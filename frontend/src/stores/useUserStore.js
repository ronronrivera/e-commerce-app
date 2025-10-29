import {create} from "zustand";
import axiosInstance from "../lib/axios";
import {toast} from "react-hot-toast";

export const useStore = create((set, get) =>({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({name, email, password, confirmPassword}) => {
    set({loading: true});
    
    if(password !== confirmPassword){ 
      set({loading: false})  
      return toast.error("Passwords do not match");
    }
    try{
      const res = await axiosInstance.post("/auth/signup", {name, email, password});
      set({user: res.data, loading: false});
      toast.success(`Welcome ${res.data.user.name.split(" ")[0]}`);
    }
    catch(error){
      set({loading: false});
      toast.error(error.response.data.message || "An error occured");
      set({user: null});
    }

  },
  login: async ({email, password}) => {
    set({loading: true});
    try{
      const res = await axiosInstance.post("/auth/login", {email, password});
      set({user: res.data, loading: false});
      toast.success(`Welcome back ${res.data.name.split(" ")[0]}`);
    }
    catch(error){
      set({loading: false});
      toast.error(error.response.data.message || "An error occured");
      set({user: null});
    }
  },

  logout: async () =>{
    try{
      await axiosInstance.post("/auth/logout");
      set({user: null});
    }
    catch(error){
      toast.error(error.response?.data?.message || "An error occured during logout");
    }
  },

  checkAuth: async () => {
    set({checkingAuth: true});

    try{
      const res = await axiosInstance.get("/auth/profile");
      set({user: res.data, checkingAuth: false});
    }
    catch(error){
      set({checkingAuth: false, user: null});
    }
  },
  
  refreshToken: async () => {
	// Prevent multiple simultaneous refresh attempts
	  if (get().checkingAuth) return;

		set({ checkingAuth: true });
		try {
			const response = await axiosInstance.post("/auth/refresh-token");
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
	},

}))

//TODO: IMPLEMENT THE AXIOS INTERCEPTORS FOR REFRESHING TOKENS 15m

let refreshPromise = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) =>{
    const originalRequest = error.config;
    if(error.response?.status === 401 && !originalRequest._retry){
      originalRequest._retry = true;

      try{
        //if refresh is already in progress, wait for it
        if(refreshPromise){
          await refreshPromise;
          return axiosInstance(originalRequest);
        }

        //start a new refresh token
        refreshPromise = useStore.getState().refreshToken();
        await refreshPromise;

        refreshPromise = null;

        return axiosInstance(originalRequest)
        
      }
      catch(error){
        //if refresh fails to redirect to Login or handle as needed
        useStore.getState().logout();
       
      }
    }
    return Promise.reject(error);
  }
)
