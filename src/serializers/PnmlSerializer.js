export default class PnmlSerializer {

    constructor (isRenewSpecific = false) {
        this.isRenewSpecific = isRenewSpecific;
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
        data = JSON.parse(JSON.stringify(data));

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

                let labelElement;
                switch (label.metaObject.targetType) {
                    case 'name':
                        labelElement = doc.createElement('name');
                        labelElement.appendChild(textElement);
                        labelElement.appendChild(graphicsElement);
                        break;
                    case 'marking':
                        if (this.isRenewSpecific) {
                            labelElement = this.createInscription(
                                doc,
                                textElement,
                                graphicsElement
                            );
                        } else {
                            labelElement = doc.createElement('initialMarking');
                            labelElement.appendChild(textElement);
                            labelElement.appendChild(graphicsElement);
                        }
                        break;
                    case 'inscription':
                        if (this.isRenewSpecific) {
                            labelElement = this.createInscription(
                                doc,
                                textElement,
                                graphicsElement
                            );
                        }
                        break;
                    default:
                        return;
                }

                classifierElement.appendChild(labelElement);
            });
        }

        const graphicsElement = doc.createElement('graphics');

        if (element.hasOwnProperty('x') && element.hasOwnProperty('y')) {
            const positionElement = doc.createElement('position');
            positionElement.setAttribute('x', element.x + element.width / 2);
            positionElement.setAttribute('y', element.y + element.height / 2);
            graphicsElement.appendChild(positionElement);
        }

        if (element.width && element.height) {
            const dimensionElement = doc.createElement('dimension');
            dimensionElement.setAttribute('x', element.width);
            dimensionElement.setAttribute('y', element.height);
            graphicsElement.appendChild(dimensionElement);
        }

        if (element.metaObject.representation) {
            const fillElement = this._createFillElement(doc, element);
            if (fillElement) {
                graphicsElement.appendChild(fillElement);
            }
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

        console.log(element);

        return classifierElement;
    }

    createInscription (doc, textElement, graphicsElement) {
        const inscriptElement = doc.createElement('inscription');
        inscriptElement.appendChild(textElement);
        inscriptElement.appendChild(graphicsElement);

        const labelElement = doc.createElement('toolspecific');
        labelElement.setAttribute('tool', 'renew');
        labelElement.setAttribute('version', '2.0');
        labelElement.appendChild(inscriptElement);

        return labelElement;
    }

    _getStyle (element) {
        const style = { };
        const rawStyle = element.metaObject.representation.attributes.style
            .split(';').filter(Boolean);
        for (let i=0; i<rawStyle.length; i++) {
            const [ key, value ] = rawStyle[i].split(':');
            style[key.trim()] = value.trim();
        }
        return style;
    }

    _createFillElement (doc, element) {
        const style = this._getStyle(element);

        if (!style.fill) {
            return false;
        }

        const fillElement = doc.createElement('fill');

        const fill = this._hexToRgb(style.fill);
        fillElement.setAttribute(
            'color',
            'rgb(' + fill.r + ',' + fill.g + ',' + fill.b +')',
        );

        return fillElement;
    }

    /**
     * src: https://stackoverflow.com/questions/5623838
     * @private
     * @param {string} hex
     * @return {{r,g,b}}
     */
    _hexToRgb (hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => {
            return r + r + g + g + b + b;
        });

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : null;
    }

}
