import { useState } from 'react'
import './css/App.css'
import FrontPage from './FrontPage.jsx'
import LoginModule from './LoginModule.jsx'
import ColorsAndFonts from './ColorsAndFonts.jsx'
import ProfileModule from './ProfileModule.jsx'
import User from "./assets/UserClass.js";
//ROUTER
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Link } from 'react-router-dom'


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  let [user, setUser] = useState(new User("John", "john.doe@example.com", "Doe", "johndoe","/src/assets/Brckett Logo.png", "1"))

  console.log(user);


  let res = isLoggedIn ? 
  (
    <Routes>
      <Route path='/dev' element={<ColorsAndFonts></ColorsAndFonts>}></Route>
      <Route path='/' element={<ProfileModule user={user}></ProfileModule>}></Route>
    </Routes>
  ) : (
   <Routes>
    <Route path='/dev' element={<ColorsAndFonts></ColorsAndFonts>}></Route>

    <Route path='/' element={<FrontPage></FrontPage>}></Route>
    <Route path='/loginReg' element={<LoginModule logInTrigger={()=>{setIsLoggedIn(true), console.log(isLoggedIn)}} setUserFunc={setUser}></LoginModule>}></Route>
    {/*
    <Route path='/Editor' element={}></Route>
    <Route path='/Schedules' element={}></Route>
    <Route path='/Groups' element={}></Route>
    <Route path='/Settings' element={}></Route>
    */}
    </Routes>
  )





  return (
    <>
      <BrowserRouter>
        {res}
      </BrowserRouter>
    </>
  )
}





export default App
