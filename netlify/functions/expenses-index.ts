import { Handler } from "@netlify/functions";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.NEON_DATABASE_URL;
if (!connectionString) throw new Error("NEON_DATABASE_URL is not defined");
const client = neon(connectionString);

export const handler: Handler = async (event) => {
    try {
        if (event.httpMethod === "GET") {
            const qParams = new URLSearchParams(
                event.queryStringParameters as any
            );
            const from = qParams.get("from");
            const to = qParams.get("to");
            const included = qParams.get("included");

            const where: string[] = [];
            const vals: any[] = [];

            if (from) {
                vals.push(new Date(from).toISOString());
                where.push(`date >= $${vals.length}`);
            }
            if (to) {
                vals.push(new Date(to).toISOString());
                where.push(`date <= $${vals.length}`);
            }
            if (included !== null && included !== undefined) {
                vals.push(included === "true");
                where.push(`included = $${vals.length}`);
            }

            const whereClause = where.length
                ? `WHERE ${where.join(" AND ")}`
                : "";
            const q = `SELECT id::text, date, description, amount::float, included FROM expenses ${whereClause} ORDER BY date DESC`;
            const result = await client.query(q, vals);

            return { statusCode: 200, body: JSON.stringify(result[0]) };
        }

        if (event.httpMethod === "POST") {
            if (!event.body) return { statusCode: 400, body: "Empty body" };
            const body = JSON.parse(event.body);
            const { date, description, amount, included } = body;
            if (!description || amount == null)
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: "description and amount required",
                    }),
                };

            const q = `INSERT INTO expenses (date, description, amount, included) VALUES ($1, $2, $3, $4) RETURNING id::text, date, description, amount::float, included`;
            const vals = [
                date ? new Date(date).toISOString() : new Date().toISOString(),
                description,
                Number(amount),
                included === undefined ? true : Boolean(included),
            ];
            const result = await client.query(q, vals);
            return { statusCode: 201, body: JSON.stringify(result[0]) };
        }

        return { statusCode: 405, body: "Method not allowed" };
    } catch (err: any) {
        console.error("expenses-index error", err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Server error",
                error: String(err),
            }),
        };
    }
};
