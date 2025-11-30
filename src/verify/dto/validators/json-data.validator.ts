import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Validates that the object has name:value format where both name and value are non-empty [验证对象具有 name:value 格式，且 name 和 value 都不为空]
 */
export function IsNameValueObject(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNameValueObject',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          // If value is undefined or null, skip validation (handled by @IsOptional) [如果值为 undefined 或 null，跳过验证（由 @IsOptional 处理）]
          if (value === undefined || value === null) {
            return true;
          }

          // Must be an object [必须是对象]
          if (
            typeof value !== 'object' ||
            value === null ||
            Array.isArray(value)
          ) {
            return false;
          }

          const obj = value as Record<string, unknown>;

          // Object must not be empty [对象不能为空]
          const keys = Object.keys(obj);
          if (keys.length === 0) {
            return false;
          }

          // All keys (names) must be non-empty strings [所有键（名称）必须是非空字符串]
          for (const key of keys) {
            if (typeof key !== 'string' || key.trim().length === 0) {
              return false;
            }

            // All values must be non-empty [所有值必须非空]
            const val = obj[key];
            if (val === null || val === undefined || val === '') {
              return false;
            }

            // If value is a string, it must not be empty after trimming [如果值是字符串，去除空格后不能为空]
            if (typeof val === 'string' && val.trim().length === 0) {
              return false;
            }
          }

          return true;
        },
        defaultMessage() {
          return 'jsonData must be an object with name:value format where both name and value are non-empty [jsonData 必须是 name:value 格式的对象，且 name 和 value 都不为空]';
        },
      },
    });
  };
}
