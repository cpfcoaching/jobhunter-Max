#!/bin/bash

echo "🚀 JobHunter Max - Ollama Setup"
echo "================================"
echo ""

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found"
    echo ""
    echo "📥 Please install Ollama first:"
    echo "   Visit: https://ollama.com"
    echo ""
    echo "   macOS: Download and install from website"
    echo "   Linux: curl -fsSL https://ollama.com/install.sh | sh"
    echo ""
    exit 1
fi

echo "✅ Ollama is installed"
echo ""

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
    echo "⚠️  Ollama is not running"
    echo "   Please start Ollama and run this script again"
    echo ""
    exit 1
fi

echo "✅ Ollama is running"
echo ""

# Pull llama3.2 model
echo "📥 Downloading llama3.2 model (this may take a few minutes)..."
echo ""

ollama pull llama3.2

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "🎯 You can now use AI features in JobHunter Max"
    echo "   1. Open JobHunter Max"
    echo "   2. Go to Settings"
    echo "   3. Select 'Ollama (Local)' as AI Provider"
    echo "   4. Choose 'llama3.2' as the model"
    echo ""
else
    echo ""
    echo "❌ Failed to download model"
    echo "   Please check your internet connection and try again"
    echo ""
    exit 1
fi
