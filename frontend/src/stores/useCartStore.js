import {create} from "zustand";
import {toast} from "react-hot-toast"
import axiosInstance from "../lib/axios.js";

export const useCartStore =create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,

  getCartItems: async () =>{
    try{
      const res = await axiosInstance.get("/cart");
      set({cart: res.data});
      get().calculateTotals();
    }
    catch(error){
      toast.error(error.response.data.message || "An error occured");
      set({cart: []});
    }
  },
  addToCart: async(product) =>{
    try{
      await axiosInstance.post("/cart", {productId: product._id});
      toast.success(`${product.name} was added to cart`);

      set((prevState) => {
        const existingItem = prevState.cart.find((item) => item._id === product._id);
        const newCart = existingItem? prevState.cart.map((item) => (item._id === product._id ? {...item, quantity: item.quantity + 1} : item))
        : [...prevState.cart, {...product, quantity: 1}]

        return {cart: newCart};
      });
      get().calculateTotals();
    }
    catch(error){
      toast.error(error.response.data.message || "An error occured");
    }
  },

  calculateTotals: () =>{
    const {cart, coupon} = get();

    const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    let total = subTotal;
    
    if(coupon){
      const discount = subTotal * (coupon.discountPercentage / 100);
      total = subTotal - discount;
    }
    
    set({subtotal: subTotal, total});
  },
  
  removeFromCart: async (productId, prdouctName) => {
    try{
      await axiosInstance.delete(`/cart`, {data: {productId}});
      set((prevState) => ({cart: prevState.cart.filter(item => item._id !== productId)}))
      get().calculateTotals();
      toast.success(`${prdouctName} was removed from the cart`)

    }
    catch(error){
      toast.error("Failed to delete the product")
    }
  },

  updateQuantity: async (productId, quantity, prdouctName) =>{
    if(quantity === 0){
      get().removeFromCart(productId, prdouctName);
      return
    }
    await axiosInstance.put(`/cart/${productId}`, {quantity})
    set((state) => ({
      cart: state.cart.map((item) => (item._id === productId ? {...item, quantity} : item)),
    }));
    get().calculateTotals()
  },

  clearCart: async () =>{
    set({cart: [], coupon: null, total: 0, subtotal: 0})
  },

  getMyCoupon: async () =>{
    try{
      const res = await axiosInstance.get("/coupons");
      set({coupon: res.data});
    }
    catch(error){
      console.log("Error fetching coupon", error);
    }
  },

  applyCoupon: async (code) =>{
    try{
      const res = await axiosInstance.post("/coupons/validate", {code});
      set({coupon: res.data, isCouponApplied: true});
      get().calculateTotals();
      toast.success("Coupon applied successfully");
    }
    catch(error){
      toast.error(error?.response?.data?.message || "Failed to apply coupon");
    }
  },

  removeCoupon: () =>{
    set({coupon: null, isCouponApplied: false});
    get().calculateTotals();
    toast.success("Coupon remove");
  }

}))
