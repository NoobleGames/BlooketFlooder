# Blooket Flooder

A web-based tool that floods a Blooket game with bots using a specified game pin. The project is designed to be easily hosted on platforms like [Glitch](https://glitch.com/) or [Replit](https://replit.com/).

## Features
- Create multiple bots and join a Blooket game with just a few clicks.
- Simple and responsive interface with real-time feedback on bot creation.
- Host the application for free on platforms like Glitch or Replit.
- Easily customizable for personal use.

## How It Works
1. Enter the **Blooket Game Pin** for the game you want to join.
2. Specify a **bot name** and the **number of bots** to create.
3. The bots will join the game sequentially with unique names (e.g., Bot1, Bot2, etc.).
4. Notifications will indicate success or any errors encountered during bot creation.

## Setup Instructions

### Hosting on Glitch or Replit
1. **Fork or Remix the Project**:
   - On [Glitch](https://glitch.com/): Click "Remix" to create your version of the app.
   - On [Replit](https://replit.com/): Fork the project to your account.

2. **Install Dependencies**:
   - Make sure to install all required Node.js packages. This project relies on:
     - `express` for handling server-side logic.
     - `axios` for making HTTP requests to Blooket.
     - `cors` for cross-origin resource sharing.

   Run:
   ```bash
   npm install
