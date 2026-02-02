import { useState } from 'react'
import './css/App.css'
import LoginModule from './LoginModule.jsx'
import ColorsAndFonts from './ColorsAndFonts.jsx'
import ProfileModule from './ProfileModule.jsx'
import User from "./assets/UserClass.js";



function App() {
  const [count, setCount] = useState(0)

  var user = new User("John", "john.doe@example.com", "Doe", "johndoe","/assets/Brckett Logo.png", "1");
  //console.log(user);
  return (
    <>
      {/*<ProfileModule user={user}/>*/}
      <LoginModule apiUrl="http://localhost:5083/api/login"/>
      {/*<ColorsAndFonts />*/}
    </>
  )
}

export default App
