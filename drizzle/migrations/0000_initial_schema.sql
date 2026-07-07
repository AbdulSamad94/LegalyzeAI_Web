-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT,
  image TEXT,
  provider VARCHAR(50) NOT NULL DEFAULT 'credentials',
  provider_id TEXT,
  is_email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verification_token TEXT,
  email_verification_expires TIMESTAMP,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMP,
  daily_upload_count INTEGER NOT NULL DEFAULT 0,
  last_upload_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users
CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_verification_token_idx ON users(email_verification_token);
CREATE UNIQUE INDEX IF NOT EXISTS users_password_reset_token_idx ON users(password_reset_token);

-- Create analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  summary TEXT NOT NULL,
  risks JSON NOT NULL DEFAULT '[]',
  verdict TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for analyses
CREATE UNIQUE INDEX IF NOT EXISTS analyses_user_id_idx ON analyses(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS analyses_created_at_idx ON analyses(created_at);
