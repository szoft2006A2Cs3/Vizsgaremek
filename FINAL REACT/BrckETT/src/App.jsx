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
import CalendarView from './CalendarView.jsx'
import About from './About.jsx'
import ContactUs from './ContactUs.jsx'
import ProfileDescriptionModule from './ProfileDescriptionModule.jsx'
import SettingsModule from './SettingsModule.jsx'

//ROUTER
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Link } from 'react-router-dom'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [callAPIInstance, setCallAPIInstance] = useState(new ApiCaller());
  let [user, setUser] = useState(new User(0,"john","john@mail.com","johnny","passwd","admin","token","empty description"));
  let [userData, setUserData] = useState(null);
  //console.log(user);
  function getUserData() 
  {
    if (userData === null) return user;
    // Avoid calling setState during render — return a derived User instance instead
    return new User(
      userData.userId,
      userData.userName,
      userData.email,
      userData.displayName,
      userData.password,
      userData.role,
      userData.token,
      userData.description
    );
  }

  let res = isLoggedIn ? 
  (
    <>
      <NavModule links={{home:"/",about:"/about",contact:"/contact",profile:"/profile"}} profileLetter={user.displayName.substring(0,1).toUpperCase()}></NavModule>
      <Routes>
        <Route path='/dev' element={<ColorsAndFonts></ColorsAndFonts>}></Route>
        <Route path='/' element={<ProfileModule user={getUserData()} logInTrigger={(e) => setIsLoggedIn(e)} setUserFunc={(e) => setUser(e)} setUserDataFunc={(e) => setUserData(e)}></ProfileModule>}></Route>
        <Route path='/Schedules' element={<CalendarView></CalendarView>}></Route>
        <Route path='/about' element={<About></About>}></Route>
        <Route path='/contact' element={<ContactUs></ContactUs>}></Route>
        <Route path='/profile' element={<ProfileDescriptionModule user={getUserData()} setUserDataFunc={(e) => setUserData(e)}></ProfileDescriptionModule>}></Route>
        <Route path='/Settings' element={<SettingsModule userData={userData} setUserDataFunc={(e) => setUserData(e)}></SettingsModule>}></Route>
      </Routes>
    </>
  ) : (
    <>
      <NavModule links={{home:"/",about:"/about",contact:"/contact",profile:"/loginReg"}} ></NavModule>
      <Routes>
        <Route path='/dev' element={<ColorsAndFonts></ColorsAndFonts>}></Route>
        <Route path='/' element={<FrontPage></FrontPage>}></Route>
        <Route path='/about' element={<About></About>}></Route>
        <Route path='/contact' element={<ContactUs></ContactUs>}></Route>
        <Route path='/loginReg' element={<LoginModule logInTrigger={(e)=>setIsLoggedIn(e)} setUserDataFunc={(e) => {setUserData(e); console.log(userData)}} setUserFunc={(e) => setUser(e)} callAPIFunc={callAPIInstance}></LoginModule>}></Route>
        
        {/*
        <Route path='/Editor' element={}></Route>
        
        <Route path='/Groups' element={}></Route>
        */}
        </Routes>
        <FooterModule></FooterModule>
    </>
  )
  document.body.classList.add("dark-mode");

  return (
    <>
      <ClickAnimation></ClickAnimation>
      {/*THERE IS A PINK BUTTON ON SCREEN ALWAYS TO CHANGE LIGHT/DARK MODE FOR TESTING
      <button style={{position: "absolute", background: "pink", height: "2rem", width: "5rem", top: "5rem", right: "5rem", zIndex: 100}} onClick={() => {
        document.body.classList.toggle("light-mode");
        document.body.classList.toggle("dark-mode");
      }}></button>*/}
      <BrowserRouter>
        
          {res}

      </BrowserRouter>
    </>
  )
}

export default App
