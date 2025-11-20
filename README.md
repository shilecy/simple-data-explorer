# Simple Data Explorer Application

This project provides a frontend data exploration interface built with Next.js and an asynchronous backend API built with FastAPI (Python).

## Setup and Installation Guide

Follow these steps precisely to set up and run both the backend API and the frontend application.

### Prerequisites

Node.js (LTS version, e.g., 18.x or 20.x)

npm (Node Package Manager)

Python 3.10.10

### 1. Backend Setup (API)

The backend is built in Python and uses a virtual environment for dependency isolation.

| Step                        | Command                                                                   | Description                                                 |
| --------------------------- | ------------------------------------------------------------------------- |---------------------------------------------------- |                                            |
| a. **Clone Repository**     | git clone <YOUR_REPO_URL>                                                 | Clones the project files.                                   |
| b. **Navigate to Backend**  | cd backend                                                                | Enters the backend directory.                               |
| c. **Create Virtual Env**   | python -m venv venv                                                       | Creates an isolated virtual environment named venv.         |
| d. **Activate Venv**        | .\venv\Scripts\activate (Windows)  source venv/bin/activate (macOS/Linux) | Activates the virtual environment.                          |
| e. **Install Dependencies** | pip install -r requirements.txt                                           | "Installs FastAPI, Uvicorn, Faker, and other dependencies." |
| f. **Run the API**          | uvicorn main:app --reload                                                 | "Starts the FastAPI server, usually on http://127.0.0.1:8000." |

The API is now running and serving data. Keep this terminal window open.

### 2. Frontend Setup (Data Explorer)

The frontend is a Next.js application that consumes the API.

Step,Command,Description
a. Navigate to Frontend,cd ../frontend,Switches to the frontend directory.
b. Install Dependencies,npm install,"Installs React, Next.js, Tailwind CSS, and dev dependencies."
c. Create .env.local,(Manual creation),Create this file to set the API URL (optional if using the default).
d. Start Frontend,npm run dev,Compiles and starts the Next.js development server.

The application will be accessible at: http://localhost:3000

### 3.Testing Setup 

### Backend Testing

The backend uses pytest for testing endpoints and data logic. Make sure to run in the backend directory.

Step,Command,Description
a. Install pytest | pip install pytest | "Installs pytest for backend testing"
b. Run Backend Tests | pytest | "Executes all tests found in the backend directory (e.g., in tests/test_api.py)."

### Frontend Testing

To ensure the testing suite runs correctly without legacy Babel configurations, we use the modern SWC transformer. Make sure to run in the frontend directory.

Step,Command,Description
a. Install SWC Transformer,npm install @swc/jest --save-dev,Installs the Jest integration for the Speedy Web Compiler (SWC).
b. Run Tests,npm test,Executes the Jest test suite.

## Project Technology Stack
### Backend Stack

Technology,Reason for Selection
Python  | "Reliable, highly readable language for server-side logic."
FastAPI | "Chosen over Django/Flask due to its superior performance for API endpoints, built on asynchronous programming (async/await). It uses Pydantic for mandatory data validation, resulting in fewer runtime errors and automatic API documentation."
Faker   | "Used for data seeding, allowing for the generation of large, realistic, and complex fake data records for development and testing."
venv    | "Used to create an isolated Python virtual environment, ensuring that all project dependencies are separated from the system's global Python packages."
SQLite + SQLAlchemy  | "Simple, file-based database (SQLite) for easy setup, managed by an ORM (SQLAlchemy) for easy data manipulation and seeding."

### Frontend Stack

Technology,Reason for Selection
Next.js 16 (App Router) | "Provides a powerful framework for React, offering features like automatic code splitting, server components, and optimized routing crucial for building a production-ready application."
Tailwind CSS,"Used for utility-first styling, enabling rapid component development and easy maintenance of responsive design without leaving the component file."
Jest / React Testing Library,"Provides a robust testing environment focused on testing user behavior (what the user sees and interacts with), rather than implementation details."
SWC (Speedy Web Compiler),"Replaces Babel as the default transpiler for Next.js, offering significantly faster compilation and testing times."

### Short Explanation of Approach

The application uses a Decoupled Architecture, meaning the Frontend (UI) built with Next.js and the Backend (API) built with FastAPI are entirely separate applications communicating only over HTTP. This modern approach provides flexibility, allowing independent development and easy scaling.

Data Flow: The main component fetches data on mount. All user interactions (sorting, filtering, pagination) trigger a state change, which re-runs the data fetching logic with the new parameters.

Resilience: The data fetching logic implements a 3-attempt Exponential Backoff retry mechanism to gracefully handle intermittent network errors, improving the application's reliability.

Testing: The test suite is structured to provide high confidence across both the client and server layers:

Client-Side Resilience (src/app/error.test.tsx):
These tests use Jest's fake timers to isolate and validate the exponential backoff retry mechanism. This ensures the frontend correctly attempts to recover from API failures and only shows a final error message after all retries have failed with the correct time intervals.

Server/API Validation (test_api.py):
This component uses Python-based tests to directly validate the stability and correctness of the backend data endpoints. This confirms that the API layer is correctly serving data, handling URL query parameters for sorting and pagination, and returning the expected data structure before the frontend consumes it.
