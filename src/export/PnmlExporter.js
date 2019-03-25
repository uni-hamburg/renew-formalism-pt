export default class PnmlExporter {

    constructor (baseExporter) {
        this.baseExporter = baseExporter;
        this.xmlSerializer = new XMLSerializer();
    }

    /**
     * Get PNML export
     * @param  {object} [additionalData]
     * @return {string}      The export data
     */
    getExport (additionalData) {
        const name = additionalData.title || null;
        const data = this.baseExporter.getExport();
        return this.createPnml(data, name);
    }

    createPnml (data, name) {
        const ns = 'http://www.pnml.org/version-2009/grammar/pnml';
        const doc = document.implementation.createDocument(ns, 'pnml', null);
        const netElement = doc.createElement('net');
        netElement.setAttribute('id', 'net_' + Date.now());
        netElement.setAttribute('type', ns);

        data.elements.forEach((element) => {
            const classifierEl = this.createClassifierElement(element, doc);
            netElement.appendChild(classifierEl);
        });

        if (name) {
            const nameElement = doc.createElement('name');
            const textElement = doc.createElement('text');
            const textNode = doc.createTextNode(name);
            textElement.appendChild(textNode);
            nameElement.appendChild(textElement);
            netElement.appendChild(nameElement);
        }

        doc.documentElement.appendChild(netElement);
        return this.xmlSerializer.serializeToString(doc);
    }

    createClassifierElement (element, doc) {
        const type = element.metaObject.targetType || element.type;
        const classifierElement = doc.createElement(type);
        classifierElement.setAttribute('id', element.id);

        const graphicsElement = doc.createElement('graphics');

        if (element.x && element.y) {
            const positionElement = doc.createElement('position');
            positionElement.setAttribute('x', element.x);
            positionElement.setAttribute('y', element.y);
            graphicsElement.appendChild(positionElement);
        }

        if (element.width && element.height) {
            const dimensionElement = doc.createElement('dimension');
            dimensionElement.setAttribute('x', element.width);
            dimensionElement.setAttribute('y', element.height);
            graphicsElement.appendChild(dimensionElement);
        }

        classifierElement.appendChild(graphicsElement);

        if (element.sourceId && element.targetId) {
            classifierElement.setAttribute(
                'source',
                element.sourceId
            );
            classifierElement.setAttribute(
                'target',
                element.targetId
            );
        }

        return classifierElement;
    }

}
