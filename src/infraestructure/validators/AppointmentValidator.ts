import Joi from "joi";

export class AppointmentValidator {
  private static schema = Joi.object({
    insuredId: Joi.string()
      .length(5)
      .pattern(/^\d{5}$/)
      .required()
      .messages({
        "any.required": "insuredId is required",
        "string.base": "insuredId must be a string",
        "string.length": "insuredId must be exactly 5 digits",
        "string.pattern.base": "insuredId must contain only digits",
      }),

    scheduleId: Joi.number().integer().positive().required().messages({
      "any.required": "scheduleId is required",
      "number.base": "scheduleId must be a number",
      "number.integer": "scheduleId must be an integer",
      "number.positive": "scheduleId must be a positive number",
    }),

    countryISO: Joi.string().valid("PE", "CL").required().messages({
      "any.required": "countryISO is required",
      "string.base": "countryISO must be a string",
      "any.only": "countryISO must be either 'PE' or 'CL'",
    }),
  });

  static validate(data: any): string | null {
    const { error } = this.schema.validate(data, { abortEarly: false });

    if (error) {
      return error.details.map((detail) => detail.message).join(", ");
    }

    return null;
  }
}
