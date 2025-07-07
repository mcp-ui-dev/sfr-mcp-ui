import { JSONSchemaToZod } from "@dmitryrechkin/json-schema-to-zod";
import { logger } from "./logger";

export function JsonSchemaToZodRawSchema(jsonSchema: {
  type: "object";
  properties: Record<string, any>;
  required?: string[];
}) {
  const conversionStartTime = Date.now();

  logger.debug("Converting JSON schema to Zod schema", {
    conversionStartTime,
  });

  try {
    const result = Object.fromEntries(
      Object.entries(jsonSchema.properties).map(([key, value]) => {
        const isRequired = jsonSchema.required?.includes(key);
        const zodSchema = isRequired
          ? JSONSchemaToZod.convert(value)
          : JSONSchemaToZod.convert(value).optional();

        return [key, zodSchema];
      })
    );

    const conversionDuration = Date.now() - conversionStartTime;
    logger.debug("Schema conversion completed", {
      conversionDuration,
      propertiesCount: Object.keys(jsonSchema.properties).length,
    });

    return result;
  } catch (error) {
    const errorDuration = Date.now() - conversionStartTime;
    logger.error("Schema conversion failed", {
      inputSchema: jsonSchema,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
      errorDuration,
    });
    throw error;
  }
}
