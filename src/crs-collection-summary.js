import {getFilterProcessor} from "./collection-summary.js";

class CollectionSummary extends crsbinding.classes.BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    async disconnectedCallback() {
        super.disconnectedCallback();
    }

    summerize(data, structure) {
        const processor = getFilterProcessor(structure, true);
        for (let record of data) {
            processor.processRecord(record);
        }
        const summary = processor.getSummary();
        this.createUI(summary, data.length);
    }

    createUI(summary, length) {
        const properties = Object.keys(summary);
        const fragment = document.createDocumentFragment();
        for (const property of properties) {
            const data = summary[property];

            let template;
            switch(data.dataType) {
                case "string":
                    template = this.createCollectionUI(property, data, length);
                    break;
                case "number":
                    template = this.createSummaryUI(property, data);
                    break;
                case "boolean":
                    template = this.createBooleanUI(property, data);
                    break;
            }

            const result = document.createElement("div");
            result.innerHTML = template;
            fragment.appendChild(result);
        }
        this.appendChild(fragment);
    }

    createBooleanUI(property, data) {
        return `
            <h3>${property}</h3>
            <div>Record spread over values</div>
            <div>
                <span>${data.values[0].value}:</span>
                <span>${data.values[0].count}</span>
            </div>
            <div>
                <span>${data.values[1].value}:</span>
                <span>${data.values[1].count}</span>
            </div>
        `
    }

    createSummaryUI(property, data) {
        return `
            <h3>${property}</h3>
            <div>
                <span>Min:</span>
                <span>${data.min}</span>
            </div>
            <div>
                <span>Max:</span>
                <span>${data.max}</span>
            </div>
            <div>
                <span>Ave:</span>
                <span>${data.ave}</span>
            </div>
            <div>
                <span>Sum:</span>
                <span>${data.sum}</span>
            </div>
            <div>
                <div>Total unique values: ${data.values.length}</div>
            </div>
        `
    }

    createCollectionUI(property, data, length) {
        return `
            <h3>${property}</h3>
            <div>Total records: ${length}</div>
            <div>Total unique values: ${data.values.length}</div>
        `
    }
}

customElements.define("crs-collection-summary", CollectionSummary);