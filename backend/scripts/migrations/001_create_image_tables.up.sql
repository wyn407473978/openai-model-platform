-- Migration: Create image model tables
-- Up Migration

-- 1. Image Models Table
CREATE TABLE IF NOT EXISTS image_models (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    model_id varchar(64) NOT NULL UNIQUE,
    name varchar(128) NOT NULL,
    description text,
    enabled boolean DEFAULT true,
    sort_order int DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- 2. Model Parameters Table
CREATE TABLE IF NOT EXISTS model_parameters (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    model_id varchar(64) NOT NULL REFERENCES image_models(model_id) ON DELETE CASCADE,
    param_key varchar(64) NOT NULL,
    param_label varchar(128) NOT NULL,
    param_type varchar(32) NOT NULL CHECK (param_type IN ('enum', 'number', 'string', 'boolean')),
    is_required boolean DEFAULT false,
    default_value text,
    param_order int DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(),
    UNIQUE (model_id, param_key)
);

-- 3. Parameter Enum Values Table
CREATE TABLE IF NOT EXISTS parameter_enum_values (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    parameter_id bigint NOT NULL REFERENCES model_parameters(id) ON DELETE CASCADE,
    enum_value varchar(64) NOT NULL,
    enum_label varchar(128) NOT NULL,
    is_default boolean DEFAULT false,
    enum_order int DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_model_parameters_model_id ON model_parameters(model_id);
CREATE INDEX IF NOT EXISTS idx_parameter_enum_values_parameter_id ON parameter_enum_values(parameter_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_image_models_updated_at ON image_models;
CREATE TRIGGER update_image_models_updated_at
    BEFORE UPDATE ON image_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_model_parameters_updated_at ON model_parameters;
CREATE TRIGGER update_model_parameters_updated_at
    BEFORE UPDATE ON model_parameters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
