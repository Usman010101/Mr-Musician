"use client"
import { FaEnvelope, FaLock, FaUserAlt, FaPhone } from 'react-icons/fa';
import { useState } from 'react';
import { useRouter } from 'next/navigation';  // Import useRouter for navigation
import Logo from "@/components/Logo/Logo";
import Input from "@/components/Input/Input";
import Button from '@/components/Button/Button';

export default function SignUp() {
    const [userType, setUserType] = useState('listener'); // listener or artist
    const [formData, setFormData] = useState({
        name: '',
        recognizedAs: '',
        email: '',
        password: '',
        phoneNo: ''
    });
    const [loading, setLoading] = useState(false);  // To manage loading state
    const [error, setError] = useState('');  // To handle errors
    const router = useRouter();  // Initialize useRouter for redirection

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { email, password, name, recognizedAs, phoneNo } = formData;

        // Basic validation
        if (!email || !password || (userType === 'artist' && (!name || !recognizedAs || !phoneNo))) {
            alert('Please fill out all required fields.');
            return;
        }

        // Payload to send to the API (add all fields for both types)
        const userPayload = {
            email,
            password,
            userType,
            ...(userType === 'artist' && { name, recognizedAs, phoneNo }),  // Include artist fields only for artist
        };

        setLoading(true);
        setError('');  // Reset any previous errors

        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userPayload),
            });

            const result = await response.json();

            if (response.ok) {
                // On success, redirect to the login page
                router.push('/login');
            } else {
                // Handle errors from the API
                setError(result.message || 'Something went wrong!');
            }
        } catch (error) {
            setError('Network error. Please try again later.');
        } finally {
            setLoading(false);  // Set loading to false once request is done
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    return (
        <div className="background-login text-center">
            <div className="row mt-5 justify-content-center">
                <Logo />
                <h3 className="py-4">Sign Up</h3>
            </div>

            <div className="row justify-content-center">
                <div className="col-md-6 p-4 rounded">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3 text-start">
                            <label htmlFor="email" className="form-label text-light">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                icon={<FaEnvelope />}
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3 text-start">
                            <label htmlFor="password" className="form-label text-light">Password</label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                icon={<FaLock />}
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {/* User Type Selection */}
                        <div className="mb-3 text-start">
                            <label htmlFor="user-type" className="form-label text-light">Select User Type</label>
                            <select
                                id="user-type"
                                className="form-select"
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                            >
                                <option value="listener">Listener</option>
                                <option value="artist">Artist</option>
                            </select>
                        </div>

                        {/* Conditional form fields for artists */}
                        {userType === 'artist' && (
                            <>
                                <div className="mb-3 text-start">
                                    <label htmlFor="name" className="form-label text-light">Name</label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter your name"
                                        icon={<FaUserAlt />}
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-3 text-start">
                                    <label htmlFor="recognizedAs" className="form-label text-light">Recognized As</label>
                                    <Input
                                        id="recognizedAs"
                                        type="text"
                                        placeholder="Enter how you're recognized (stage name, etc.)"
                                        icon={<FaUserAlt />}
                                        value={formData.recognizedAs}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-3 text-start">
                                    <label htmlFor="phoneNo" className="form-label text-light">Phone Number</label>
                                    <Input
                                        id="phoneNo"
                                        type="text"
                                        placeholder="Enter your phone number"
                                        icon={<FaPhone />}
                                        value={formData.phoneNo}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}

                        {/* Display loading spinner or error message */}
                        {loading ? (
                            <Button className="w-100 mt-3" type="button" disabled>
                                Signing Up...
                            </Button>
                        ) : (
                            <Button className="w-100 mt-3" type="submit">Sign Up</Button>
                        )}
                        
                        {error && <p className="text-danger mt-3">{error}</p>}
                    </form>
                </div>
            </div>

            <div className="p-4 d-flex justify-content-evenly mb-4">
                <h6>Already have an account? <a href="/login">Login</a></h6>
            </div>
        </div>
    );
}
