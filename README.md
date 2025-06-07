# Website Cloning Application

This project is a web application that can clone the design of any public website using AI. It consists of a Next.js frontend and a FastAPI backend.
Demo: https://youtu.be/rDIbtBc-c-k
## Prerequisites

- Python 3.13 or higher
- Node.js 18 or higher
- Google API Key (optional, a default key is provided for testing)

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. (Optional) Create a `.env` file in the backend directory with your Google API key:
   ```
   GOOGLE_API_KEY=your_api_key_here
   ```
   Note: A default API key is provided for testing, but you can use your own for better performance.

5. Install Playwright browsers:
   ```bash
   playwright install
   ```

6. Start the backend server:
   ```bash
   PYTHONPATH=$PYTHONPATH:. uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter a public website URL in the input field
3. Click "Clone Website" to start the cloning process
4. Wait for the process to complete
5. View the cloned website preview

## Features

- Website scraping with Playwright
- AI-powered website cloning using Google's Gemini
- Real-time preview of cloned websites
- Responsive design
- Error handling and loading states

## Architecture

- Frontend: Next.js with TypeScript and Tailwind CSS
- Backend: FastAPI with Python
- AI: Google's Gemini Pro via Google AI API
- Web Scraping: Playwright for reliable website capture

## Troubleshooting

### Backend Issues

1. If you get a module import error, make sure you're running the server with the correct Python path:
   ```bash
   PYTHONPATH=$PYTHONPATH:. uvicorn app.main:app --reload
   ```

2. If you get an API key error, you can either:
   - Use the default API key provided in the code
   - Create a `.env` file with your own Google API key:
     ```
     GOOGLE_API_KEY=your_api_key_here
     ```

3. If Playwright fails to launch, make sure you've installed the browsers:
   ```bash
   playwright install
   ```

### Frontend Issues

1. If you get dependency errors, try clearing the npm cache and reinstalling:
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

2. If the UI looks broken, make sure Tailwind CSS is properly configured:
   ```bash
   npm run dev
   ```

## Notes

- The cloning process may take a few moments depending on the complexity of the target website
- Some websites may block scraping attempts
- The cloned result may not be 100% identical to the original due to the nature of AI-based cloning
- Using your own Google API key may provide better results than the default key
