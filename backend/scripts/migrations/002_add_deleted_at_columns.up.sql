-- 添加 deleted_at 列以支持 GORM 软删除
ALTER TABLE image_models ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE model_parameters ADD COLUMN deleted_at TIMESTAMP NULL;