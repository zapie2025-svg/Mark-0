#!/bin/bash

echo "🚀 LinkedIn Post Automation - Environment Setup"
echo "================================================"
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    echo "Current contents:"
    cat .env.local
    echo ""
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Please manually edit .env.local with your Supabase credentials."
        exit 1
    fi
fi

echo "📝 Creating .env.local file..."
echo ""

# Create .env.local with placeholder values
cat > .env.local << EOF
# Supabase Configuration
# Get these values from your Supabase project dashboard
# Go to Settings > API to find your project URL and anon key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF

echo "✅ .env.local created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://supabase.com and create a new project"
echo "2. In your Supabase dashboard, go to Settings > API"
echo "3. Copy your Project URL and anon key"
echo "4. Replace the placeholder values in .env.local"
echo "5. Run the SQL from supabase-schema.sql in your Supabase SQL editor"
echo "6. Start the development server with: npm run dev"
echo ""
echo "🔗 Helpful links:"
echo "- Supabase Dashboard: https://supabase.com/dashboard"
echo "- Setup Guide: setup.md"
echo "- Database Schema: supabase-schema.sql"
echo ""
echo "🎉 Once you've updated .env.local with your credentials, run: npm run dev"
