# Simple Data Explorer Application

This project provides a frontend data exploration interface built with Next.js and an asynchronous backend API built with FastAPI (Python).

## Setup and Installation Guide

Follow these steps precisely to set up and run both the backend API and the frontend application.

### Prerequisites

* Node.js (LTS version, e.g., 18.x or 20.x)
* npm (Node Package Manager)
* Python 3.10.10

---

### 1. Backend Setup (API)

The backend is built in Python and uses a virtual environment for dependency isolation.

* **a. Clone Repository**
    * Description: Clones the project files.
    * Command:
    ```bash
    git clone <YOUR_REPO_URL>
    ```

* **b. Navigate to Backend**
    * Description: Enters the backend directory.
    * Command:
    ```bash
    cd backend
    ```

* **c. Create Virtual Env**
    * Description: Creates an isolated virtual environment named venv.
    * Command:
    ```bash
    python -m venv venv
    ```

* **d. Activate Venv**
    * Description: Activates the virtual environment.
    * **Windows:**
    ```bash
    .\venv\Scripts\activate
    ```
    * **macOS/Linux:**
    ```bash
    source venv/bin/activate
    ```

* **e. Install Dependencies**
    * Description: Installs FastAPI, Uvicorn, Faker, and other dependencies.
    * Command:
    ```bash
    pip install -r requirements.txt
    ```

* **f. Initialize and Seed the Database**
    * Description: This step will create the 'sql_app.db' file which is intentionally ignored by Git (see .gitignore).
    * Command:
    ```bash
    python seed.py
    ```

* **g. Run the API**
    * Description: Starts the FastAPI server, usually on `http://127.0.0.1:8000`.
    * Command:
    ```bash
    uvicorn main:app --reload
    ```

The API is now running and serving data. Keep this terminal window open.

---

### 2. Frontend Setup (Data Explorer)

The frontend is a Next.js application that consumes the API.

* **a. Navigate to Frontend**
    * Description: Open new terminal and go to the frontend directory.
    * Command:
    ```bash
    cd frontend
    ```

* **b. Install Dependencies**
    * Description: Installs React, Next.js, Tailwind CSS, and dev dependencies.
    * Command:
    ```bash
    npm install
    ```

* **c. Create .env.local**
    * Description: Create this file to set the API URL (optional if using the default).
    * Instruction: *(Manual creation)*

* **d. Start Frontend**
    * Description: Compiles and starts the Next.js development server.
    * Command:
    ```bash
    npm run dev
    ```

The application will be accessible at: `http://localhost:3000`

---

### 3. Testing Setup

### Backend Testing

The backend uses pytest for testing endpoints and data logic.

* **a. Install pytest**
    * Description: Make sure to set the directory to root level (simple data explorer) and not the backend directory and ensure venv is activated.
    * Command:
    ```bash
    pip install pytest
    ```
    * Description: Installs pytest for backend testing

* **b. Run Backend Tests**
    * Command:
    ```bash
    pytest
    ```
    * Description: Executes all tests found in the backend directory (e.g., in tests/test_api.py).

### Frontend Testing

To ensure the testing suite runs correctly without legacy Babel configurations, we use the modern SWC transformer. Make sure to run in the frontend directory (cd frontend and no venv is required).

* **a. Install Jest and SWC Transformer**
    * Command:
    ```bash
    npm install @swc/jest --save-dev
    npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
    ```
    * Description: Installs the Jest integration for the Speedy Web Compiler (SWC).

* **b. Run Tests**
    * Command:
    ```bash
    npm test
    ```
    * Description: Executes the Jest test suite.

---

## Project Technology Stack

### Backend Stack

| Technology | Reason for Selection |
| :--- | :--- |
| Python | Reliable, highly readable language for server-side logic. |
| FastAPI | Chosen over Django/Flask due to its superior performance for API endpoints, built on asynchronous programming (async/await). It uses Pydantic for mandatory data validation, resulting in fewer runtime errors and automatic API documentation. |
| Faker | Used for data seeding, allowing for the generation of large, realistic, and complex fake data records for development and testing. |
| venv | Used to create an isolated Python virtual environment, ensuring that all project dependencies are separated from the system's global Python packages. |
| SQLite + SQLAlchemy | Simple, file-based database (SQLite) for easy setup, managed by an ORM (SQLAlchemy) for easy data manipulation and seeding. |

### Frontend Stack

| Technology | Reason for Selection |
| :--- | :--- |
| Next.js 16 (App Router) | Provides a powerful framework for React, offering features like automatic code splitting, server components, and optimized routing crucial for building a production-ready application. |
| Tailwind CSS | Used for utility-first styling, enabling rapid component development and easy maintenance of responsive design without leaving the component file. |
| Jest / React Testing Library | Provides a robust testing environment focused on testing user behavior (what the user sees and interacts with), rather than implementation details. |
| SWC (Speedy Web Compiler) | Replaces Babel as the default transpiler for Next.js, offering significantly faster compilation and testing times. |

### Short Explanation of Approach

The application uses a Decoupled Architecture, meaning the Frontend (UI) built with Next.js and the Backend (API) built with FastAPI are entirely separate applications communicating only over HTTP. This modern approach provides flexibility, allowing independent development and easy scaling.

| &nbsp; | &nbsp; |
| :--- | :--- |
| Data Flow | The main component fetches data on mount. All user interactions (sorting, filtering, pagination) trigger a state change, which re-runs the data fetching logic with the new parameters. |
| Resilience | The data fetching logic implements a 3-attempt Exponential Backoff retry mechanism to gracefully handle intermittent network errors, improving the application's reliability. |
| Testing | The test suite is structured to provide high confidence across both the client and server layers: <br><br> **Client-Side Resilience (src/app/error.test.tsx)**: This test use Jest's fake timers to isolate and validate the exponential backoff retry mechanism. This ensures the frontend correctly attempts to recover from API failures and only shows a final error message after all retries have failed with the correct time intervals. <br><br> **Server/API Validation (test\_api.py)**: This component uses Python-based tests to directly validate the stability and correctness of the backend data endpoints. This confirms that the API layer is correctly serving data, handling URL query parameters for sorting/filtering and pagination, and returning the expected data structure before the frontend consumes it. |

