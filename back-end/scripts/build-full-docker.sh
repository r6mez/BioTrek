#!/bin/bash

# Build script for full Docker environment with complete Python ML dependencies
# This creates a production-ready container with all chatbot capabilities

set -e

echo "🚀 Building full Docker environment with complete Python ML dependencies..."
echo "⚠️  This build will take 15-30 minutes and create a ~3GB image"
echo ""

# Check if user wants to continue
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $GROQ_API_KEY =~ ^[Yy]$ ]]; then
    echo "Build cancelled."
    exit 0
fi

# Check if GROQ_API_KEY is set
if [ -z "$GROQ_API_KEY" ]; then
    echo "❌ GROQ_API_KEY environment variable is not set"
    echo "Please set it with: export GROQ_API_KEY=your_key_here"
    exit 1
fi

echo "📦 Building Docker image with full Python environment..."

# Build the full Docker image
docker-compose -f docker-compose.yaml -f docker-compose.full.yaml build api

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "🚀 To start the full environment:"
echo "   docker-compose -f docker-compose.yaml -f docker-compose.full.yaml up -d"
echo ""
echo "🔍 To test the chatbot:"
echo "   curl -X GET http://localhost:3000/api/v1/chatbot/health"
echo ""
echo "📊 Image size comparison:"
docker images | grep back-end-api | head -2
echo ""
echo "🎉 Full chatbot environment is ready!"
