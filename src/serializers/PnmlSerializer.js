export default class PnmlSerializer {

    constructor () {
        this.xmlSerializer = new XMLSerializer();
        this.idMap = {};
        this.exportTypes = [
            'place',
            'transition',
            'arc',
        ];
    }

    serialize (data) {
        const ns = 'http://www.pnml.org/version-2009/grammar/pnml';
        const doc = document.implementation.createDocument(ns, 'pnml', null);
        const netElement = doc.createElement('net');
        netElement.setAttribute('id', 'net_' + Date.now());
        netElement.setAttribute('type', ns);

        let elementType;
        for (let i = 0; i < data.elements.length; i++) {
            elementType = data.elements[i].metaObject.targetType;
            if (this.exportTypes.includes(elementType)) {
                this.idMap[data.elements[i].id] = i + 1;
                data.elements[i].id = i + 1;
                netElement.appendChild(
                    this.createClassifierElement(data.elements[i], doc)
                );
            }
        }

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

        if (element.labels) {
            element.labels.forEach((label) => {
                const textElement = doc.createElement('text');
                const textNode = doc.createTextNode(label.text);
                textElement.appendChild(textNode);

                const graphicsElement = doc.createElement('graphics');
                const offsetElement = doc.createElement('offset');

                // Calculate PNML offsets (relative to center of element)
                let x = label.x - element.x;
                x += (label.width - element.width) / 2;
                offsetElement.setAttribute('x', x);

                let y = label.y - element.y;
                y += (label.height - element.height) / 2;
                offsetElement.setAttribute('y', y);

                graphicsElement.append(offsetElement);

                let nameElement;
                let markingElement;
                switch (label.metaObject.targetType) {
                    case 'name':
                        nameElement = doc.createElement('name');
                        nameElement.appendChild(textElement);
                        nameElement.appendChild(graphicsElement);
                        classifierElement.appendChild(nameElement);
                        break;
                    case 'marking':
                        markingElement = doc.createElement('initialMarking');
                        markingElement.appendChild(textElement);
                        markingElement.appendChild(graphicsElement);
                        classifierElement.appendChild(markingElement);
                        break;
                }
            });
        }

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
                this.idMap[element.sourceId]
            );
            classifierElement.setAttribute(
                'target',
                this.idMap[element.targetId]
            );
        }

        return classifierElement;
    }

}
