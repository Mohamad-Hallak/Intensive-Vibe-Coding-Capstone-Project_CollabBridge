"""
CollabBridge MCP Server
========================
Exposes CollabBridge AI capabilities as Model Context Protocol (MCP) tools.

This server implements the MCP JSON-RPC 2.0 specification over HTTP+SSE,
making all CollabBridge agents accessible to any MCP-compatible client
(Claude Desktop, ADK agents, custom clients).

Transport: HTTP with Server-Sent Events (SSE)
Protocol: MCP JSON-RPC 2.0
Port: 8002 (separate from main FastAPI backend on 8001)

Available tools:
  - search_projects        Semantic search over registered projects
  - search_researchers     Semantic search over registered researchers
  - match_researchers      Run 4-layer matching engine for a project
  - generate_proposal      Generate a collaboration proposal document
  - assess_impact          Multi-dimensional impact assessment
  - get_funding            Find matching funding opportunities
  - build_team             Build a multidisciplinary research team
  - get_sdg_info           Get information about UN Sustainable Development Goals

Usage:
    python -m mcp_server.server
    # or
    python backend/mcp_server/server.py

MCP client connection:
    URL: http://localhost:8002/mcp
    Transport: SSE
"""
