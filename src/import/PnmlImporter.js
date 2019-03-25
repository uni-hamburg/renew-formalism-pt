import cloneDeep from 'lodash/cloneDeep';


export default class PnmlImporter {

    constructor (baseImporter, metaFactory) {
        this.baseImporter = baseImporter;
        this.metaFactory = metaFactory;
        this.parser = new DOMParser();
        this.elements = null;
    }

    /**
     * Import PNML
     * @param  {string} pnml The import data
     * @return {object}      The parsed import data
     */
    import (pnml) {
        const data = this.parsePnml(pnml);
        this.baseImporter.import(data);
        return data;
    }

    parsePnml (pnml) {
        this.elements = [];
        const dom = this.parser.parseFromString(pnml, 'application/xml');

        const rootElement = dom.documentElement;
        if (rootElement.nodeName !== 'pnml'
            || !rootElement.hasChildNodes()) {
            throw new Error('Invalid document type.');
        }

        const netElement = rootElement.firstElementChild;
        if (netElement.nodeName !== 'net'
            || !netElement.hasChildNodes()) {
            throw new Error('Empty net.');
        }

        const treeWalker = document.createTreeWalker(
            netElement,
            NodeFilter.SHOW_ELEMENT
        );

        let title = null;
        let lastElement = null;
        while (treeWalker.nextNode()) {
            switch (treeWalker.currentNode.nodeName) {
                case 'place':
                case 'transition':
                case 'arc':
                    lastElement = this.createElement(treeWalker.currentNode);
                    break;
                case 'position':
                    this.setPosition(treeWalker.currentNode, lastElement);
                    break;
                case 'dimension':
                    this.setDimension(treeWalker.currentNode, lastElement);
                    break;
                case 'name':
                    title = this.getName(treeWalker.currentNode);
                    break;
                default:
                    // TODO add more shapes or create generic shape
            }
        }

        return {
            elements: this.elements,
            title,
        };
    }

    createElement (node) {
        const element = this.metaFactory.createElement('pt:' + node.nodeName);
        element.id = 'import_' + node.attributes.id.value;
        element.parentId = '__implicitroot';

        if (node.nodeName === 'arc') {
            element.sourceId = 'import_' + node.attributes.source.value;
            element.targetId = 'import_' + node.attributes.target.value;
        }

        this.elements.push(element);

        return element;
    }

    setPosition (node, element) {
        if (!element) {
            return;
        }

        element.x = parseInt(node.attributes.x.value);
        element.y = parseInt(node.attributes.y.value);
    }

    setDimension (node, element) {
        if (!element) {
            return;
        }

        const width = parseInt(node.attributes.x.value);
        const height = parseInt(node.attributes.y.value);
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

    getName (node) {
        return node.firstElementChild.firstChild.nodeValue;
    }

}
