import * as Joi from 'joi';

export function validate(config: Record<string, unknown>) {
  const schema = Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    PORT: Joi.number().port().default(3000),
    RPC_URL: Joi.string().uri().required(),
    FIL_NOTE_CONTRACT_ADDRESS: Joi.string()
      .pattern(/^0x[a-fA-F0-9]{40}$/)
      .required(),
    // Pinata configuration / Pinata 配置
    PINATA_JWT: Joi.string().required(),
    PINATA_GATEWAY: Joi.string().required(),
    // Optional: upload and storage related parameters / 可选：上传和存储相关参数
    UPLOAD_MAX_SIZE: Joi.number()
      .positive()
      .default(512 * 1024),
    UPLOAD_DIR: Joi.string().default('uploads'),
    VERIFY_ID_TTL_MS: Joi.number()
      .positive()
      .default(5 * 60 * 1000),
  });

  const validationResult = schema.validate(config, {
    allowUnknown: true,
    abortEarly: false,
  });
  if (validationResult.error) {
    throw new Error(
      `Config validation error: ${validationResult.error.message}`,
    );
  }
  return validationResult.value as Record<string, unknown>;
}
