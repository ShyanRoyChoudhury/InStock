# Instock

## Overview

This project is a Shopify Inventory Management app consisting of a backend service and a frontend built using Shopify Hydrogen. The backend is deployed on Google Cloud Run, db on google cloud sql, while the frontend is deployed using Shopify Hydrogen's deployment tool.

## Table of Contents 
* Backend

  - Running Locally

  - Building and Deploying to Cloud Run

* Frontend

  - Running Locally

  - Deploying

* Environment Variables

### 📍 Note: This setup doc assumes, you already have db credentials

## Backend

### Running Locally

To run the backend locally, follow these steps:

```sh
cd backend
cp .env.example .env
python3 -m venv venv
source venv/bin/activate
uvicorn server:app --reload
```

### Building and Deploying to Cloud Run

To build and deploy the backend service to Google Cloud Run:
```sh
cd /Instore/backend

# Build the Docker image
docker buildx build --no-cache -t shopify-app-be --platform linux/amd64 .

# Tag the image
docker tag <IMAGE_ID> gcr.io/shopifyapp-450410/shopify-app-be

# Push the image to Google Container Registry
docker push gcr.io/<GOOGLE_CLOUD_PROJECT_ID>/shopify-app-be  
```

Replace <IMAGE_ID>, <GOOGLE_CLOUD_PROJECT_ID> with the actual ID of the built image & google cloud project ID.

## Frontend

### Running Locally

To run the frontend locally:
```sh
cd Instore

# Ensure you are using Node.js v23.7.0
nvm use 23.7.0

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Deploying

To deploy the frontend using Shopify Hydrogen:
```sh
npx shopify hydrogen deploy --force
```

## Environment Variables

Ensure you have a .env file configured for backend. Copy the example .env.example file and modify it accordingly.


## ✅App is running at http://localhost:3000 
