import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SignupWorker from './components/SignupWorker';
import RefugeePage from './components/RefugeePage';
import ChatSystem from './components/ChatSystem';
import WorkerChatSystem from './components/WorkerChatSystem'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup-worker" element={<SignupWorker />} />
                <Route path="/refugeepage" element={<RefugeePage />} />
                <Route path="/chatsystem" element={<ChatSystem/>} />
                <Route path="/workerchatsystem" element={<WorkerChatSystem/>}/>
            </Routes>
        </Router>
    );
}

export default App;
