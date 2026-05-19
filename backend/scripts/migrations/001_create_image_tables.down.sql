-- Migration: Create image model tables
-- Down Migration

DROP TRIGGER IF EXISTS update_model_parameters_updated_at ON model_parameters;
DROP TRIGGER IF EXISTS update_image_models_updated_at ON image_models;
DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TABLE IF EXISTS parameter_enum_values;
DROP TABLE IF EXISTS model_parameters;
DROP TABLE IF EXISTS image_models;
