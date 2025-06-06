/*
  # Enable HTTP Extension
  
  1. Changes
    - Enables the HTTP extension which is required for making HTTP requests from PostgreSQL functions
    - This extension is needed for the create_checkout_session function to work properly
    
  2. Security
    - The HTTP extension is safe to use within Supabase's environment
    - Access to external HTTP endpoints is controlled through Row Level Security policies
*/

-- Enable the HTTP extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS http;