// import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from './components/Login';
import Email from './components/Email';
import Signup from './components/Signup';
import Home from './components/Home';


function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/signup' element={<Signup />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/email' element={<Email />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App