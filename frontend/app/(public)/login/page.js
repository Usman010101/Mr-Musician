"use client"; // Ensure this component runs only on the client-side

import { FaEnvelope, FaLock, FaSpinner } from "react-icons/fa";
import { useState } from "react";
import Logo from "@/components/Logo/Logo";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import { useRouter } from "next/navigation"; // Correct for App Router
import axios from "axios"; // Import axios for API calls

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [islogging,setIslogging] = useState(false);
  
  const router = useRouter(); // Ensure useRouter is used in the correct context

  

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIslogging(true)
    // Basic email and password validation
    if (!email || !password) {
      setErrorMessage("Please fill in both email and password fields.");
      return;
    }
  
    if (!validateEmail(email)) {
      setErrorMessage("Invalid email format.");
      return;
    }
  
    try {
      // Call the custom backend login API
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true } // Include cookies in the request
      );
      

      console.log("Response",res)
  
      // Check for successful login (200 status)
      if (res.status === 200) {
        // Assuming the backend returns the user role
        const userRole = res.data.userType; // Assuming role is sent back
        console.log(userRole)
        if (userRole === "listener") {
           router.push("/home"); // Redirect to listener dashboard
        } else if (userRole === "artist") {
          router.push("/artist-dashboard"); // Redirect to artist dashboard
        } else if (userRole === "admin") {
          router.push("/signup"); // Redirect to admin dashboard
        }
      } else if (res.status === 400) {
        // Invalid credentials error
        setErrorMessage("Invalid credentials. Please check your email and password.");
      } else if (res.status === 500) {
        // Server error
        setErrorMessage("Server error. Please try again later.");
      } else {
        // Handle any other status codes that are unexpected
        setErrorMessage("Something went wrong. Please try again.");
      }
    } catch (error) {
      // Handle errors from the server or network issues
      if (error.response) {
        // Server responded with an error
        if (error.response.status === 400) {
          setErrorMessage("Invalid credentials. Please check your email and password.");
        } else if (error.response.status === 500) {
          setErrorMessage("Server error. Please try again later.");
        } else {
          setErrorMessage(error.response.data.error || "Something went wrong. Please try again.");
        }
      } else if (error.request) {
        // Request was made, but no response was received
        setErrorMessage("Server not responding. Please try again later.");
      } else {
        // Handle any other errors (e.g., network issues)
        setErrorMessage("An error occurred. Please try again later.");
      }
      console.error(error);
    }finally{
      setIslogging(false) 
    }
  };
  // Email validation function
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  return (
    <div className="background-login text-center">
      <div className="row mt-5 justify-content-center">
        <Logo />
        <h3 className="py-4">Login To Continue</h3>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-6 p-4 rounded">
          {/* Display error message */}
          {errorMessage && <div className="text-danger mb-3">{errorMessage}</div>}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3 text-start">
              <label htmlFor="email" className="form-label text-light">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                icon={<FaEnvelope />}
                value={email} // Bind email value
                onChange={(e) => setEmail(e.target.value)} // Update email state on change
              />
            </div>

            <div className="mb-5 text-start">
              <label htmlFor="password" className="form-label text-light">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                icon={<FaLock />}
                value={password} // Bind password value
                onChange={(e) => setPassword(e.target.value)} // Update password state on change
              />
            </div>

            {/* Submit Button */}
            <Button className="w-100 mt-3" type="submit" disabled={islogging}>
              {islogging ? <FaSpinner /> : "Login"}
            </Button>
          </form>
        </div>

        <div className="p-4 d-flex justify-content-evenly">
          <h6>Create a new account?</h6>
          <h6>Forgot Password?</h6>
        </div>
      </div>
    </div>
  );
}
