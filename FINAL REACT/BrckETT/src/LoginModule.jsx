import "./css/LoginModule.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import User from "./assets/UserClass";



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

export default function LoginModule({logInTrigger, setUserFunc}) 
{
    const navigate = useNavigate();
    const [logEmail, setLogEmail] = useState('')
    const [logPassword, setLogPassword] = useState('')


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
                    <h2>Login</h2>
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
                        <div className="input"><input type="text" placeholder="First Name" onInput={(e) => { ifError(e, (CheckName(e.target)))}} ></input></div>
                        <div className="input"><input type="text" placeholder="Last Name" onInput={(e) => {ifError(e, (CheckName(e.target)))}}></input></div>
                        <div className="input"><input type="text" placeholder="Username" onInput={(e) => {ifError(e, (CheckName(e.target)))}}></input></div>
                        <div className="input"><input type="email" placeholder="Email" onInput={(e) => {ifError(e, (EmailFormatCheck()))}}></input></div>
                        <div className="input">
                            <input id="regPass" type="password" placeholder="Password" onInput={(e) => {ifError(e, (PasswordCheck()))}}></input>
                            <span className="eye" onClick={togglePass('regPass')}>👁</span>
                        </div>
                        <div className="input">
                            <input id="regPass2" type="password" placeholder="Password Again" onInput={(e) => {ifError(e, (PasswordConfirmationCheck()))}}></input>
                            <span className="eye" onClick={togglePass('regPass2')}>👁</span>
                        </div>
                        <div id="errorOutput"></div>
                        <button onClick={RegistryCheck}>Create account</button>
                    </div>
                </div>
            </div>
        </div>
    );


    function RegistryCheck() 
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
                    //CREATE ACCOUNT, FETCH ITS OWN TOKEN TOO
                    
                    setUserFunc(new User())
                    navigate("/")
                    logInTrigger()
                } 
                catch (error) 
                {
                    alert(error)
                }
            }
    }

    function LoginCheck()
    {
        try 
        {
            //LOGIN & SAVE TOKEN

            setUserFunc(new User())
            navigate("/")
            logInTrigger()
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

                document.querySelector(".forms").style.height = "260px";
            } else {
                loginForm.classList.remove('active');
                registerForm.classList.add('active');
                tabs[0].classList.remove('active');
                tabs[1].classList.add('active');

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
        const namePattern = /^[A-Za-z]+$/;
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
        else if (!/[!@#$%^&*\.]/.test(passwordInput.value)) {
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

    



