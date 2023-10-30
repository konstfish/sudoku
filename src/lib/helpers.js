export function generateRange(start, end) {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function formatDate(inpDate) {
    try {
        const date = new Date(inpDate);

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

export function formatDateExact(inpDate){
    try {
        const date = new Date(inpDate);

        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const monthName = monthNames[date.getMonth()];

        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');

        return `${monthName} ${date.getDate()}, ${date.getFullYear()} ${hour}:${minute}`;
    } catch (e) {
        console.error(e.message);
        return null;
    }
}

export function formatTime(inpTime){
    try {
        const seconds = inpTime % 60;
        const minutes = Math.floor(inpTime / 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } catch (e) {
        console.error(e.message);
        return null;
    }
}