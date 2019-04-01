export default class PnmlSerializer {

    constructor () {
        this.xmlSerializer = new XMLSerializer();
    }

    serialize (data) {
        const ns = 'http://www.pnml.org/version-2009/grammar/pnml';
        const doc = document.implementation.createDocument(ns, 'pnml', null);
        const netElement = doc.createElement('net');
        netElement.setAttribute('id', 'net_' + Date.now());
        netElement.setAttribute('type', ns);

        data.elements.forEach((element) => {
            const classifierEl = this.createClassifierElement(element, doc);
            netElement.appendChild(classifierEl);
        });

        if (data.title) {
            const nameElement = doc.createElement('name');
            const textElement = doc.createElement('text');
            const textNode = doc.createTextNode(data.title);
            textElement.appendChild(textNode);
            nameElement.appendChild(textElement);
            netElement.appendChild(nameElement);
        }

        doc.documentElement.appendChild(netElement);

        const payload = this.xmlSerializer.serializeToString(doc);
        const mimeType = 'application/xml';
        const fileExtension = '.pnml';
        return { payload, mimeType, fileExtension };
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
