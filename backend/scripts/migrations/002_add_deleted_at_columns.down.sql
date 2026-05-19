-- 回滚：删除 deleted_at 列
ALTER TABLE image_models DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE model_parameters DROP COLUMN IF EXISTS deleted_at;