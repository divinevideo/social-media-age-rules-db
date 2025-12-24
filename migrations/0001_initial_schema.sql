-- ABOUTME: Initial database schema for social media age rules tracking
-- ABOUTME: Creates 9 core tables with relationships and indexes

-- Jurisdictions: Countries, states, regions with hierarchical structure
CREATE TABLE IF NOT EXISTS jurisdictions (
  jurisdiction_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  level TEXT NOT NULL, -- country, state, supranational, etc.
  parent TEXT, -- parent jurisdiction_id for hierarchical relationships
  iso_code TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_jurisdictions_level ON jurisdictions(level);
CREATE INDEX IF NOT EXISTS idx_jurisdictions_parent ON jurisdictions(parent);

-- Instruments: Laws, bills, regulations, guidelines
CREATE TABLE IF NOT EXISTS instruments (
  instrument_id TEXT PRIMARY KEY,
  jurisdiction_id TEXT NOT NULL,
  instrument_type TEXT NOT NULL, -- statute, bill, regulation, guideline, etc.
  title TEXT NOT NULL,
  citation_or_number TEXT,
  status TEXT, -- enacted, proposed, in force, etc.
  introduced_date TEXT, -- ISO date format YYYY-MM-DD
  passed_date TEXT,
  signed_or_assented_date TEXT,
  effective_or_commencement_date TEXT,
  min_age_rule TEXT, -- simplified age rule (can be empty if complex)
  scope_summary TEXT,
  source_url TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(jurisdiction_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_instruments_jurisdiction ON instruments(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_instruments_type ON instruments(instrument_type);
CREATE INDEX IF NOT EXISTS idx_instruments_status ON instruments(status);
CREATE INDEX IF NOT EXISTS idx_instruments_effective_date ON instruments(effective_or_commencement_date);

-- Rule Assertions: Specific age rules extracted from instruments
CREATE TABLE IF NOT EXISTS rule_assertions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jurisdiction_id TEXT NOT NULL,
  instrument_id TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- MINIMUM_AGE_FOR_ACCOUNT, ENFORCEMENT, PARENTAL_CONSENT, etc.
  age_min INTEGER, -- minimum age (can be NULL if not applicable)
  age_max INTEGER, -- maximum age (can be NULL if not applicable)
  requirement TEXT NOT NULL, -- description of the requirement
  confidence REAL, -- 0.0 to 1.0 confidence score
  reviewed_by TEXT,
  reviewed_at TEXT, -- ISO date format
  effective_date TEXT, -- ISO date format
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(jurisdiction_id) ON DELETE CASCADE,
  FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rules_jurisdiction ON rule_assertions(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_rules_instrument ON rule_assertions(instrument_id);
CREATE INDEX IF NOT EXISTS idx_rules_type ON rule_assertions(rule_type);
CREATE INDEX IF NOT EXISTS idx_rules_age_min ON rule_assertions(age_min);

-- Compliance Decisions: Internal decisions about age enforcement
CREATE TABLE IF NOT EXISTS compliance_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jurisdiction_id TEXT NOT NULL,
  decision_state TEXT NOT NULL, -- active, reviewing, blocked, etc.
  min_age_to_access INTEGER, -- decided minimum age
  risk_level TEXT, -- high, medium, low
  owner TEXT, -- responsible person/team
  last_reviewed_at TEXT, -- ISO date format
  product_controls TEXT, -- JSON or text describing controls
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(jurisdiction_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_compliance_jurisdiction ON compliance_decisions(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_compliance_state ON compliance_decisions(decision_state);
CREATE INDEX IF NOT EXISTS idx_compliance_risk ON compliance_decisions(risk_level);

-- Case Law Events: Court cases and legal proceedings
CREATE TABLE IF NOT EXISTS case_law_events (
  case_id TEXT PRIMARY KEY,
  jurisdiction_id TEXT NOT NULL,
  instrument_id TEXT, -- can be NULL if not related to specific instrument
  court_or_body TEXT, -- court name or regulatory body
  event_type TEXT NOT NULL, -- filing, ruling, injunction, settlement, etc.
  event_date TEXT, -- ISO date format
  summary TEXT,
  source_url TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(jurisdiction_id) ON DELETE CASCADE,
  FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cases_jurisdiction ON case_law_events(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_cases_instrument ON case_law_events(instrument_id);
CREATE INDEX IF NOT EXISTS idx_cases_event_date ON case_law_events(event_date);

-- Sources: Reference materials and citations
CREATE TABLE IF NOT EXISTS sources (
  source_id TEXT PRIMARY KEY,
  what TEXT NOT NULL, -- description of the source
  url TEXT,
  retrieved TEXT, -- ISO date format
  citation_ref TEXT, -- formal citation if applicable
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_sources_retrieved ON sources(retrieved);

-- Regulatory Families: Groupings of related regulations
CREATE TABLE IF NOT EXISTS regulatory_families (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_name TEXT NOT NULL UNIQUE,
  description TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Junction table for many-to-many relationship between instruments and families
CREATE TABLE IF NOT EXISTS instrument_families (
  instrument_id TEXT NOT NULL,
  family_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  PRIMARY KEY (instrument_id, family_id),
  FOREIGN KEY (instrument_id) REFERENCES instruments(instrument_id) ON DELETE CASCADE,
  FOREIGN KEY (family_id) REFERENCES regulatory_families(id) ON DELETE CASCADE
);

-- Coverage Backlog: Items to research
CREATE TABLE IF NOT EXISTS coverage_backlog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jurisdiction_id TEXT,
  topic TEXT NOT NULL, -- what needs to be researched
  priority TEXT, -- high, medium, low
  status TEXT, -- pending, in-progress, completed
  assigned_to TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(jurisdiction_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_backlog_status ON coverage_backlog(status);
CREATE INDEX IF NOT EXISTS idx_backlog_priority ON coverage_backlog(priority);
CREATE INDEX IF NOT EXISTS idx_backlog_jurisdiction ON coverage_backlog(jurisdiction_id);

-- US State Matrix: US state-by-state comparison data
-- This is a flexible key-value table for storing various comparison metrics
CREATE TABLE IF NOT EXISTS us_state_matrix (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state_jurisdiction_id TEXT NOT NULL, -- should match a US state jurisdiction
  metric_name TEXT NOT NULL, -- e.g., "min_age", "verification_method", "enforcement_level"
  metric_value TEXT,
  notes TEXT,
  effective_date TEXT, -- ISO date format
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (state_jurisdiction_id) REFERENCES jurisdictions(jurisdiction_id) ON DELETE CASCADE,
  UNIQUE(state_jurisdiction_id, metric_name)
);

CREATE INDEX IF NOT EXISTS idx_matrix_state ON us_state_matrix(state_jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_matrix_metric ON us_state_matrix(metric_name);
