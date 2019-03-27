import Formalism from 'renew-formalism';

import metamodel from '../ontology/MetaModel.json';
import stylesheet from '../ontology/Stylesheet.json';
import toolConfiguration from '../ontology/ToolConfiguration.json';
import PnmlSerializer from '../serializers/PnmlSerializer';
import PnmlParser from '../parsers/PnmlParser';

/**
 *
 */
export default class PluginPT extends Formalism.Plugin {

    constructor (metaFactory) {
        super();
        this.type = metamodel.type;
        this.pnmlSerializer = new PnmlSerializer();
        this.pnmlParser = new PnmlParser(metaFactory);
    }

    /**
     * @return {MetaModel}
     */
    getMetaModel () {
        return Formalism.Ontology.MetaModel.fromJson(metamodel);
    }

    /**
     * @return {Stylesheet}
     */
    getStylesheet () {
        return Formalism.Ontology.Stylesheet.fromJson(stylesheet);
    }

    /**
     * @return {ToolConfiguration}
     */
    getToolConfiguration () {
        return Formalism.Ontology.ToolConfiguration.fromJson(toolConfiguration);
    }

    getSerializer (format) {
        switch (format) {
            case 'pnml':
                return this.pnmlSerializer;
            default:
                throw new Error('Unknown export format');
        }
    }

    getParser (format) {
        switch (format) {
            case 'pnml':
                return this.pnmlParser;
            default:
                throw new Error('Unknown import format');
        }
    }

    // TODO: rules ?

    // TODO: context ?

    // TODO: Petrinetz Beschreibung (rnw ? / pnml ? / json ?)

}
