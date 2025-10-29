import React, {useEffect} from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import LoadingSpinner from './Components/LoadingSpinner';
import AdminPage from "./pages/AdminPage"
import Unauthorized from "./Components/Unauthorized";
import CategoryPage from "./pages/CategoryPage";
import CartPage from './pages/CartPage';
import { useCartStore } from './stores/useCartStore';
import PurchaseSuccessPage from './pages/PurchaseSuccessPage';
import PurchaseCancelPage from './pages/PurchaseCancelPage'

import Navbar from './Components/Navbar';

import { Toaster } from 'react-hot-toast';

import  {useStore}  from './stores/useUserStore';

const App = () => {
  
  const {user, checkAuth, checkingAuth} = useStore();
  const {getCartItems} = useCartStore();

  useEffect(() =>{
    checkAuth();
  },[checkAuth])

  useEffect(() =>{
    if(user){
      getCartItems();
    }
  },[getCartItems, user]);

  if(checkingAuth) return <LoadingSpinner/>

  return (
    <div className='min-h-screen bg-gray-900 text-white relative flex flex-col'>
      {/* Background gradient - covers entire screen */}
      <div className='fixed inset-0 bg-gray-900'>
        <div className='absolute inset-0'>
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,180,140,0.4)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]' />
        </div>
      </div>
      
      {/* Content area that grows to fill space */}
      <div className='relative z-50 flex-1 pt-20'> 
        <Navbar/>
        <Routes>
          <Route path='/' element={user? <HomePage/> : <Navigate to='/login'/>}/> 
          <Route path='/signup' element={!user? <SignupPage/> : <Navigate to='/'/>} /> 
          <Route path='/login' element={!user? <LoginPage/> : <Navigate to='/'/>}/> 
          <Route path='/unauthorized' element={user?.role === "customer" ? <Unauthorized/> : <Navigate to='/'/>}/>
          <Route path='/admin-page' element={user?.role === "admin"? <AdminPage/> : <Navigate to='/unauthorized'/>}/> 


          <Route path='/category/:category' element={<CategoryPage/>}/> 
          <Route path='/cart' element={user? <CartPage/> : <Navigate to='/login'/>}/> 
          
          <Route path='/purchase-success' element={user? <PurchaseSuccessPage/> : <Navigate to='/login'/>}/> 
          <Route path='/purchase-cancel' element={user? <PurchaseCancelPage/> : <Navigate to='/login'/>}/> 

        </Routes>
      </div>
      <Toaster/>
    </div>
  )
}

export default App 
