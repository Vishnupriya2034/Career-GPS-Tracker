import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [skills, setSkills] = useState('');
  const [goal, setGoal] = useState('');
  const [roadmap, setRoadmap] = useState([]);
  const [progress, setProgress] = useState('');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const skillsArray = skills.split(',').map(skill => skill.trim());
    const response = await axios.post('http://localhost:5000/api/roadmap', { skills: skillsArray, goal });
    setRoadmap(response.data.roadmap);
    setProgress(response.data.progress);
    setUserId(response.data.userId);
    localStorage.setItem('userId', response.data.userId);
  };

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:5000/api/roadmap/${userId}`)
        .then(response => {
          setRoadmap(response.data.roadmap);
          setProgress(response.data.progress);
        })
        .catch(err => console.error(err));
    }
  }, [userId]);

  return (
    <div className="container">
      <h1>Career Growth Planning System</h1>
      <form onSubmit={handleSubmit}>
        <label>Current Skills (comma-separated):</label>
        <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} required /><br />
        <label>Career Goal:</label>
        <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} required /><br />
        <button type="submit">Generate Roadmap</button>
      </form>
      <div className="roadmap">
        <h3>Your Roadmap:</h3>
        <ul>{roadmap.map((step, index) => <li key={index}>{step}</li>)}</ul>
      </div>
      <div className="progress">
        <h3>Progress Tracking:</h3>
        <p>{progress}</p>
      </div>
    </div>
  );
}

export default App;