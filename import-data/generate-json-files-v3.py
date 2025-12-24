#!/usr/bin/env python3
"""
Generate JSON files from Excel spreadsheet for import into Divine Age Rules Database
Version 3: Fixes coverage_backlog field mappings
"""

import sys
import json

try:
    import pandas as pd
except ImportError:
    print("❌ pandas is not installed")
    print("Install it with: pip install pandas openpyxl")
    sys.exit(1)

# Path to your Excel file
excel_file = '/Users/lizsw/Downloads/divine_social_media_age_rules_global_research_v5.xlsx'

print("🚀 Converting Excel to JSON files...")
print(f"📁 Reading: {excel_file}")
print()

total_rows = 0
files_created = []

def clean_value(v):
    """Clean values for JSON serialization"""
    if v is None:
        return None
    if isinstance(v, float):
        import math
        if math.isnan(v) or math.isinf(v):
            return None
    if v == '':
        return None
    # Convert TRUE/FALSE strings to boolean
    if isinstance(v, str):
        if v.upper() == 'TRUE':
            return True
        if v.upper() == 'FALSE':
            return False
    return v

def process_sheet(sheet_name, table_name, column_mapping=None, columns_to_drop=None):
    """Process a single sheet"""
    global total_rows, files_created
    
    # Read Excel sheet
    df = pd.read_excel(excel_file, sheet_name=sheet_name)
    
    # Drop unwanted columns first
    if columns_to_drop:
        df = df.drop(columns=columns_to_drop, errors='ignore')
    
    # Apply column mappings if provided
    if column_mapping:
        # Remove columns mapped to None
        cols_to_drop = [k for k, v in column_mapping.items() if v is None]
        df = df.drop(columns=cols_to_drop, errors='ignore')
        
        # Rename remaining columns
        rename_map = {k: v for k, v in column_mapping.items() if v is not None}
        df = df.rename(columns=rename_map)
    
    # Replace NaN with None
    df = df.where(pd.notnull(df), None)
    df = df.replace('', None)
    
    # Convert to JSON records
    json_data = df.to_dict(orient='records')
    
    # Clean all values
    json_data = [
        {k: clean_value(v) for k, v in row.items()}
        for row in json_data
    ]
    
    # Filter out completely empty rows
    json_data = [row for row in json_data if any(v is not None for v in row.values())]
    
    return json_data

# 1. Jurisdictions
json_data = process_sheet('Jurisdictions', 'jurisdictions')
with open('1-jurisdictions.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, indent=2, ensure_ascii=False)
print(f'✅ 1. Jurisdictions               → 1-jurisdictions.json              ({len(json_data):3d} rows)')
files_created.append('1-jurisdictions.json')
total_rows += len(json_data)

# 2. Instruments
json_data = process_sheet('Instruments', 'instruments')
with open('2-instruments.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, indent=2, ensure_ascii=False)
print(f'✅ 2. Instruments                 → 2-instruments.json                ({len(json_data):3d} rows)')
files_created.append('2-instruments.json')
total_rows += len(json_data)

# 3. Rule Assertions
json_data = process_sheet('RuleAssertions', 'rule_assertions')
with open('3-rule_assertions.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, indent=2, ensure_ascii=False)
print(f'✅ 3. RuleAssertions              → 3-rule_assertions.json            ({len(json_data):3d} rows)')
files_created.append('3-rule_assertions.json')
total_rows += len(json_data)

# 4. Compliance Decisions
json_data = process_sheet('ComplianceDecisions', 'compliance_decisions')
with open('4-compliance_decisions.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, indent=2, ensure_ascii=False)
print(f'✅ 4. ComplianceDecisions         → 4-compliance_decisions.json        ({len(json_data):3d} rows)')
files_created.append('4-compliance_decisions.json')
total_rows += len(json_data)

# 5. Case Law Events
json_data = process_sheet('CaseLawEvents', 'case_law_events')
with open('5-case_law_events.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, indent=2, ensure_ascii=False)
print(f'✅ 5. CaseLawEvents               → 5-case_law_events.json            ({len(json_data):3d} rows)')
files_created.append('5-case_law_events.json')
total_rows += len(json_data)

# 6. Sources
json_data = process_sheet('Sources', 'sources')
with open('6-sources.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, indent=2, ensure_ascii=False)
print(f'✅ 6. Sources                     → 6-sources.json                    ({len(json_data):3d} rows)')
files_created.append('6-sources.json')
total_rows += len(json_data)

# 7. Regulatory Families (with column mapping)
json_data = process_sheet('RegulatoryFamilies', 'regulatory_families', {
    'family': 'family_name',
    'what_to_track': 'description',
    'examples_in_sheet': 'notes'
})
with open('7-regulatory_families.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, indent=2, ensure_ascii=False)
print(f'✅ 7. RegulatoryFamilies          → 7-regulatory_families.json         ({len(json_data):3d} rows)')
files_created.append('7-regulatory_families.json')
total_rows += len(json_data)

# 8. Coverage Backlog (FIXED: proper column mapping)
# Database expects: jurisdiction_id, topic, priority, status, assigned_to, notes
# Excel has: jurisdiction_id, reason, priority, last_checked
json_data = process_sheet('CoverageBacklog', 'coverage_backlog', 
    column_mapping={'reason': 'topic'},
    columns_to_drop=['last_checked', 'next_review_due']
)

# Add default values for required missing fields
for row in json_data:
    if 'status' not in row:
        row['status'] = 'pending'  # Default status
    if 'assigned_to' not in row:
        row['assigned_to'] = None
    if 'notes' not in row:
        row['notes'] = None

with open('8-coverage_backlog.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, indent=2, ensure_ascii=False)
print(f'✅ 8. CoverageBacklog             → 8-coverage_backlog.json            ({len(json_data):3d} rows)')
files_created.append('8-coverage_backlog.json')
total_rows += len(json_data)

# 9. US State Matrix (special handling - convert wide format to key-value)
print(f'⚙️  9. USStateMatrix               → Converting wide format to key-value...')
df = pd.read_excel(excel_file, sheet_name='USStateMatrix')
df = df.where(pd.notnull(df), None)

us_matrix_rows = []
for _, row in df.iterrows():
    state_name = row.get('state')
    if not state_name or state_name == '':
        continue
    
    # Map state name to jurisdiction_id
    state_to_jurisdiction = {
        'Arkansas': 'USA-AR',
        'Ohio': 'USA-OH',
        'California': 'USA-CA',
        'Georgia': 'USA-GA',
        'Mississippi': 'USA-MS',
        'Texas': 'USA-TX',
        'Utah': 'USA-UT',
        'Tennessee': 'USA-TN',
        'Florida': 'USA-FL',
        'Louisiana': 'USA-LA',
        'Maryland': 'USA-MD',
        'Montana': 'USA-MT',
        'Minnesota': 'USA-MN'
    }
    
    jurisdiction_id = state_to_jurisdiction.get(state_name)
    if not jurisdiction_id:
        print(f'   ⚠️  Warning: Unknown state "{state_name}" - skipping')
        continue
    
    # Convert each column (except 'state') to a separate row
    for col in df.columns:
        if col != 'state' and row.get(col) is not None and row.get(col) != '':
            us_matrix_rows.append({
                'state_jurisdiction_id': jurisdiction_id,
                'metric_name': col,
                'metric_value': str(clean_value(row[col])),
                'notes': None,
                'effective_date': None
            })

with open('9-us_state_matrix.json', 'w', encoding='utf-8') as f:
    json.dump(us_matrix_rows, f, indent=2, ensure_ascii=False)
print(f'✅ 9. USStateMatrix               → 9-us_state_matrix.json            ({len(us_matrix_rows):3d} rows)')
files_created.append('9-us_state_matrix.json')
total_rows += len(us_matrix_rows)

print()
print(f"✅ Generated {len(files_created)} files with {total_rows} total rows!")
print()
print("📋 Next steps:")
print("1. Start wrangler dev: npx wrangler dev")
print("2. Visit: http://localhost:8787/import-export")
print("3. For each file below, copy the JSON and import:")
print()

for i, filename in enumerate(files_created, 1):
    table_name = filename.split('-', 1)[1].replace('.json', '')
    print(f"   {i}. Open {filename}")
    print(f"      Select table: {table_name}")
    print(f"      Copy and paste the JSON content")
    print(f"      Click 'Import Data'")
    print()

print("🎉 That's it! Your database will have all your data!")
