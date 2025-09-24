/**
 * Normalize a type string for consistent storage and comparison.
 * Trims and lowercases the name. Returns null for empty input.
 */
function normalizeType(input) {
    if (!input && input !== "") return null;
    const s = String(input).trim();
    if (s.length === 0) return null;
    return s.toLowerCase();
}

module.exports = { normalizeType };
