#!/bin/bash
# Initialize local database with schema and sample data

set -e

DB_FILE="/Users/lizsw/divine-age-rules-db/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/356243f25e2704b06167b3a8b370c8bd45fece11f8a22f4fb2640b0292c9580e.sqlite"
MIGRATIONS_DIR="/Users/lizsw/divine-age-rules-db/migrations"

echo "🗄️  Initializing local database..."

# Apply schema
echo "📝 Applying schema migration..."
sqlite3 "$DB_FILE" < "$MIGRATIONS_DIR/0001_initial_schema.sql"

# Insert sample data
echo "📊 Inserting sample data..."
sqlite3 "$DB_FILE" << 'EOF'
-- Sample jurisdictions
INSERT OR IGNORE INTO jurisdictions (jurisdiction_id, name, level, parent, iso_code, notes) VALUES
('AUS', 'Australia', 'country', NULL, 'AU', 'Federal'),
('GBR', 'United Kingdom', 'country', NULL, 'GB', 'Great Britain + Northern Ireland'),
('EU', 'European Union', 'supranational', NULL, 'EU', 'Applies to providers in EU under DSA'),
('USA-FL', 'United States - Florida', 'state', 'USA', 'US-FL', '');

-- Sample instrument
INSERT OR IGNORE INTO instruments (instrument_id, jurisdiction_id, instrument_type, title, citation_or_number, status, introduced_date, passed_date, signed_or_assented_date, effective_or_commencement_date, min_age_rule, scope_summary, source_url) VALUES
('AUS-OSMA-2024', 'AUS', 'statute', 'Online Safety Amendment (Social Media Minimum Age) Act 2024', 'No. 127 of 2024', 'enacted (obligations commence 10 Dec 2025)', '2024-11-21', '2024-11-29', '2024-12-10', '2025-12-10', '16', 'Age-restricted social media platforms must take reasonable steps to prevent under-16s in Australia from having accounts', 'https://www.esafety.gov.au/about-us/industry-regulation/social-media-age-restrictions');

-- Sample rules
INSERT OR IGNORE INTO rule_assertions (jurisdiction_id, instrument_id, rule_type, age_min, age_max, requirement, confidence, reviewed_by, reviewed_at, effective_date) VALUES
('AUS', 'AUS-OSMA-2024', 'MINIMUM_AGE_FOR_ACCOUNT', 16, NULL, 'Platforms must take reasonable steps to prevent under-16s from having accounts.', 0.8, NULL, NULL, '2025-12-10'),
('AUS', 'AUS-OSMA-2024', 'ENFORCEMENT', NULL, NULL, 'Penalties apply to platforms; no penalties for under-16s/parents.', 0.8, NULL, NULL, '2025-12-10');
EOF

# Verify
echo ""
echo "✅ Database initialized!"
echo ""
echo "Statistics:"
sqlite3 "$DB_FILE" << 'EOF'
SELECT 'Jurisdictions: ' || COUNT(*) FROM jurisdictions;
SELECT 'Instruments: ' || COUNT(*) FROM instruments;
SELECT 'Rule Assertions: ' || COUNT(*) FROM rule_assertions;
EOF

echo ""
echo "You can now start the dev server with: npx wrangler dev"
