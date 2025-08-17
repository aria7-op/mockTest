#!/bin/bash

# Set environment variables for CORS configuration
export NODE_ENV=development
export CORS_ORIGIN="https://31.97.70.79:5050,https://31.97.70.79:3000,https://31.97.70.79:5173,https://31.97.70.79:2021"

echo "Environment variables set:"
echo "NODE_ENV=$NODE_ENV"
echo "CORS_ORIGIN=$CORS_ORIGIN"

echo ""
echo "To use these variables, run:"
echo "source set_env.sh"
echo ""
echo "Or start your server with:"
echo "NODE_ENV=development npm start" 