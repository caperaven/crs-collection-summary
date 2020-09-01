export function getFilterProcessor(record) {
    const fields = Object.getOwnPropertyNames(record);

    const result = {
        processActions: [],
        summaryActions: [],
        actions: {},
        values: {}
    };

    for (let field of fields) {
        const type = getType(field, record);
        factory[type](field, result);
    }

    result.processRecord = new Function("record", result.processActions.join("\n"));
    delete result.processActions;

    result.uniqueValues = new Function(`const result = {};\n${result.summaryActions.join("\n")}\nreturn result;`);
    delete result.summaryActions;

    return result;
}

const factory = {
    values: (field, obj) => {
        const name = `process_${field}`;
        obj.values[field] = new Map();
        obj.actions[name] = new Function("record", `
            const value = record["${field}"];
            const count = this.values.${field}.get(value) || 0;           
            this.values.${field}.set(value, count + 1)
        `);
        obj.processActions.push(`this.actions.${name}.call(this, record)`);
        obj.summaryActions.push(`result.${field} = Array.from(this.values.${field}).map(item => {return {value: item[0], count: item[1]}});`);
    },

    range: (field, obj) => {
        const name = `process_${field}`;
        obj.values[field] = {
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE,
            sum: 0,
            values: new Map()
        };
        obj.actions[name] = new Function("record", `
            const value = record["${field}"];
            this.values.${field}.min = value < this.values.${field}.min ? value : this.values.${field}.min;        
            this.values.${field}.max = value > this.values.${field}.max ? value : this.values.${field}.max;
            this.values.${field}.sum = this.values.${field}.sum + value;
            const count = this.values.${field}.values.get(value) || 0;           
            this.values.${field}.values.set(value, count + 1)
        `);
        obj.processActions.push(`this.actions.${name}.call(this, record)`);
        obj.summaryActions.push(`
        result.${field} = {
            min: this.values.${field}.min, 
            max: this.values.${field}.max, 
            sum: this.values.${field}.sum, 
            values: Array.from(this.values.${field}.values).map(item => {return {value: item[0], count: item[1]}})};`);
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
    if (typeof value == "number") return "number";
    //if ((new Date(value)).toString() != "Invalid Date") return "date";
    return "string";
}