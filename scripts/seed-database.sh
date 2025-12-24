#!/bin/bash
# Seed the database with initial data from JSON files
# This script helps new developers quickly populate their local database

set -e  # Exit on error

echo "🌱 Seeding Divine Age Rules Database..."
echo ""

# Check if wrangler is running
if ! curl -s http://localhost:8787/api/jurisdictions > /dev/null 2>&1; then
    echo "❌ Error: wrangler dev is not running"
    echo ""
    echo "Please start the dev server first:"
    echo "  npx wrangler dev"
    echo ""
    exit 1
fi

# Function to import a JSON file
import_file() {
    local file=$1
    local table=$2
    
    echo "📥 Importing $file → $table..."
    
    # Read JSON file and send to API
    curl -s -X POST http://localhost:8787/api/import/spreadsheet \
        -H "Content-Type: application/json" \
        -d "{\"table\":\"$table\",\"data\":$(cat "$file")}" \
        | jq -r '.imported // 0' | xargs -I {} echo "   ✅ Imported {} records"
}

cd "$(dirname "$0")/../import-data"

echo "📂 Import order (respecting foreign key dependencies):"
echo ""

# Import in correct order
import_file "0-missing_us_states.json" "jurisdictions"
import_file "1-jurisdictions.json" "jurisdictions"
import_file "2-instruments.json" "instruments"
import_file "3-rule_assertions.json" "rule_assertions"
import_file "4-compliance_decisions.json" "compliance_decisions"
import_file "5-case_law_events.json" "case_law_events"
import_file "6-sources.json" "sources"
import_file "7-regulatory_families.json" "regulatory_families"
import_file "8-coverage_backlog.json" "coverage_backlog"
import_file "9-us_state_matrix.json" "us_state_matrix"

echo ""
echo "🎉 Database seeding complete!"
echo ""
echo "Visit http://localhost:8787 to see your data"
