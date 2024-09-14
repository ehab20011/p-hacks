import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SignupWorker from './components/SignupWorker';
import SignupRefugee from './components/SignupRefugee';
import RefugeePage from './components/RefugeePage';
import ChatSystem from './components/ChatSystem';
import PrivateRoute from './components/PrivateRoute'; // Import the PrivateRoute component

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup-worker" element={<SignupWorker />} />
                <Route path="/signup-refugee" element={<SignupRefugee />} />

                <Route
                  path="/refugeepage"
                  element={
                    <PrivateRoute>
                      <RefugeePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/chatsystem"
                  element={
                    <PrivateRoute>
                      <ChatSystem />
                    </PrivateRoute>
                  }
                />
            </Routes>
        </Router>
    );
}

export default App;
