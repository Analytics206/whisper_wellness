# WhisperWell Development Notes

## This document contains developer notes and reminders for ongoing work on the WhisperWell project.

## To-Do Items
- Add optional user profile information, including name, age, gender, and location
- Add optional goal tracking with progress visualization and achievement badges
- Add optional AI-powered goal suggestions and adjustments
- Add optional smart reminders and motivation system
- Add optional habit formation support and streak tracking
- Add optional data export/import functionality
- Add optional multiple device synchronization
- Ability to delete data and user account
- Ability to export data to CSV or JSON format
- Ability to import data from CSV or JSON format
- Ability to delete specific data
- this is for testing git

# Create and activate a virtual environment
python3.11 -m venv venv
source venv/bin/activate  # On Linux

# Install UV and other development dependencies
pip install uv
uv pip install -e ".[dev]"

### System monitoring with Prometheus/Grafana

The WhisperWell project now includes a comprehensive monitoring solution using Prometheus and Grafana to track system and container metrics.

#### Overview
