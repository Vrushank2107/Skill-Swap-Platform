# Skill Swap Platform – Setup Guide

This guide will help you set up and run the Skill Swap Platform on your local machine.

## Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## 1. Clone the Repository
```bash
git clone <repo-url>
cd Skill-Swap-Platform
```

## 2. Install All Dependencies
Run the following command from the project root to install dependencies for both backend and frontend:
```bash
npm run install-all
```

## 3. Running the App in Development Mode
To start both the backend and frontend servers concurrently, run:
```bash
npm run dev
```
- The **backend** will run (by default) on [http://localhost:5000](http://localhost:5000)
- The **frontend** will run on [http://localhost:3000](http://localhost:3000)

## 4. Building the Frontend for Production
To build the frontend React app for production:
```bash
npm run build
```
The production-ready files will be generated in the `frontend/build` directory.

## 5. Running Backend or Frontend Individually
- To run only the backend:
  ```bash
  npm run server
  ```
- To run only the frontend:
  ```bash
  npm run client
  ```

## 6. Environment Variables
If your app requires environment variables, create a `.env` file in the appropriate directory (backend or frontend) and add your variables there.

## 7. Database
- The backend uses SQLite (via `better-sqlite3`). The database file will be created automatically in the backend directory.

## 8. Additional Notes
- Make sure ports 3000 (frontend) and 5000 (backend) are available.
- If you encounter issues, try deleting `node_modules` and reinstalling dependencies.

---
For any further questions, please refer to the main README or contact the development team. 