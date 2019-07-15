import { parse } from 'fast-xml-parser';

export default class PnmlParser {

    constructor (metaFactory) {
        this.metaFactory = metaFactory;
        this.elements = null;
    }

    parse (pnml) {
        this.elements = [];

        const data = parse(pnml, {
            attrNodeName: '_attributes',
            attributeNamePrefix: '',
            ignoreAttributes: false,
            parseAttributeValue: true,
            parseNodeValue: true,
            ignoreNameSpace: false,
            trimValues: true,
        });

        if (!data.pnml || !data.pnml.net) {
            throw new Error('Invalid document type.');
        }

        let title = null;
        if (data.pnml.net.name && data.pnml.net.name.text) {
            title = data.pnml.net.name.text;
        }

        // Net elements can be inside a page element
        const net = data.pnml.net.page || data.pnml.net;

        Object.keys(net).forEach((elementType) => {
            switch (elementType) {
                case 'place':
                case 'transition':
                case 'arc':
                    if (Array.isArray(net[elementType])) {
                        net[elementType].forEach((elementData) => {
                            this.createElement(net, elementType, elementData);
                        });
                    } else {
                        this.createElement(net, elementType, net[elementType]);
                    }
                    break;
                default:
                    // TODO add more shapes or create generic shape
            }
        });

        // Make sure elements are created in the right order
        this.sortElements();

        return {
            elements: this.elements,
            title,
        };
    }

    createElement (net, elementType, elementData) {
        const element = this.metaFactory.createElement('pt:' + elementType);
        this.elements.push(element);

        element.id = 'import_' + elementData._attributes.id;
        element.parentId = '__implicitroot';

        if (elementData.graphics && elementData.graphics.position) {
            element.x = elementData.graphics.position._attributes.x || 0;
            element.y = elementData.graphics.position._attributes.y || 0;
        }

        if (elementData.graphics && elementData.graphics.dimension) {
            element.x -= elementData.graphics.dimension._attributes.x / 2;
            element.y -= elementData.graphics.dimension._attributes.y / 2;
            this.setDimension(element, elementData.graphics.dimension);
        }

        switch (elementType) {
            case 'place':
                if (elementData.initialMarking) {
                    // PNML standard
                    this.createLabel(
                        element,
                        elementData.initialMarking,
                        'pt:marking'
                    );
                } else if (elementData.toolspecific
                    && elementData.toolspecific.inscription) {
                    // Renew specific
                    this.createLabel(
                        element,
                        elementData.toolspecific.inscription,
                        'pt:marking'
                    );
                }
                if (elementData.name) {
                    this.createLabel(element, elementData.name, 'pt:name');
                }
                break;
            case 'transition':
                break;
            case 'arc':
                if (elementData.toolspecific
                    && elementData.toolspecific.inscription) {
                    this.createLabel(
                        element,
                        elementData.toolspecific.inscription,
                        'pt:inscription'
                    );
                }
                element.sourceId = 'import_' + elementData._attributes.source;
                element.targetId = 'import_' + elementData._attributes.target;
                break;
        }
    }

    createLabel (element, labelData, labelType) {
        const label = this.metaFactory.createElement(labelType);
        label.width = 150; // TODO get default dimensions from somewhere
        label.height = 50;

        // TODO Get bbox of arcs (layoutConnection?)
        label.x = labelData.graphics.offset._attributes.x + (element.x || 0);
        label.x -= (label.width - (element.width || 0)) / 2;
        label.y = labelData.graphics.offset._attributes.y + (element.y || 0);
        label.y -= (label.height - (element.height || 0)) / 2;
        label.text = labelData.text + '';

        this.elements.push(label);
        element.labels.push(label);
    }

    setDimension (element, dimension) {
        const width = dimension._attributes.x;
        const height = dimension._attributes.y;
        element.width = width;
        element.height = height;

        const representation = element.metaObject.representation;
        if (element.metaObject.type === 'place') {
            representation.attributes.rx
                = representation.proportions.rx * width;
            representation.attributes.ry
                = representation.proportions.ry * height;
            representation.attributes.cx
                = representation.proportions.cx * width;
            representation.attributes.cy
                = representation.proportions.cy * height;
        } else {
            representation.attributes.x
                = representation.proportions.x * width;
            representation.attributes.y
                = representation.proportions.y * height;
            representation.attributes.width
                = representation.proportions.width * width;
            representation.attributes.height
                = representation.proportions.height * height;
        }
    }

    sortElements () {
        const sortOrder = {
            'shape': 0,
            'label': 1,
            'connection': 2,
        };
        this.elements.sort((a, b) => {
            return sortOrder[a.type] - sortOrder[b.type];
        });
    }

}
