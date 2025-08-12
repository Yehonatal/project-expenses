import { Handler } from "@netlify/functions";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.NEON_DATABASE_URL;
if (!connectionString) throw new Error("NEON_DATABASE_URL is not defined");
const client = neon(connectionString);

export const handler: Handler = async () => {
    try {
        const totalsQ = `
      SELECT
        COALESCE(SUM(CASE WHEN included THEN amount ELSE 0 END),0) AS total_included,
        COALESCE(SUM(CASE WHEN NOT included THEN amount ELSE 0 END),0) AS total_excluded,
        COALESCE(SUM(CASE WHEN included THEN 1 ELSE 0 END),0) AS count_included,
        COALESCE(SUM(CASE WHEN NOT included THEN 1 ELSE 0 END),0) AS count_excluded
      FROM expenses;
    `;
        const totalsRes = await client.query(totalsQ);

        const monthlyQ = `
      SELECT
        EXTRACT(YEAR FROM date)::int AS year,
        EXTRACT(MONTH FROM date)::int AS month,
        SUM(CASE WHEN included THEN amount ELSE 0 END) AS total,
        COUNT(*) AS count
      FROM expenses
      GROUP BY year, month
      ORDER BY year, month;
    `;
        const monthlyRes = await client.query(monthlyQ);

        return {
            statusCode: 200,
            body: JSON.stringify({
                totals: {
                    totalIncluded: Number(totalsRes[0].total_included),
                    totalExcluded: Number(totalsRes[0].total_excluded),
                    countIncluded: Number(totalsRes[0].count_included),
                    countExcluded: Number(totalsRes[0].count_excluded),
                },
                monthlyBreakdown: monthlyRes.map((r: any) => ({
                    year: r.year,
                    month: r.month,
                    total: Number(r.total),
                    count: Number(r.count),
                })),
            }),
        };
    } catch (err: any) {
        console.error("summary error", err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Server error",
                error: String(err),
            }),
        };
    }
};
