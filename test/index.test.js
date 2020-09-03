import {getFilterProcessor} from "../src/collection-summary.js";
import {getData} from "../src/data.js";

let data;
beforeAll(() => {
    data = getData(100000);
});

test("process data", () => {
    const struct = getFilterProcessor(data[0], ["code", "value", "isActive"]);
    for (let record of data) {
        struct.processRecord(record);
    }
    const result = struct.getSummary();
    expect(result.code).not.toBeNull();
    expect(result.value).not.toBeNull();
    expect(result.isActive).not.toBeNull();

    expect(result.code.length).toEqual(100000);
    expect(result.code[0].value).toEqual("code 0");
    expect(result.code[0].count).toEqual(1);

    expect(result.isActive.length).toEqual(2);
    const trueItem = result.isActive.find(item => item.value == true);
    const falseItem = result.isActive.find(item => item.value == false);
    expect(trueItem).not.toBeNull();
    expect(falseItem).not.toBeNull();
    expect(trueItem.count).toBeGreaterThan(0);
    expect(falseItem.count).toBeGreaterThan(0);
    expect(trueItem.count + falseItem.count).toEqual(100000);

    expect(result.value.min).toEqual(0);
    expect(result.value.max).toEqual(99);
    expect(result.value.count).toEqual(100000);
    expect(result.value.sum).toBeGreaterThan(0);
    expect(result.value.uniqueCount).toBeGreaterThan(0);
    expect(result.value.values.length).toBeGreaterThan(0);
    expect(result.value.values[0].value).toBeGreaterThan(0);
    expect(result.value.values[0].count).toBeGreaterThan(0);
});