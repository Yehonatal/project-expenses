import { Handler } from "@netlify/functions";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.NEON_DATABASE_URL;
if (!connectionString) throw new Error("NEON_DATABASE_URL is not defined");
const client = neon(connectionString);

export const handler: Handler = async (event) => {
    const id = event.path?.split("/").pop();
    if (!id) return { statusCode: 400, body: "Missing id" };

    try {
        if (event.httpMethod === "PUT") {
            if (!event.body) return { statusCode: 400, body: "Empty body" };
            const updates = JSON.parse(event.body);
            const fields: string[] = [];
            const vals: any[] = [];

            if (updates.date) {
                vals.push(new Date(updates.date).toISOString());
                fields.push(`date = $${vals.length}`);
            }
            if (updates.description !== undefined) {
                vals.push(updates.description);
                fields.push(`description = $${vals.length}`);
            }
            if (updates.amount !== undefined) {
                vals.push(Number(updates.amount));
                fields.push(`amount = $${vals.length}`);
            }
            if (updates.included !== undefined) {
                vals.push(Boolean(updates.included));
                fields.push(`included = $${vals.length}`);
            }

            if (fields.length === 0)
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "No updates provided" }),
                };

            vals.push(new Date().toISOString());
            fields.push(`updated_at = $${vals.length}`);
            vals.push(id);
            const q = `UPDATE expenses SET ${fields.join(", ")} WHERE id = $${
                vals.length
            } RETURNING id::text, date, description, amount::float, included`;
            const result = await client.query(q, vals);
            if (!result.length) return { statusCode: 404, body: "Not found" };
            return { statusCode: 200, body: JSON.stringify(result[0]) };
        }

        if (event.httpMethod === "DELETE") {
            const q = `DELETE FROM expenses WHERE id = $1 RETURNING id::text`;
            const delResult = await client.query(q, [id]);
            if (!delResult.length)
                return { statusCode: 404, body: "Not found" };
            return {
                statusCode: 200,
                body: JSON.stringify({ deletedId: delResult[0].id }),
            };
        }

        return { statusCode: 405, body: "Method not allowed" };
    } catch (err: any) {
        console.error("expenses-id error", err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Server error",
                error: String(err),
            }),
        };
    }
};
