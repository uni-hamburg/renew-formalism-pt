import cloneDeep from 'lodash/cloneDeep';


export default class PnmlImporter {

    constructor (baseImporter, stylesheet) {
        this.baseImporter = baseImporter;
        this.stylesheet = stylesheet;
        this.parser = new DOMParser();
        this.elements = null;
        this.newElement = null;
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
        while (treeWalker.nextNode()) {
            switch (treeWalker.currentNode.nodeName) {
                case 'place':
                case 'transition':
                case 'arc':
                    this.createElement(treeWalker.currentNode);
                    break;
                case 'position':
                    this.setPosition(treeWalker.currentNode);
                    break;
                case 'dimension':
                    this.setDimension(treeWalker.currentNode);
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
        switch (node.nodeName) {
            case 'place':
                this.newElement = this.createPlace(node);
                break;
            case 'transition':
                this.newElement = this.createTransition(node);
                break;
            case 'arc':
                this.newElement = this.createArc(node);
                break;
            default:
                // TODO add more shapes
        }
        this.elements.push(this.newElement);
    }

    createPlace (node) {
        const style = this.stylesheet.getStyle('place');
        return {
            id: 'import_' + node.attributes.id.value,
            class: 'Classifier',
            type: 'shape',
            model: 'pt',
            metaObject: Object.assign({
                type: 'place',
            }, style),
            parentId: '__implicitroot', // TODO
            incoming: [],
            outgoing: [],
        };
    }

    createTransition (node) {
        const style = this.stylesheet.getStyle('transition');
        return {
            id: 'import_' + node.attributes.id.value,
            class: 'Classifier',
            type: 'shape',
            model: 'pt',
            metaObject: Object.assign({
                type: 'transition',
            }, style),
            parentId: '__implicitroot', // TODO
            incoming: [],
            outgoing: [],
        };
    }

    createArc (node) {
        return {
            id: 'import_' + node.attributes.id.value,
            class: 'Connection',
            type: 'connection',
            model: 'pt',
            metaObject: {
                type: 'arc',
            },
            parentId: '__implicitroot', // TODO
            sourceId: 'import_' + node.attributes.source.value,
            targetId: 'import_' + node.attributes.target.value,
        };
    }

    setPosition (node) {
        if (!this.newElement) {
            return;
        }
        this.newElement.x = parseInt(node.attributes.x.value);
        this.newElement.y = parseInt(node.attributes.y.value);
    }

    setDimension (node) {
        if (!this.newElement) {
            return;
        }
        const width = parseInt(node.attributes.x.value);
        const height = parseInt(node.attributes.y.value);
        this.newElement.width = width;
        this.newElement.height = height;
        const representation = this.newElement.metaObject.representation;
        if (this.newElement.metaObject.type === 'place') {
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
