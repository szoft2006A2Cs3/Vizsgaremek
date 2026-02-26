import { useState, useEffect } from 'react'
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
import UserDataClass from './js/UserDataClass.js';
import GroupSelector from './GroupSelector.jsx'
//ROUTER
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';


function App() {
  //localStorage.removeItem('token'); // teszt miatt token törlése induláskor, hogy mindig a localStorage-ból töltse be a beállításokat, ha nincs token vagy érvénytelen token
  //localStorage.removeItem('theme'); // teszt miatt theme törlése induláskor, hogy mindig a localStorage-ból töltse be a beállításokat, ha nincs token vagy érvénytelen token
  //localStorage.removeItem('navbarCollapse'); // teszt miatt navbarCollapse törlése induláskor, hogy mindig a localStorage-ból töltse be a beállításokat, ha nincs token vagy érvénytelen token
  

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  //Singleton API hívást intező osztály
  const [callAPIInstance, setCallAPIInstance] = useState(new ApiCaller());
  const [user, setUser] = useState(new User(0,"john","john@mail.com","johnny","passwd","admin","token","empty description"));
  //Singleton osztály, a felhasználó struktúráját tartalmazza
  const [userData, setUserData] = useState(null);
  const [activeForm, setActiveForm] = useState('login'); // 'login' v 'register'
  //console.log(user);

  useEffect(() => {
    const initializeApp = async () => {
      //token betoltes es auto-login megkiserlese
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        callAPIInstance.setToken(savedToken);
        try {
          const userDataResponse = await callAPIInstance.callApiAsync('AdvancedInfo', 'GET', null, true, savedToken);
          const userDataObj = new UserDataClass(userDataResponse);
          setUserData(userDataObj);
          setUser(new User(
            userDataResponse.userId,
            userDataResponse.userName,
            userDataResponse.email,
            userDataResponse.displayName,
            userDataResponse.password,
            userDataResponse.role,
            userDataResponse.token,
            userDataResponse.description
          ));
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Auto-login failed:', error);
          localStorage.removeItem('token'); // helytelen token törlése
          // nincs userdata, localStorage-ból töltünk
          applySettingsFromLocalStorage();
        }
      } else {
        // nincs token, localStorage-ból töltünk
        applySettingsFromLocalStorage();
      }
    };

    initializeApp();
  }, []);

  //settings betoltese userData-bol, ha valtozik
  useEffect(() => {
    if (userData?.userSettings?.settings) {
      // Priority 1   ---    Use userData.userSettings 
      const settings = userData.userSettings.settings.split('/');
      const theme = settings[0] || 'light-mode';
      const navbarHidden = settings[1] === 'true';

      //Tema
      document.body.classList.remove('light-mode', 'dark-mode');
      document.body.classList.add(theme);
      
      //Navbar
      if (navbarHidden) {
        document.body.classList.add('collapse-on');
      } else {
        document.body.classList.remove('collapse-on');
      }
      //console.log('Applied settings from userData:', { theme, navbarHidden });
    }
  }, [userData]);

  //localstorage-bol betolto function
  function applySettingsFromLocalStorage() {
    //console.log('Applying settings from localStorage');
    const savedTheme = localStorage.getItem('theme') || 'light-mode';
    document.body.classList.add(savedTheme);
    const savedNavbarCollapse = localStorage.getItem('navbarCollapse') === 'true';
    if (savedNavbarCollapse) {
      document.body.classList.add('collapse-on');
    } else {
      document.body.classList.remove('collapse-on');
    }
  }

  async function fetchUserData() 
  {
    try {
          const userDataResponse = await callAPIInstance.callApiAsync('AdvancedInfo', 'GET', null, true, callAPIInstance._token);
          if (userDataResponse?.token) {
            callAPIInstance.setToken(userDataResponse.token);
            localStorage.setItem('token', userDataResponse.token);
          }
          setUserData(new UserDataClass(userDataResponse));
          setUser(new User(
            userDataResponse.userId,
            userDataResponse.userName,
            userDataResponse.email,
            userDataResponse.displayName,
            userDataResponse.password,
            userDataResponse.role,
            userDataResponse.token,
            userDataResponse.description
          ));
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  }


  function getUserData() 
  {
    if (userData === null) return user;
    //keruljuk a setstate hivasat renderelest alatt - adjunk vissza egy derived User instance 
    return userData.user;
  }

  let res = isLoggedIn ? 
  (
    <>
      <NavModule links={{home:"/",about:"/about",contact:"/contact",profile:"/profile"}} profileLetter={userData.user.displayName.substring(0,1).toUpperCase()}></NavModule>
      <Routes>
        <Route path='/dev' element={<ColorsAndFonts></ColorsAndFonts>}></Route>
        <Route path='/' element={<ProfileModule user={getUserData()} logInTrigger={(e) => setIsLoggedIn(e)} setUserFunc={(e) => setUser(e)} setUserDataFunc={(e) => setUserData(new UserDataClass(e))} hasNotifications={userData.hasNotifications()} fetchUserDataFunc={fetchUserData}></ProfileModule>}></Route>
        <Route path='/Schedules' element={<CalendarView fetchUserDataFunc={fetchUserData} LayoutSettings={userData.userSettings.settings.split("/")[2]} callAPIFunc={callAPIInstance} schedulesList={userData.schedules} userData={userData}></CalendarView>}></Route>
        <Route path='/about' element={<About></About>}></Route>
        <Route path='/contact' element={<ContactUs></ContactUs>}></Route>
        <Route path='/profile' element={<ProfileDescriptionModule user={getUserData()} setUserDataFunc={(e) => setUserData(new UserDataClass(e))}></ProfileDescriptionModule>}></Route>
        <Route path='/Settings' element={<SettingsModule callAPIFunc={callAPIInstance} userData={userData} fetchUserDataFunc={fetchUserData}></SettingsModule>}></Route>
        <Route path='/Groups' element={<GroupSelector groupList={userData.groups}></GroupSelector>}></Route>
      </Routes>
    </>
  ) : (
    <>
      <NavModule setActiveForm={setActiveForm} links={{home:"/",about:"/about",contact:"/contact",profile:"/loginReg"}} ></NavModule>
      <Routes>
        <Route path='/dev' element={<ColorsAndFonts></ColorsAndFonts>}></Route>
        <Route path='/' element={<FrontPage></FrontPage>}></Route>
        <Route path='/about' element={<About></About>}></Route>
        <Route path='/contact' element={<ContactUs></ContactUs>}></Route>
        <Route path='/loginReg' element={<LoginModule activeForm={activeForm} logInTrigger={(e)=>setIsLoggedIn(e)} setUserDataFunc={(e) => setUserData(new UserDataClass(e))} setUserFunc={(e) => setUser(e)} callAPIFunc={callAPIInstance}></LoginModule>}></Route>  
      </Routes>
      <FooterModule setActiveForm={setActiveForm}></FooterModule>
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
