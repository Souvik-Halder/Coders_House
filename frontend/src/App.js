import { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home/Home';
import Navigation from './components/shared/Navigation/Navigation';

import Authenticate from './pages/Authenticate/Authenticate';
import Activate from './pages/Activate/Activate';
import Rooms from './pages/Rooms/Rooms';
import { useSelector } from 'react-redux';
import { useLoadingWithRefresh } from './hooks/useLoadingWithRefresh';
import Loader from './components/shared/Loader/Loader';




function App() {
 

   const {loading}=useLoadingWithRefresh();


  return (
    loading? <Loader message="Loading, please wait.."/>:(
    <Router>
      <Navigation />
      <Routes>

        <Route path='/' exact element={<Home />} />
        {/* <Route path='/register'  element={<Register/>} />
      <Route path='/login'  element={<Login/>} /> */}

        <Route
          path="/authenticate"
          element={
            <GuestRoute >
              <Authenticate />
            </GuestRoute>
          } />

        <Route
          path="/activate"
          element={
            <SemiprotectedRoute>
              <Activate />
            </SemiprotectedRoute>
          } />

        <Route
          path="/rooms"
          element={
            <ProtectedRoute >
              <Rooms/>
            </ProtectedRoute>
          } />

      </Routes>


    </Router>
    )
  );
}

function GuestRoute({  children }) {
  const {isAuth}=useSelector((state)=>state.auth)
  //This is the new protected route configuration
  if (isAuth) {
    return <Navigate to="/rooms" replace />
  }
  return children
}

function SemiprotectedRoute({ children }) {
  const {user,isAuth}=useSelector((state)=>state.auth)


  if (!isAuth) {
    return <Navigate to="/" replace />
  }
  else if (isAuth && !user.activated) {
    return children
  }
  else {
    return <Navigate to="/rooms" replace />
  }
}

function ProtectedRoute({  children }) {
  const {user,isAuth}=useSelector((state)=>state.auth)

  if(isAuth && !user.activated){
    return <Navigate to="/activate" replace/>
  }
   if(!isAuth){
    return <Navigate replace to='/'/>
  }
  return children
}

export default App;
