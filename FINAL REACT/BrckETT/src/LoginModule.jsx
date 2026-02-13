import "./css/LoginModule.css";
import React, { useState } from "react";
import { data, useNavigate } from "react-router-dom";
import User from "./js/UserClass";



function ifError(event, func)
    {
        let res = func;
        if(res !== undefined)
        {
            event.target.classList.add("errorBorder")
        }
        else
        {
            event.target.classList.remove("errorBorder")
        }
        ShowErrors()
    }

export default function LoginModule({logInTrigger, setUserDataFunc, setUserFunc, callAPIFunc}) 
{
    const navigate = useNavigate();
    const [logEmail, setLogEmail] = useState('')
    const [logPassword, setLogPassword] = useState('')

    const [regEmail, setRegEmail] = useState("")
    const [regUsername, setRegUsername] = useState("")
    const [regPasswd1, setRegPasswd1] = useState("")
    const [regPasswd2, setRegPasswd2] = useState("")
    const [regFName, setRegFName] = useState("")
    const [regLName, setRegLName] = useState("")


    function IsNullOrWhiteSpace(text){
        if(!text) return true;
        for(const ch of text){
            if(ch !== ' ' && ch !== '\t' && ch !== '\n'){
                return false;
            }
        }
        return true;
    }

    return (
        <div className="LoginModule">
            <div className="card">
                <div className="header">
                    <h2 id="LoginModuleHeader">Login</h2>
                </div>

                <div className="tabs">
                    <div className="tab active" onClick={switchForm('login')}>Login</div>
                    <div className="tab" onClick={switchForm('register')}>Registration</div>
                </div>


                <div className="forms">
                    <div id="login" className="form active">
                        <div className="input" id="loginName" ><input type="text" placeholder="Email" onInput={(e) => setLogEmail(e.target.value)} onChange={(e) => setLogEmail(e.target.value)} value={logEmail}></input></div>
                        <div className="input">
                            <input id="loginPass" type="password" placeholder="Password" onInput={(e) => setLogPassword(e.target.value)} onChange={(e) => setLogPassword(e.target.value)} value={logPassword}></input>
                            <span className="eye" onClick={togglePass('loginPass')}>👁</span>
                        </div>
                        <button onClick={LoginCheck}>Login</button>
                    </div>


                    <div id="register" className="form">
                        <div className="input"><input type="text" placeholder="First Name" value={regFName} onChange={(e)=> setRegFName(e.target.value)} onInput={(e) => { ifError(e, (CheckName(e.target)))}} ></input></div>
                        <div className="input"><input type="text" placeholder="Last Name" value={regLName} onChange={(e)=> setRegLName(e.target.value)} onInput={(e) => {ifError(e, (CheckName(e.target)))}}></input></div>
                        <div className="input"><input type="text" placeholder="Username" value={regUsername} onChange={(e)=> setRegUsername(e.target.value)} onInput={(e) => {ifError(e, (CheckName(e.target)))}}></input></div>
                        <div className="input"><input type="email" placeholder="Email" value={regEmail} onChange={(e)=> setRegEmail(e.target.value)} onInput={(e) => {ifError(e, (EmailFormatCheck()))}}></input></div>
                        <div className="input">
                            <input id="regPass" type="password" placeholder="Password" value={regPasswd1} onChange={(e)=> setRegPasswd1(e.target.value)} onInput={(e) => {ifError(e, (PasswordCheck()))}}></input>
                            <span className="eye" onClick={togglePass('regPass')}>👁</span>
                        </div>
                        <div className="input">
                            <input id="regPass2" type="password" placeholder="Password Again" value={regPasswd2} onChange={(e)=> setRegPasswd2(e.target.value)} onInput={(e) => {ifError(e, (PasswordConfirmationCheck()))}}></input>
                            <span className="eye" onClick={togglePass('regPass2')}>👁</span>
                        </div>
                        <div id="errorOutput"></div>
                        <button onClick={RegistryCheck}>Create account</button>
                    </div>
                </div>
            </div>
        </div>
    );


    async function RegistryCheck() 
    { 
        var error = [];
        
        error.push(EmptyFieldCheck() ? EmptyFieldCheck() : "");
        error.push(PasswordCheck() ? PasswordCheck() : "");
        error.push(PasswordConfirmationCheck() ? PasswordConfirmationCheck() : "");
        error.push(EmailFormatCheck() ? EmailFormatCheck() : "");
        error.push(CheckName(document.querySelectorAll("#register .input input")[0]) ? CheckName(document.querySelectorAll("#register .input input")[0]) : "");
        error.push(CheckName(document.querySelectorAll("#register .input input")[1]) ? CheckName(document.querySelectorAll("#register .input input")[1]) : "");
        error.push(CheckName(document.querySelectorAll("#register .input input")[2]) ? CheckName(document.querySelectorAll("#register .input input")[2]) : "");

        
        error = error.filter((e) => e != "")
        error = error.filter(item => item !== "");
        
        const field = document.querySelector("#errorOutput")
        if(error.length !=0)
            {
                alert(error[0])
            }
        else
            {
                try 
                {
                    //SET ADMIN ROLE TO SMTH DEFAULT WHEN WE HAVE IT ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                    let response = await callAPIFunc.callApiAsync('users', 'POST', {userId:0,userName:regUsername,email:regEmail,displayName:`${regFName}_${regLName}`,password:regPasswd1,role:"Admin",token:""}, true).then(data => {return data;})
                    response = await callAPIFunc.callApiAsync('login', 'POST', {email: regEmail, password: regPasswd1}, false).then(data => {return data;});
                    callAPIFunc.setToken(response);
                    let userData = await callAPIFunc.callApiAsync('AdvancedInfo', 'GET', null, true, response).then(data => {return data;});

                    setUserDataFunc(userData)
                    setUserFunc(new User(userData.userId, userData.userName, userData.email, userData.displayName, userData.password, userData.role, userData.token))
                    navigate("/")
                    logInTrigger(true)
                } 
                catch (error) 
                {
                    alert(error)
                }
            }
    }

    async function LoginCheck()
    {
        try 
        {
            //LOGIN & SAVE TOKEN
            let response = await callAPIFunc.callApiAsync('login', 'POST', {email: logEmail, password: logPassword}, false).then(data => {return data;});
            callAPIFunc.setToken(response);
            console.log(response);
            let userData = await callAPIFunc.callApiAsync('AdvancedInfo', 'GET', null, true, response).then(data => {return data;});
            setUserDataFunc(userData)
            setUserFunc(new User(userData.userId, userData.userName, userData.email, userData.displayName, userData.password, userData.role, userData.token))
            navigate("/")
            logInTrigger(true)
        } 
        catch (error) 
        {
            alert(error)
        } 
    }

}
    function switchForm(formID) {
        return () => {
            const loginForm = document.getElementById('login');
            const registerForm = document.getElementById('register');
            const tabs = document.getElementsByClassName('tab');
            if (formID === 'login') {
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
                tabs[0].classList.add('active');
                tabs[1].classList.remove('active');
                document.querySelector("#LoginModuleHeader").innerHTML = "Login"

                document.querySelector(".forms").style.height = "260px";
            } else {
                loginForm.classList.remove('active');
                registerForm.classList.add('active');
                tabs[0].classList.remove('active');
                tabs[1].classList.add('active');
                document.querySelector("#LoginModuleHeader").innerHTML = "Registration"

                document.querySelector(".forms").style.height = "500px";
            }
        };
    }
    function togglePass(inputID) {
        return () => {
            const passInput = document.getElementById(inputID);
            if (passInput.type === 'password') {
                passInput.type = 'text';
            }
            else {
                passInput.type = 'password';
            }
        };
    }

    function CheckName(element)
    {
        const name = element.value;
        const namePattern = /^[A-Za-záéíóöőúüűÁÉÍÓÖŐÚÜŰ_]+$/u;
        if (!namePattern.test(name)) {
            return "Name can only contain letters.";
        }
    }

    function EmptyFieldCheck()
    {
        //Empty field check
        var inputs = document.querySelectorAll("#register .input input");
        inputs.forEach(input => {
            if (input.value === "") {
                return "Please fill in all fields.";
            }
        });
    }
    
    function PasswordCheck()
    {;
        
        //Password check
        const passwordInput = document.getElementById("regPass");
        PasswordConfirmationCheck() ? document.getElementById("regPass2").classList.add("errorBorder") : document.getElementById("regPass2").classList.remove("errorBorder");


        if (passwordInput.value.length < 8) {
            return "Password must be at least 8 characters long.";
        }
        else if (!/\d/.test(passwordInput.value)) {
            return "Password must contain at least one number.";
        }
        else if (!/[!@#$%^&*_\.]/.test(passwordInput.value)) {
            return "Password must contain (!@#$%^&*.).";
        }
    }

    function PasswordConfirmationCheck()
    {
        //Password confirmation check
        const passwordInput = document.getElementById("regPass");
        const passwordInput2 = document.getElementById("regPass2");

        if (passwordInput.value == passwordInput2.value) {
            return undefined;
        }
        return "Passwords do not match.";
    }
    function EmailFormatCheck()
    {
        var inputs = document.querySelectorAll("#register .input input");
        //Email format check
        const emailInput = inputs[3];
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,3}$/;
        if (!emailPattern.test(emailInput.value)) {
            return "Please enter a valid email address.";
        }
    }
    

    function ShowErrors()
    {
        let error = [];
        
        error.push(PasswordCheck() ? PasswordCheck() : "");
        error.push(PasswordConfirmationCheck() ? PasswordConfirmationCheck() : "");
        error.push(EmailFormatCheck() ? EmailFormatCheck() : "");
        error.push(CheckName(document.querySelectorAll("#register .input input")[0]) ? CheckName(document.querySelectorAll("#register .input input")[0]) : "");
        error.push(CheckName(document.querySelectorAll("#register .input input")[1]) ? CheckName(document.querySelectorAll("#register .input input")[1]) : "");
        error.push(CheckName(document.querySelectorAll("#register .input input")[2]) ? CheckName(document.querySelectorAll("#register .input input")[2]) : "");

        error = error.filter((e) => e != "")
        error = error.filter(item => item !== "");
        
        const field = document.querySelector("#errorOutput")
        if(error.length !=0)
            {
                field.innerHTML = `${error[0]}`
            }
        else
            {
                field.innerHTML = ""
            }
    }