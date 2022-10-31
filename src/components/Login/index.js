import './login.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Login() {

    const [errorMessages, setErrorMessages] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);


    const renderErrorMessage = (name) => {
        name === errorMessages.name && (
            <div className="error">{errorMessages.message}</div>
        );
    }

    const database = [
        {
            username: "user1",
            password: "pass1"
        },
        {
            username: "user2",
            password: "pass2"
        }
    ];

    const errors = {
        uname: "invalid username",
        pass: "invalid password"
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        var { uname, pass } = document.forms[0];

        // Find user login info
        const userData = database.find((user) => user.username === uname.value);

        // Compare user info
        if (userData) {
            if (userData.password !== pass.value) {
                // Invalid password
                setErrorMessages({ name: "pass", message: errors.pass });
            } else {
                setIsSubmitted(true);
            }
        } else {
            // Username not found
            setErrorMessages({ name: "uname", message: errors.uname });
        }
    };

    const renderForm = (
        <div className="form">
            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    <input className='textinput' type="text" name="uname" required placeholder='Email address' />
                    {renderErrorMessage("uname")}
                </div>
                <div className="input-container">
                    <input className='textinput' type="password" name="pass" required placeholder='Password' />
                    {renderErrorMessage("pass")}
                </div>
                <div className='checkbox'>
                    <p>Forgot password?</p>
                </div>
                <div className="button-container">
                    <input className="sumbit" type="submit" value="Login" />
                </div>
            </form>
        </div>
    );

    return (
        <div className="login">
            <div className='main_login'>
                <Link to='/' className='return'>
                    <i className='fa fa-arrow-left'></i>
                    <span> Return to homepage</span>
                </Link>
                <div className='main_content'>
                    <div className='left_page'>
                        <img src='./logo3.png' alt="" />
                        <div className='left_page_cotent'>
                            <h2>Welcome</h2>
                            <p>Login to your account below</p>
                            {isSubmitted ? <div>User is successfully logged in</div> : renderForm}
                        </div>
                    </div>
                    <div className='right_page'>
                        <div className='first_title'>
                            <h1>Have you signed up?</h1>
                            <p>Applying for easy online access and save your bathroom design.</p>
                        </div>
                        <div className='second_title'>
                            <h3>Trade Account</h3>
                            <a>Apply now</a>
                        </div>
                        <div className='three_title'>
                            <h3>Personal Account</h3>
                            <p>For non-trade customers</p>
                            <ul>
                                <li>Save and get a quote on your design.</li>
                                <li>See your past purchases</li>
                            </ul>
                            <Link to='/register'>Register now</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}