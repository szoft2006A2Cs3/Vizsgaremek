import { useState } from 'react'
import './css/App.css'
import FrontPage from './FrontPage.jsx'
import LoginModule from './LoginModule.jsx'
import ColorsAndFonts from './ColorsAndFonts.jsx'
import ProfileModule from './ProfileModule.jsx'
import User from "./js/UserClass.js";
import ApiCaller from "./js/call-api.js";
import ClickAnimation from './ClickAnimation.jsx';
import NavModule from './NavModule.jsx'
import FooterModule from './FooterModule.jsx'

//ROUTER
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Link } from 'react-router-dom'


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [callAPIInstance, setCallAPIInstance] = useState(new ApiCaller());
  let [user, setUser] = useState(new User("John", "john.doe@example.com", "Doe", "johndoe","/src/assets/Brckett Logo.png", "1"))
  //console.log(user);
  

  let res = isLoggedIn ? 
  (
    <>
      <NavModule></NavModule>
      <Routes>
        <Route path='/dev' element={<ColorsAndFonts></ColorsAndFonts>}></Route>
        <Route path='/' element={<ProfileModule user={user} logInTrigger={(e)=>setIsLoggedIn(e)} setUserFunc={(e) => setUser(e)}></ProfileModule>}></Route>
      </Routes>
      <FooterModule></FooterModule>
    </>
  ) : (
    <>
      <NavModule></NavModule>
      <Routes>
        <Route path='/dev' element={<ColorsAndFonts></ColorsAndFonts>}></Route>

        <Route path='/' element={<FrontPage></FrontPage>}></Route>
        <Route path='/loginReg' element={<LoginModule logInTrigger={(e)=>setIsLoggedIn(e)} setUserFunc={(e) => setUser(e)} callAPIFunc={callAPIInstance}></LoginModule>}></Route>
        {/*
        <Route path='/Editor' element={}></Route>
        <Route path='/Schedules' element={}></Route>
        <Route path='/Groups' element={}></Route>
        <Route path='/Settings' element={}></Route>
        */}
        </Routes>
        <FooterModule></FooterModule>
    </>
  )


  return (
    <>
      <ClickAnimation></ClickAnimation>
      <BrowserRouter>
        
          {res}

      </BrowserRouter>
    </>
  )
}

export default App
