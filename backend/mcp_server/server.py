"""
mcp_server/server.py — CollabBridge MCP Server Entry Point
============================================================
Implements the Model Context Protocol (MCP) JSON-RPC 2.0 specification
over HTTP with Server-Sent Events (SSE) transport.

Architecture:
    /mcp/sse    — SSE endpoint for MCP clients to connect and receive events
    /mcp/msg    — POST endpoint for clients to send JSON-RPC messages
    /mcp/tools  — GET endpoint listing all available tools (for debugging)
    /health     — Health check

The server runs on port 8002 (separate from the main FastAPI backend on 8001)
so both can coexist in development or be independently scaled in production.

MCP Protocol Flow:
    1. Client connects to /mcp/sse via SSE
    2. Server sends 'endpoint' event with the message URL
    3. Client sends JSON-RPC 2.0 requests to /mcp/msg
    4. Server responds directly (synchronous) or via SSE (async)
    5. Tool calls are dispatched to handlers in tools.py

Usage:
    python backend/mcp_server/server.py

Configuration:
    PORT    — Server port (default: 8002)
    HOST    — Bind host (default: 0.0.0.0)
"""

import asyncio
import json
import logging
import os
import sys
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

# Ensure backend directory is in path for app imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from mcp_server.tools import TOOLS, TOOL_MAP

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("collabbridge.mcp")

HOST = os.getenv("MCP_HOST", "0.0.0.0")
PORT = int(os.getenv("MCP_PORT", "8002"))

# ---------------------------------------------------------------------------
# FastAPI Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="CollabBridge MCP Server",
    description="Model Context Protocol server exposing CollabBridge AI agent tools",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # MCP clients may be on any origin
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# /health — Health Check
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "CollabBridge MCP Server",
        "version": "1.0.0",
        "tools": len(TOOLS),
        "protocol": "MCP JSON-RPC 2.0",
    }


# ---------------------------------------------------------------------------
# /mcp/tools — List Available Tools (for debugging / introspection)
# ---------------------------------------------------------------------------

@app.get("/mcp/tools")
async def list_tools():
    """Return the list of all available MCP tools (without handlers)."""
    tools_schema = [
        {
            "name": t["name"],
            "description": t["description"],
            "inputSchema": t["inputSchema"],
        }
        for t in TOOLS
    ]
    return JSONResponse({"tools": tools_schema, "count": len(tools_schema)})


# ---------------------------------------------------------------------------
# /mcp/sse — SSE Transport Endpoint
# ---------------------------------------------------------------------------

@app.get("/mcp/sse")
async def mcp_sse(request: Request):
    """
    Server-Sent Events endpoint for MCP client connections.

    On connection:
    1. Sends an 'endpoint' event telling the client where to POST messages.
    2. Keeps the connection alive with periodic heartbeat pings.
    3. Closes cleanly when the client disconnects.
    """
    client_id = str(uuid.uuid4())[:8]
    logger.info(f"MCP SSE client connected: {client_id}")

    msg_url = f"http://{request.headers.get('host', f'localhost:{PORT}')}/mcp/msg"

    async def event_stream() -> AsyncGenerator[str, None]:
        # Step 1: Send the endpoint event (MCP spec requirement)
        yield f"event: endpoint\ndata: {json.dumps({'url': msg_url})}\n\n"

        # Step 2: Send server capabilities
        capabilities = {
            "jsonrpc": "2.0",
            "method": "notifications/initialized",
            "params": {
                "serverInfo": {
                    "name": "CollabBridge MCP Server",
                    "version": "1.0.0",
                },
                "capabilities": {
                    "tools": {"listChanged": False},
                },
            },
        }
        yield f"event: message\ndata: {json.dumps(capabilities)}\n\n"

        # Step 3: Heartbeat loop
        try:
            while True:
                if await request.is_disconnected():
                    logger.info(f"MCP SSE client disconnected: {client_id}")
                    break
                yield ": heartbeat\n\n"
                await asyncio.sleep(15)
        except asyncio.CancelledError:
            logger.info(f"MCP SSE stream cancelled: {client_id}")

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ---------------------------------------------------------------------------
# /mcp/msg — JSON-RPC Message Handler
# ---------------------------------------------------------------------------

@app.post("/mcp/msg")
async def mcp_message(request: Request):
    """
    Handle MCP JSON-RPC 2.0 messages from clients.

    Supported methods:
        initialize                  MCP handshake
        tools/list                  List all available tools
        tools/call                  Execute a tool by name
        ping                        Liveness check
    """
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(
            _error_response(None, -32700, "Parse error: invalid JSON"),
            status_code=200,  # MCP always returns 200, errors are in the body
        )

    msg_id = body.get("id")
    method = body.get("method", "")
    params = body.get("params", {})

    logger.info(f"MCP message: method={method} id={msg_id}")

    # --- initialize ---
    if method == "initialize":
        return JSONResponse(_ok_response(msg_id, {
            "protocolVersion": "2024-11-05",
            "serverInfo": {
                "name": "CollabBridge MCP Server",
                "version": "1.0.0",
                "description": "AI agent tools for Syrian reconstruction project matching",
            },
            "capabilities": {
                "tools": {"listChanged": False},
            },
        }))

    # --- ping ---
    if method == "ping":
        return JSONResponse(_ok_response(msg_id, {}))

    # --- tools/list ---
    if method == "tools/list":
        tools_schema = [
            {
                "name": t["name"],
                "description": t["description"],
                "inputSchema": t["inputSchema"],
            }
            for t in TOOLS
        ]
        return JSONResponse(_ok_response(msg_id, {"tools": tools_schema}))

    # --- tools/call ---
    if method == "tools/call":
        tool_name = params.get("name", "")
        tool_args = params.get("arguments", {})

        tool = TOOL_MAP.get(tool_name)
        if not tool:
            return JSONResponse(
                _error_response(msg_id, -32601, f"Tool not found: {tool_name}")
            )

        try:
            logger.info(f"Executing tool: {tool_name} args={tool_args}")
            result = await tool["handler"](tool_args)
            return JSONResponse(_ok_response(msg_id, {
                "content": [
                    {
                        "type": "text",
                        "text": json.dumps(result, ensure_ascii=False, indent=2),
                    }
                ]
            }))
        except Exception as e:
            logger.exception(f"Tool execution error: {tool_name}")
            return JSONResponse(
                _error_response(msg_id, -32603, f"Tool execution error: {str(e)}")
            )

    # --- notifications (no response needed) ---
    if method.startswith("notifications/"):
        return Response(status_code=204)

    # --- unknown method ---
    return JSONResponse(
        _error_response(msg_id, -32601, f"Method not found: {method}")
    )


# ---------------------------------------------------------------------------
# JSON-RPC 2.0 response helpers
# ---------------------------------------------------------------------------

def _ok_response(msg_id, result: dict) -> dict:
    return {"jsonrpc": "2.0", "id": msg_id, "result": result}


def _error_response(msg_id, code: int, message: str) -> dict:
    return {
        "jsonrpc": "2.0",
        "id": msg_id,
        "error": {"code": code, "message": message},
    }


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print(f"""
╔══════════════════════════════════════════════════════════╗
║         CollabBridge MCP Server v1.0.0                  ║
║         Model Context Protocol — JSON-RPC 2.0            ║
╠══════════════════════════════════════════════════════════╣
║  Tools available: {len(TOOLS):<38} ║
║  SSE endpoint:  http://localhost:{PORT}/mcp/sse         ║
║  Tools listing: http://localhost:{PORT}/mcp/tools       ║
║  Health check:  http://localhost:{PORT}/health          ║
╚══════════════════════════════════════════════════════════╝
    """)
    uvicorn.run(app, host=HOST, port=PORT, log_level="info")
