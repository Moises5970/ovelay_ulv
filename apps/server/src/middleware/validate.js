/**
 * Centraliza la verificacion de auth
 * req.body = parsed.data — sobrescribe el body original con la versión ya validada y transformada por Zod
 * 
 */
export function validate(schema) {
    return (req, res, next) => {
        const parsed = schema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                ok: false,
                error: parsed.error.issues[0].message,
            });
        }

        req.body = parsed.data;
        next();
    };
}