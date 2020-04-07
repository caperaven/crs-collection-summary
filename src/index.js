export function getFilterProcessor(record) {
    const fields = Object.getOwnPropertyNames(record);

    const result = {
        processActions: []
    };

    for (let field of fields) {
        const type = getType(field, record);
        factory[type](field, result);
    }

    result.processRecord = new Function("record", result.processActions.join("\n"));
    delete result.processActions;

    return result;
}

const factory = {
    values: (field, obj) => {
        const name = `process_${field}`;
        obj[`${field}Values`] = new Set();
        obj[name] = new Function("record", `this.${field}Values.add(record["${field}"])`);
        obj.processActions.push(`this.${name}(record)`);
    },

    range: (field, obj) => {
        const name = `process_${field}`;
        obj[`${field}Values`] = {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE,
            values: new Set()
        };
        obj[name] = new Function("record", `
        const value = record["${field}"];
        this.${field}Values.min = value < this.${field}Values.min ? value : this.${field}Values.min;        
        this.${field}Values.max = value > this.${field}Values.max ? value : this.${field}Values.max;        
        this.${field}Values.values.add(value);
        `);
        obj.processActions.push(`this.${name}(record)`);
    },

    string: (field,  obj) => factory.values(field, obj),
    number: (field, obj) => factory.range(field, obj),
    date: (field, obj) => factory.range(field, obj),
    boolean: (field,obj) => factory.values(field, obj)
};

const booleanValues = [true, false, "true", "false"];

function getType(field, record) {
    const value = record[field];

    if (booleanValues.indexOf(value) != -1) return "boolean";
    if (Number.isNaN(value) == false) return "number";
    if (isNaN(new Date(value)) == false) return "date";
    return "string";
}