/**
 * Zod validation middleware foundation for request payload, query, and params.
 * Allows future modules (Milestone 2+) to easily define and attach schemas.
 *
 * @param {import('zod').ZodSchema} schema - Zod object schema containing body, query, or params
 */
export function validateRequest(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });

      // Assign parsed/sanitized data back to request object
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;

      next();
    } catch (error) {
      next(error);
    }
  };
}

export default validateRequest;
