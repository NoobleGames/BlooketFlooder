// src/server.js
import express from 'express';  // Using import instead of require
import cors from 'cors';
import axios from 'axios';
import bsid from './bsid.js';  // Ensure the correct path to bsid.js
import join from './join.js';  // Ensure the correct path to join.js

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve the HTML form
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Blooket Bot Creator</title>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Roboto', sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background-color: #e9ecef;
                margin: 0;
                padding: 0;
                color: #333;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                width: 90%;
                max-width: 400px;
                text-align: center;
                position: relative;
                overflow: hidden;
                border: 1px solid #007bff;
            }
            h1 {
                margin-bottom: 20px;
                color: #007bff;
            }
            label {
                display: block;
                margin: 15px 0 5px;
                font-weight: 500;
                text-align: left;
            }
            input {
                width: 100%;
                padding: 12px;
                margin-bottom: 15px;
                border: 2px solid #ccc;
                border-radius: 5px;
                transition: border 0.3s;
            }
            input:focus {
                border: 2px solid #007bff;
                outline: none;
            }
            button {
                padding: 12px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: 500;
                transition: background-color 0.3s, transform 0.2s;
                width: 100%;
            }
            button:hover {
                background-color: #0056b3;
                transform: scale(1.05);
            }
            .notification {
                margin-top: 20px;
                padding: 15px;
                border-radius: 5px;
                display: none; /* Hidden by default */
                animation: fadeIn 0.5s forwards;
                font-size: 16px;
                text-align: left;
                position: relative;
                z-index: 10; /* Ensure it's above other content */
            }
            .success {
                background-color: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            .error {
                background-color: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            footer {
                margin-top: 20px;
                font-size: 14px;
                color: #555;
                position: absolute;
                bottom: 20px;
                width: 100%;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Blooket Bot Creator</h1>
            <form id="bot-form">
                <label for="gamePin">Game Pin:</label>
                <input type="text" id="gamePin" name="gamePin" required>

                <label for="botName">Bot Name:</label>
                <input type="text" id="botName" name="botName" required>

                <label for="botAmount">Bot Amount:</label>
                <input type="number" id="botAmount" name="botAmount" required min="1">

                <button type="submit" id="submitButton">Create Bots</button>
            </form>

            <div id="notification" class="notification"></div>
            <footer>Made by Chip Hill</footer>
        </div>

        <script>
            document.getElementById('bot-form').addEventListener('submit', async (e) => {
                e.preventDefault();

                const gamePin = document.getElementById('gamePin').value;
                const botName = document.getElementById('botName').value;
                const amount = parseInt(document.getElementById('botAmount').value);
                const submitButton = document.getElementById('submitButton');
                const notification = document.getElementById('notification');

                // Indicate that the request is being processed
                submitButton.textContent = 'Sending...';
                submitButton.disabled = true;

                notification.style.display = 'none'; // Hide previous notification

                try {
                    const response = await fetch('/create-bots', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ gamePin, botName, amount })
                    });

                    const result = await response.json();

                    if (response.ok) {
                        const botsCreated = amount; // Number of bots created
                        const gameID = gamePin; // Game ID to display

                        notification.className = 'notification success';
                        notification.innerHTML = \`
                            <strong>Success!</strong> 
                            <p>Sent <strong>\${botsCreated}</strong> bots to <strong>\${gameID}</strong>.</p>
                        \`;
                    } else {
                        notification.className = 'notification error';
                        notification.innerHTML = \`
                            <strong>Error!</strong> 
                            <p>\${result.error}</p>
                        \`;
                    }
                    notification.style.display = 'block';
                } catch (error) {
                    notification.className = 'notification error';
                    notification.innerHTML = \`
                        <strong>Error!</strong> 
                        <p>\${error.message}</p>
                    \`;
                    notification.style.display = 'block';
                } finally {
                    // Reset the button and form state
                    submitButton.textContent = 'Create Bots';
                    submitButton.disabled = false;
                }
            });
        </script>
    </body>
    </html>
    `);
});

// Route to create bots
app.post('/create-bots', async (req, res) => {
    const { gamePin, botName, amount } = req.body;

    try {
        // Create session ID
        const response = await axios.post('https://play.blooket.com/api/playersessions/hosted', {
            gameCode: gamePin
        }, {
            headers: {
                'cookie': await bsid()  // Replace with your logic to get the cookie
            }
        });

        const url = response.data.n;
        let botResponses = [];
        for (let i = 1; i <= amount; i++) {
            const botResponse = await join(gamePin, botName + i); // Use concatenation instead of template literals
            botResponses.push(botResponse);
        }

        res.json({ gameID: gamePin, bots: botResponses });
    } catch (error) {
        res.status(400).json({ error: 'Error: Game pin not found.' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
