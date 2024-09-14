import React, { useState } from 'react';
import './styles/SignupWorker.css';

const SignupWorker = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [camp, setCamp] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [idNumber, setIdNumber] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add password matching logic
        /*if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }*/

        // For now, just consoling it
        console.log('First Name:', firstName);
        console.log('Last Name:', lastName);
        console.log('Camp:', camp);
        console.log('Date of Birth:', dateOfBirth);
        console.log('Gender:', gender);
        console.log('Phone Number:', phoneNumber);
        console.log('Job Title:', jobTitle);
        console.log('ID Number:', idNumber);

        // We need to send requet to the backend API for registration
    };

    return (
        <div className="signup-worker-container">
            <h2>Refugee Worker Signup</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>First Name</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Last Name</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Camp No.</label>
                    <input
                        type="text"
                        value={camp}
                        onChange={(e) => setCamp(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Date of Birth</label>
                    <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Gender</label>
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Job Title/Role</label>
                    <select
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        required
                    >
                        <option value="">Select Job Title</option>
                        <option value="doctor">Doctor</option>
                        <option value="nurse">Nurse</option>
                        <option value="paramedic">Paramedic</option>
                        <option value="logistics-coordinator">Logistics Coordinator</option>
                        <option value="camp-manager">Camp Manager</option>
                        <option value="food-distribution">Food Distribution Coordinator</option>
                        <option value="sanitation-worker">Sanitation Worker</option>
                        <option value="security-personnel">Security Personnel</option>
                    </select>
                </div>
                <div>
                    <label>ID Number</label>
                    <input
                        type="text"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default SignupWorker;
