import sys
import os

# Ensure the parent backend directory is in the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from app.agents.adk_agents import app as root_agent

# Expose app for ADK CLI
app = root_agent
