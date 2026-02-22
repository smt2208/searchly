# Searchly - AI-Powered Search Assistant

A modern AI search assistant that combines web search capabilities with intelligent conversation, built with Next.js and Python. Searchly provides real-time streaming responses using LangChain and LangGraph for sophisticated AI workflows.

## 🚀 Features

- **Real-time AI Search**: Intelligent search powered by LangChain and OpenAI GPT
- **Streaming Responses**: Live streaming of AI responses using Server-Sent Events (SSE)
- **Modern UI**: Clean, responsive interface built with React 19 and Tailwind CSS
- **Web Search Integration**: Google Serper API integration for up-to-date information
- **Modular Architecture**: Well-structured codebase with clear separation of concerns
- **TypeScript Support**: Full type safety across the frontend application

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.3.0** - React framework for production
- **React 19** - Latest React version with modern features
- **TypeScript 5** - Type-safe JavaScript development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Server-Sent Events (SSE)** - Real-time streaming communication

### Backend
- **Python 3.9+** - Core backend language
- **FastAPI** - Modern, fast web framework for building APIs
- **LangChain** - Framework for developing applications with LLMs
- **LangGraph** - Library for building stateful, multi-actor applications
- **OpenAI GPT** - Large Language Model for AI responses
- **Google Serper API** - Web search capabilities
- **SQLite** - Lightweight database for conversation checkpoints

## 📁 Project Structure

```
Searchly/
├── client/                     # Frontend Next.js application
│   ├── src/
│   │   ├── app/               # Next.js app directory
│   │   │   ├── layout.tsx     # Root layout component
│   │   │   ├── page.tsx       # Home page component
│   │   │   └── globals.css    # Global styles
│   │   ├── components/        # Reusable UI components
│   │   │   ├── chat/          # Chat-specific components
│   │   │   │   ├── InputBar.tsx    # Search input component
│   │   │   │   ├── MessageArea.tsx # Message display area
│   │   │   │   └── SearchStages.tsx# Search progress display
│   │   │   ├── layout/        # Layout components
│   │   │   │   └── Header.tsx # App header
│   │   │   └── ui/            # UI utility components
│   │   │       └── TypingAnimation.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useChat.ts     # Chat state management
│   │   ├── services/          # API service layer
│   │   │   └── chatApi.ts     # Chat API communication
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   └── constants/         # Application constants
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   └── next.config.ts         # Next.js configuration
└── server/                    # Backend Python application
    ├── app.py                 # Main FastAPI application
    ├── requirements.txt       # Python dependencies
    └── notebooks/             # Development notebooks
        ├── app_Serper.ipynb   # Serper API implementation
        └── app_Tavily.ipynb   # Tavily API implementation
```

## 🚦 Getting Started

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Python 3.9+** - [Download here](https://www.python.org/)
- **Git** - [Download here](https://git-scm.com/)

### Environment Variables

Create `.env` files in both `client` and `server` directories:

#### Server Environment Variables (`server/.env`)
```env
OPENAI_API_KEY=your_openai_api_key_here
SERPER_API_KEY=your_google_serper_api_key_here
```

#### Client Environment Variables (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### API Keys Required

1. **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/)
2. **Google Serper API Key**: Get from [Serper.dev](https://serper.dev/)

## 🏃‍♂️ Local Development Setup

### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your API keys
# (See Environment Variables section above)

# Run the server
python app.py
```

The backend server will start at `http://localhost:8000`

### 2. Frontend Setup

Open a new terminal window:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env.local file and add your environment variables
# (See Environment Variables section above)

# Run the development server
npm run dev
```

The frontend application will start at `http://localhost:3000`

### 3. Access the Application

Open your browser and navigate to `http://localhost:3000` to start using Searchly!

## 📝 Available Scripts

### Frontend (Client)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend (Server)
```bash
python app.py        # Start FastAPI server
pip freeze           # List installed packages
```

## 🔧 Configuration

### Next.js Configuration
The `next.config.ts` file contains configuration for the Next.js application.

### FastAPI Configuration
The `app.py` file includes CORS configuration and server settings.

## 🏗️ Architecture Overview

### Frontend Architecture
- **Component-based**: Modular React components with clear responsibilities
- **Custom Hooks**: `useChat` hook manages conversation state and streaming
- **Service Layer**: `chatApi` service handles API communication
- **Type Safety**: Comprehensive TypeScript definitions

### Backend Architecture
- **LangGraph Workflow**: Stateful conversation management with checkpoints
- **Tool Integration**: Google Serper for web search capabilities
- **Streaming Responses**: Real-time response streaming via SSE
- **Error Handling**: Robust error handling and logging

### Communication Flow
1. User submits query through frontend
2. Frontend sends request to FastAPI backend
3. Backend processes query using LangGraph workflow
4. AI searches web using Google Serper API
5. OpenAI generates intelligent response
6. Response streams back to frontend via SSE
7. Frontend displays real-time updates

## 🚀 Deployment

### Frontend Deployment
```bash
cd client
npm run build
npm run start
```

### Backend Deployment
```bash
cd server
pip install -r requirements.txt
python app.py
```

For production deployments, consider using:
- **Frontend**: Vercel, Netlify, or AWS Amplify
- **Backend**: Railway, Heroku, or AWS EC2

## 🧪 Development Notes

- The project includes Jupyter notebooks (`app_Tavily.ipynb`, `app_Serper.ipynb`) for development and testing
- The main production backend is in `app.py`
- TypeScript configuration is optimized for Next.js 15
- Tailwind CSS 4 is configured for styling

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [LangChain Documentation](https://python.langchain.com/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google Serper API Documentation](https://serper.dev/api-docs)

## 🆘 Troubleshooting

### Common Issues

1. **Backend not starting**: Check if all environment variables are set correctly
2. **Frontend connection errors**: Ensure backend is running on port 8000
3. **API key errors**: Verify your OpenAI and Serper API keys are valid
4. **CORS issues**: Check CORS configuration in `app.py`

### Support

If you encounter any issues, please check the existing issues or create a new one in the repository.

---

**Happy searching with Searchly! 🔍✨**
