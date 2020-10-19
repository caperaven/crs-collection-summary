export function getData(count) {
    const result = [];

    let siteCount = 0;
    for (let i = 0; i < count; i++) {
        siteCount += 1;

        result.push({
            id: i,
            code: `code ${i}`,
            isActive: !Math.round(Math.random()),
            siteCode: `Site ${siteCount}`,
            value: getRandomNumber(0, 100),
            date: getRandomDate()
        })

        if (siteCount > 100) {
            siteCount = 0;
        }
    }

    return result;
}

function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomDate() {
    const start = new Date("01/07/2020 15:53:30.753");
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}