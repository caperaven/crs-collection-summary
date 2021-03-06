function getFilterProcessor(sample, structure = false) {
    const result = {
        processActions: [],
        summaryActions: [],
        actions: {},
        values: {}
    };

    const fields = Object.getOwnPropertyNames(sample);
    if (structure == true) {
        for (let field of fields) {
            const type = sample[field];
            factory[type](field, result);
        }
    }
    else {
        for (let field of fields) {
            const type = getType(field, sample);
            factory[type](field, result);
        }
    }

    result.processRecord = new Function("record", result.processActions.join("\n"));
    delete result.processActions;

    result.getSummary = new Function(`const result = {};\n${result.summaryActions.join("\n")}\nreturn result;`);
    delete result.summaryActions;

    return result;
}

const factory = {
    values: (field, obj, dataType) => {
        const name = `process_${field}`;
        obj.values[field] = {
            dataType: dataType,
            values: new Map()
        };
        obj.actions[name] = new Function("record", `
            const value = record["${field}"];
            const count = this.values.${field}.values.get(value) || 0;           
            this.values.${field}.values.set(value, count + 1)
        `);
        obj.processActions.push(`this.actions.${name}.call(this, record)`);
        obj.summaryActions.push(`result.${field} = {
                dataType: this.values.${field}.dataType,
                values: Array.from(this.values.${field}.values).map(item => {return {value: item[0], count: item[1]}})
            }`);
    },

    range: (field, obj, dataType) => {
        const name = `process_${field}`;
        obj.values[field] = {
            dataType: dataType,
            min: Number.MAX_VALUE,
            max: Number.MIN_VALUE,
            sum: 0,
            count: 0,
            values: new Map()
        };

        obj.actions[name] = new Function("record", `
            const value = record["${field}"];
            this.values.${field}.min = value < this.values.${field}.min ? value : this.values.${field}.min;        
            this.values.${field}.max = value > this.values.${field}.max ? value : this.values.${field}.max;
            this.values.${field}.sum = this.values.${field}.sum + value;
            const count = this.values.${field}.values.get(value) || 0;           
            this.values.${field}.values.set(value, count + 1);
            this.values.${field}.count += 1;
        `);
        obj.processActions.push(`this.actions.${name}.call(this, record)`);

        const sumCode = dataType == "date" ? "" : `sum: this.values.${field}.sum, ave: this.values.${field}.sum / this.values.${field}.count,`;

        obj.summaryActions.push(`       
        result.${field} = {
            dataType: this.values.${field}.dataType,
            ${sumCode}
            min: this.values.${field}.min, 
            max: this.values.${field}.max, 
            count: this.values.${field}.count,
            uniqueCount: this.values.${field}.values.size,           
            values: Array.from(this.values.${field}.values).map(item => {return {value: item[0], count: item[1]}})};`);
    },

    string: (field,  obj) => factory.values(field, obj, "string"),
    number: (field, obj) => factory.range(field, obj, "number"),
    date: (field, obj) => factory.range(field, obj, "date"),
    boolean: (field,obj) => factory.values(field, obj, "boolean")
};

const booleanValues = [true, false, "true", "false"];

function getType(field, record) {
    const value = record[field];

    if (booleanValues.indexOf(value) != -1) return "boolean";
    if (typeof value == "number") return "number";
    //if ((new Date(value)).toString() != "Invalid Date") return "date";
    return "string";
}

export { getFilterProcessor };
