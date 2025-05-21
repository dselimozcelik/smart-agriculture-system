# Plant Health Monitoring and Classification System

This project is a web-based system for monitoring plant health using sensor data and ML-based plant disease classification.

## Features

- Real-time monitoring of plant health metrics (moisture, temperature, light, humidity)
- AI-powered plant disease classification
- Detailed plant health reports
- Visual indicators for plant health status

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Python 3.8+ with pip (for ML server)
- PyTorch and other Python dependencies

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd bbm458-project
```

2. Install frontend dependencies
```bash
npm install
```

3. Install Python dependencies for the ML server
```bash
pip install torch torchvision flask flask-cors pillow
```

### Running the Application

#### Start the Frontend (React App)

```bash
npm run dev
```

The application will be available at http://localhost:5173

#### Start the ML Classification Server

```bash
npm run server
```

The ML server will be available at http://localhost:5000

## How to Use the Classification Feature

1. The system starts with plants displayed in the field view based on sensor data
2. Initially, plants are not classified by the ML model
3. Click the "Classify Plants" button to analyze all plants using the ML model
4. After classification, each plant will show its health status (Healthy, Warning, or Critical)
5. Click on a plant to see detailed information, including:
   - ML classification results
   - Classification confidence score
   - Detailed plant health metrics

## Project Structure

- `/src` - React frontend code
  - `/components` - React components including Field, Plant, and SensorPanel
  - `/assets` - Static assets including plant images
- `/server` - Flask server for ML classification
  - `wireless_predict.py` - Main Flask server with ML model
  - `best_model.pt` - Trained plant disease classification model

## Technical Details

### Frontend

- React with TypeScript
- Vite for build and development
- Tailwind CSS for styling

### Backend

- Flask Python server
- PyTorch for ML model inference
- ResNet18 model trained on plant disease dataset

## API Endpoints

- `GET /api/health` - Health check for the ML server
- `POST /api/classify` - Classify a plant image (accepts base64 encoded images)
