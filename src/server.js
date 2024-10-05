// src/server.js

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import bsid from './bsid.js';  
import join from './join.js';  

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Blooket Bot Creator</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Poppins', sans-serif;
                background-color: #e9f1f7;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                background: #ffffff;
                padding: 40px;
                border-radius: 15px;
                box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
                width: 100%;
                max-width: 420px;
                text-align: center;
            }
            h1 {
                color: #2c3e50;
                margin-bottom: 30px;
                font-size: 2.2em;
                font-weight: 700;
            }
            form {
                display: flex;
                flex-direction: column;
                align-items: stretch;
                gap: 15px;
            }
            label {
                text-align: left;
                font-size: 1rem;
                font-weight: 500;
                color: #34495e;
            }
            input {
                padding: 12px;
                border-radius: 8px;
                border: 2px solid #ddd;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }
            input:focus {
                border-color: #3498db;
                outline: none;
            }
            button {
                padding: 15px;
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: background-color 0.3s ease, transform 0.2s ease;
                margin-top: 20px;
            }
            button:hover {
                background-color: #2980b9;
                transform: translateY(-3px);
            }
            button:disabled {
                background-color: #bdc3c7;
                cursor: not-allowed;
            }
            .checkbox-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 10px;
            }
            .checkbox-container label {
                margin: 0;
            }
            input[type="checkbox"] {
                width: 18px;
                height: 18px;
            }
            .notification {
                display: none;
                padding: 15px;
                margin-top: 20px;
                border-radius: 8px;
                font-size: 16px;
            }
            .notification.success {
                background-color: #e8f5e9;
                color: #2e7d32;
                border: 1px solid #81c784;
            }
            .notification.error {
                background-color: #ffebee;
                color: #c62828;
                border: 1px solid #e57373;
            }
            footer {
                font-size: 0.9rem;
                color: #95a5a6;
                margin-top: 15px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Create Blooket Bots</h1>
            <form id="bot-form">
                <label for="gamePin">Game Pin:</label>
                <input type="text" id="gamePin" name="gamePin" required placeholder="Enter Game Pin">

                <label for="botName">Bot Name:</label>
                <input type="text" id="botName" name="botName" required placeholder="Enter Bot Name">

                <label for="botAmount">Number of Bots:</label>
                <input type="number" id="botAmount" name="botAmount" required min="1" placeholder="Enter Number of Bots">

                <div class="checkbox-container">
                    <label for="randomNames">Use Random Names:</label>
                    <input type="checkbox" id="randomNames" name="randomNames">
                </div>

                <button type="submit" id="submitButton">Create Bots</button>
            </form>

            <div id="notification" class="notification"></div>
            <footer>Powered by Chip Hill</footer>
        </div>

        <script>
            const botNameInput = document.getElementById('botName');
            const randomNamesCheckbox = document.getElementById('randomNames');

            randomNamesCheckbox.addEventListener('change', () => {
                if (randomNamesCheckbox.checked) {
                    botNameInput.value = 'Random';
                    botNameInput.disabled = true;
                } else {
                    botNameInput.value = '';
                    botNameInput.disabled = false;
                }
            });

            document.getElementById('bot-form').addEventListener('submit', async (e) => {
                e.preventDefault();

                const gamePin = document.getElementById('gamePin').value;
                const botName = botNameInput.disabled ? 'Random' : document.getElementById('botName').value;
                const amount = parseInt(document.getElementById('botAmount').value);
                const submitButton = document.getElementById('submitButton');
                const notification = document.getElementById('notification');

                submitButton.textContent = 'Creating...';
                submitButton.disabled = true;
                notification.style.display = 'none';

                try {
                    const response = await fetch('/create-bots', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ gamePin, botName, amount, randomNames: randomNamesCheckbox.checked })
                    });

                    const result = await response.json();

                    if (response.ok) {
                        notification.className = 'notification success';
                        notification.innerHTML = \`
                            <strong>Success!</strong> 
                            <p>\${amount} bots have been created for game \${gamePin}.</p>
                        \`;
                    } else {
                        notification.className = 'notification error';
                        notification.innerHTML = \`
                            <strong>Error:</strong> \${result.error}
                        \`;
                    }
                    notification.style.display = 'block';
                } catch (error) {
                    notification.className = 'notification error';
                    notification.innerHTML = \`
                        <strong>Error:</strong> \${error.message}
                    \`;
                    notification.style.display = 'block';
                } finally {
                    submitButton.textContent = 'Create Bots';
                    submitButton.disabled = false;
                }
            });
        </script>
    </body>
    </html>
    `);
});


const generateRandomName = () => {
    return Math.random().toString(36).substring(2, 10); 
};


app.post('/create-bots', async (req, res) => {
    const { gamePin, botName, amount, randomNames } = req.body;

    try {
        const response = await axios.post('https://play.blooket.com/api/playersessions/hosted', {
            gameCode: gamePin
        }, {
            headers: {
                'cookie': await bsid()
            }
        });

        const url = response.data.n;
        let botResponses = [];
        for (let i = 1; i <= amount; i++) {
            const botFinalName = randomNames ? generateRandomName() : botName + i;
            const botResponse = await join(gamePin, botFinalName);
            botResponses.push(botResponse);
        }

        res.json({ gameID: gamePin, bots: botResponses });
    } catch (error) {
        res.status(400).json({ error: 'Error: Game pin not found.' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
