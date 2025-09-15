#!/bin/bash

# Script to start the application with proper database setup
echo "Starting Loyalty API..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not found. Starting without database migrations."
    echo "Please ensure you have a PostgreSQL database configured in Railway."
else
    echo "✅ DATABASE_URL found. Running database migrations..."
    npx prisma migrate deploy
    if [ $? -eq 0 ]; then
        echo "✅ Database migrations completed successfully."
    else
        echo "❌ Database migrations failed. Check your database connection."
        echo "The app will still start, but database functionality may not work."
    fi
fi

echo "🚀 Starting Next.js application..."
npm start