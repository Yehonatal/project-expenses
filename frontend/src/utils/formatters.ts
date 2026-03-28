export const formatMoneyBirr = (value: number) =>
    `${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} birr`;

export const formatShortDate = (date: string | Date) =>
    new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });

export const formatCompactTime = (date: string | Date) =>
    new Date(date).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    });
