export function getData(count) {
    const result = [];

    for (let i = 0; i < count; i++) {
        result.push({
            id: i,
            code: `code ${i}`,
            isActive: !Math.round(Math.random()),
            value: getRandomNumber(0, 100),
            date: getRandomDate()
        })
    }

    return result;
}

function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}



function getRandomDate() {
    const start = new Date(2000, 1, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}