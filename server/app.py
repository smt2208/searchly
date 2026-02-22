# Import necessary dependencies for type hints, graph operations, LLM integration, and web server functionality
from typing import TypedDict, Annotated, Optional
from langgraph.graph import add_messages, StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessageChunk, ToolMessage
from langchain_core.tools import tool as tool_decorator
from langchain_community.utilities import GoogleSerperAPIWrapper
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import asyncio
from uuid import uuid4
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
import aiosqlite
import uvicorn
from contextlib import asynccontextmanager

# Load environment variables from .env file (API keys, configuration settings)
load_dotenv()

# Define the State schema for the conversation graph
# This TypedDict defines the structure of data that flows through the graph nodes
class State(TypedDict):
    messages: Annotated[list, add_messages]  # List of messages with automatic message aggregation

# Initialize search tools and language model components
# Set up Google Serper API wrapper for web search with structured results
serper_wrapper = GoogleSerperAPIWrapper()

@tool_decorator
def google_serper(query: str) -> str:
    """Search the web using Google. Use this to find current, up-to-date information about any topic."""
    results = serper_wrapper.results(query)
    return json.dumps(results)

tools = [google_serper]

# Initialize OpenAI ChatGPT model with GPT-4o-mini for cost-effective performance
llm = ChatOpenAI(model="gpt-4o-mini")

# Bind tools to the language model so it can decide when to use search functionality
llm_with_tools = llm.bind_tools(tools=tools)

# Define async functions that serve as nodes in the conversation graph
async def model(state: State):
    """
    Main model node that processes user messages and generates responses.
    This function invokes the LLM with the current conversation state and returns the response.
    The LLM can decide whether to respond directly or call tools based on the context.
    """
    result = await llm_with_tools.ainvoke(state["messages"])
    return {"messages": [result]}

async def tools_router(state: State):
    """
    Router function that determines the next step in the conversation flow.
    Examines the last message from the LLM to check if it contains tool calls.
    Returns 'tool_node' if tools need to be executed, otherwise ends the conversation.
    """
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and len(last_message.tool_calls) > 0:
        return "tool_node"
    else:
        return END

async def tool_node(state):
    """
    Custom tool execution node that handles tool calls from the LLM.
    Currently handles Google Serper search tool calls by:
    1. Extracting tool call information (name, arguments, ID)
    2. Executing the search tool with provided arguments
    3. Formatting results as ToolMessage objects for the LLM to process
    """
    tool_calls = state["messages"][-1].tool_calls
    tool_messages = []
    
    # Process each tool call requested by the LLM
    for tool_call in tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        tool_id = tool_call["id"]
        
        # Handle Google Serper search tool specifically
        if tool_name == "google_serper":
            query = tool_args.get("query", "")
            search_results = await asyncio.to_thread(serper_wrapper.results, query)
            tool_message = ToolMessage(
                content=json.dumps(search_results),
                tool_call_id=tool_id,
                name=tool_name
            )
            tool_messages.append(tool_message)
    
    return {"messages": tool_messages}

# Set up the conversation graph structure using StateGraph
# This creates a directed graph that defines the flow of conversation processing
graph_builder = StateGraph(State)

# Add nodes to the graph - each node represents a processing step
graph_builder.add_node("model", model)        # Main LLM processing node
graph_builder.add_node("tool_node", tool_node)  # Tool execution node

# Set the entry point - all conversations start with the model node
graph_builder.set_entry_point("model")

# Add conditional edges - the model node routes to either tool_node or END
graph_builder.add_conditional_edges("model", tools_router)

# Add direct edge from tool_node back to model for processing tool results
graph_builder.add_edge("tool_node", "model")

# Global variables to hold the compiled graph instance and database connection
graph = None
async_conn = None

# Lifespan event handler for FastAPI application startup and shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages the application lifecycle, ensuring proper initialization and cleanup.
    Startup: Initializes the graph with persistent memory
    Shutdown: Closes database connections
    """
    global graph, async_conn
    # Startup phase - initialize the graph with persistent memory
    async_conn = await aiosqlite.connect("checkpoint.sqlite")
    memory = AsyncSqliteSaver(async_conn)
    graph = graph_builder.compile(checkpointer=memory)
    yield   # ⚡ APPLICATION RUNS HERE - FastAPI serves requests
    # Shutdown phase - close database connection
    if async_conn:
        await async_conn.close()

# Initialize FastAPI application with comprehensive configuration
app = FastAPI(
    title="Searchly API",
    description="A FastAPI server with LangGraph for chat interactions and web search capabilities",
    version="1.0.0",
    docs_url="/docs",        # Swagger UI documentation endpoint
    redoc_url="/redoc",      # ReDoc documentation endpoint
    lifespan=lifespan        # Application lifecycle management
)

# Configure CORS middleware for cross-origin requests
# Origins can be configured via CORS_ORIGINS environment variable (comma-separated)
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # Configured via environment variable
    allow_credentials=True,     # Allow credentials in requests
    allow_methods=["*"],        # Allow all HTTP methods
    allow_headers=["*"],        # Allow all headers
    expose_headers=["Content-Type"]  # Expose specific headers to clients
)

# Serialization helper function for streaming responses
def serialise_ai_message_chunk(chunk):
    """
    Converts AIMessageChunk objects to serializable format for streaming.
    This function extracts the content from LangChain message chunks and
    ensures they can be properly JSON serialized for HTTP streaming.
    """
    if isinstance(chunk, AIMessageChunk):
        return chunk.content
    else:
        raise TypeError(f"Object of type {type(chunk).__name__} is not correctly formatted for serialisation")

# Main async generator function for streaming chat responses
async def generate_chat_responses(message: str, checkpoint_id: Optional[str] = None):
    """
    Generates streaming chat responses using Server-Sent Events (SSE) format.
    
    This function handles:
    1. New conversation creation or continuation of existing conversations
    2. Processing user messages through the LangGraph workflow
    3. Streaming different types of events (content, search queries, results)
    4. Managing conversation state through checkpoints
    
    Args:
        message: The user's input message
        checkpoint_id: Optional ID for continuing existing conversations
    
    Yields:
        Formatted SSE data containing various event types:
        - checkpoint: New conversation ID
        - content: Streaming LLM response content
        - search_start: Search query being executed
        - search_results: URLs found during search
        - end: Conversation completion signal
    """
    # Ensure the graph is properly initialized
    if graph is None:
        yield f"data: {json.dumps({'type': 'error', 'error': 'Server not ready. Please try again.'})}"
        yield f"data: {json.dumps({'type': 'end'})}\n\n"
        return
    
    # Determine if this is a new conversation or continuation
    is_new_conversation = checkpoint_id is None
    
    try:
        if is_new_conversation:
            # Create new conversation with unique checkpoint ID
            new_checkpoint_id = str(uuid4())
            config = {"configurable": {"thread_id": new_checkpoint_id}}
            
            # Stream events for new conversation
            events = graph.astream_events(
                {"messages": [HumanMessage(content=message)]},
                version="v2",
                config=config
            )
            
            # Send checkpoint ID to client for future conversation continuation
            checkpoint_data = {"type": "checkpoint", "checkpoint_id": new_checkpoint_id}
            yield f"data: {json.dumps(checkpoint_data)}\n\n"
        else:
            # Continue existing conversation using provided checkpoint ID
            config = {"configurable": {"thread_id": checkpoint_id}}
            events = graph.astream_events(
                {"messages": [HumanMessage(content=message)]},
                version="v2",
                config=config
            )

        # Process and stream events from the LangGraph execution
        async for event in events:
            event_type = event["event"]
            
            # Handle streaming content from the language model
            if event_type == "on_chat_model_stream":
                chunk_content = serialise_ai_message_chunk(event["data"]["chunk"])
                content_data = {"type": "content", "content": chunk_content}
                yield f"data: {json.dumps(content_data)}\n\n"
                
            # Handle completion of model response and potential tool calls
            elif event_type == "on_chat_model_end":
                # Extract tool calls from the model output
                tool_calls = event["data"]["output"].tool_calls if hasattr(event["data"]["output"], "tool_calls") else []
                
                # Filter for Google Serper search tool calls
                search_calls = [call for call in tool_calls if call["name"] == "google_serper"]
                
                if search_calls:
                    # Extract search query and notify client that search is starting
                    search_query = search_calls[0]["args"].get("query", "")
                    search_data = {"type": "search_start", "query": search_query}
                    yield f"data: {json.dumps(search_data)}\n\n"
                    
            # Handle completion of tool execution (search results)
            elif event_type == "on_tool_end" and event["name"] == "google_serper":
                output = event["data"]["output"]
                
                # Extract URLs from search results (handles both string JSON and dict formats)
                urls = []
                try:
                    parsed = json.loads(output) if isinstance(output, str) else output
                    if isinstance(parsed, dict) and "organic" in parsed:
                        urls = [item["link"] for item in parsed["organic"] if isinstance(item, dict) and "link" in item][:8]
                    elif isinstance(parsed, list):
                        urls = [item.get("link") or item.get("url", "") for item in parsed if isinstance(item, dict)][:8]
                except (json.JSONDecodeError, KeyError, TypeError):
                    pass
                search_results_data = {"type": "search_results", "urls": urls}
                yield f"data: {json.dumps(search_results_data)}\n\n"
    
    except Exception as e:
        error_data = {"type": "error", "error": f"An error occurred: {str(e)}"}
        yield f"data: {json.dumps(error_data)}\n\n"
    
    # Always signal end of conversation processing
    end_data = {"type": "end"}
    yield f"data: {json.dumps(end_data)}\n\n"

# Request model for chat endpoint
class ChatRequest(BaseModel):
    message: str
    checkpoint_id: Optional[str] = None

# Define API endpoints
@app.post("/chat_stream")
async def chat_stream(request: ChatRequest):
    """
    Main chat endpoint that handles streaming conversations.
    
    Args:
        request: ChatRequest containing the user's message and optional checkpoint ID
    
    Returns:
        StreamingResponse: Server-Sent Events stream containing conversation data
    """
    return StreamingResponse(
        generate_chat_responses(request.message, request.checkpoint_id),
        media_type="text/event-stream"
    )

@app.get("/")
async def root():
    """
    Root endpoint providing basic API information and documentation links.
    """
    return {"message": "Welcome to Searchly API", "docs": "/docs"}

# Application entry point for direct execution
if __name__ == "__main__":
    # Run the FastAPI server with uvicorn ASGI server
    uvicorn.run(
        "app:app",              # Application module and instance
        host="127.0.0.1",       # Local host binding
        port=8000,              # Port number
        reload=True,            # Auto-reload on code changes (development only)
        log_level="info"        # Logging level
    )