const axios = require('axios');
const { Router } = require('express');
const router = Router();

// Define a route to fetch art tutorials (both beginner and advanced)
router.get('/api/getArtTutorials', async (req, res) => {
    const API_KEY = 'AIzaSyDK2pp_ZBOGEV-BZt76whlzUYhaCJOAkEg';// Replace with your API key
    const beginnerQuery = 'Beginner art tutorials'; // Modify the search query as needed
    const advancedQuery = 'Advanced art tutorials'; // Modify the search query as needed

    // Make requests to the YouTube API for both beginner and advanced tutorials
    const beginnerRequest = axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
            key: API_KEY,
            q: beginnerQuery,
            type: 'video',
            part: 'snippet',
            maxResults: 5, // Adjust the number of results as needed
        },
    });

    const advancedRequest = axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
            key: API_KEY,
            q: advancedQuery,
            type: 'video',
            part: 'snippet',
            maxResults: 5, // Adjust the number of results as needed
        },
    });

    // Use Promise.all to wait for both requests to complete
    Promise.all([beginnerRequest, advancedRequest])
        .then(responses => {
            // Process and combine the video data from both responses
            const beginnerVideos = responses[0].data.items.map(item => ({
                title: item.snippet.title,
                description: item.snippet.description,
                videoId: item.id.videoId,
                thumbnailUrl: item.snippet.thumbnails.default.url,
                // Add more fields as needed
            }));

            const advancedVideos = responses[1].data.items.map(item => ({
                title: item.snippet.title,
                description: item.snippet.description,
                videoId: item.id.videoId,
                thumbnailUrl: item.snippet.thumbnails.default.url,
                // Add more fields as needed
            }));

            // Combine or process the video data as needed
            const combinedVideos = [...beginnerVideos, ...advancedVideos];

            // Send the formatted video data as a JSON response
            res.json(combinedVideos);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Error fetching art tutorials' });
        });
});

module.exports = router;