export function generateRange(start, end) {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function formatDate(inputString) {
    try {
        const date = new Date(inputString);

        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const monthName = monthNames[date.getMonth()];

        return `${monthName} ${date.getDate()}, ${date.getFullYear()}`;
    } catch (e) {
        console.error(e.message);
        return null;
    }
}
