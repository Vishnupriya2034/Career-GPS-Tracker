const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');

router.post('/api/roadmap', async (req, res) => {
  const { skills, goal } = req.body;
  if (!skills || !goal) return res.status(400).json({ error: 'Skills and goal are required' });

  const roadmap = generateRoadmap(skills, goal);
  const resources = await fetchResources(goal);
  roadmap.push(...resources.map(r => `Watch: ${r.title} (${r.url})`));
  const progress = trackProgress(skills);

  const user = new User({ skills, goal, roadmap, progress });
  await user.save();
  res.json({ userId: user._id, roadmap, progress });
});

router.get('/api/roadmap/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (user) res.json(user);
  else res.status(404).json({ error: 'User not found' });
});

function generateRoadmap(skills, goal) {
  let roadmap = [];
  if (goal.toLowerCase().includes('data analyst')) {
    if (!skills.includes('python')) roadmap.push('Learn Python Basics');
    if (!skills.includes('sql')) roadmap.push('Learn SQL for Data Analysis');
    roadmap.push('Complete a Data Analysis Course');
    roadmap.push('Build a Portfolio Project');
  } else {
    roadmap.push('Identify specific skills for ' + goal);
    roadmap.push('Explore online resources');
  }
  return roadmap;
}

function trackProgress(skills) {
  const totalSkills = ['python', 'sql', 'javascript', 'html'];
  const mastered = skills.filter(skill => totalSkills.includes(skill.toLowerCase())).length;
  return `Progress: ${((mastered / totalSkills.length) * 100).toFixed(2)}% (${mastered}/${totalSkills.length} skills mastered)`;
}

async function fetchResources(goal) {
  const apiKey = 'AIzaSyA01_zR_DM4PbWnYQOS3tbC8WYuGLXkDQY'; // Replace with your API key
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `${goal} tutorial`,
        type: 'video',
        key: apiKey,
        maxResults: 3
      }
    });
    return response.data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
  } catch (error) {
    console.error('YouTube API error:', error);
    return [];
  }
}

module.exports = router;