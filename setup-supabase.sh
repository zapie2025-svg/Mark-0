#!/bin/bash

echo "🔗 Supabase Setup for LinkedIn Post Automation Dashboard"
echo "========================================================"
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Please manually edit .env.local"
        exit 1
    fi
fi

echo ""
echo "📋 Please provide your Supabase credentials:"
echo ""

# Get Supabase URL
read -p "Enter your Supabase Project URL (or press Enter for default): " supabase_url
if [ -z "$supabase_url" ]; then
    supabase_url="https://hohfixivtuqnowrdpucr.supabase.co"
fi

# Get Supabase Anon Key
read -p "Enter your Supabase Anon Key (starts with 'eyJ'): " supabase_anon_key

if [ -z "$supabase_anon_key" ]; then
    echo "❌ Anon key is required!"
    echo ""
    echo "To get your anon key:"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to Settings → API"
    echo "4. Copy the 'anon public' key"
    exit 1
fi

# Create .env.local file
cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_anon_key
EOF

echo ""
echo "✅ .env.local created successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Run the SQL schema in your Supabase dashboard"
echo "2. Configure OAuth providers (Google/LinkedIn)"
echo "3. Start your development server: npm run dev"
echo ""
echo "📖 For detailed instructions, see: SUPABASE_SETUP.md"
echo ""
echo "🚀 Your project URL: $supabase_url"
