import Formalism from 'renew-formalism';

import metamodel from '../ontology/MetaModel.json';
import stylesheet from '../ontology/Stylesheet.json';
import toolConfiguration from '../ontology/ToolConfiguration.json';
import PnmlExporter from '../export/PnmlExporter';
import PnmlImportParser from '../parser/pnml/PnmlImportParser';

/**
 *
 */
export default class PluginPT extends Formalism.Plugin {

    constructor (baseExporter, metaFactory) {
        super();
        this.type = metamodel.type;
        this.exporter = new PnmlExporter(baseExporter);
        this.pnmlImportParser = new PnmlImportParser(metaFactory);
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

    getExport (additionalData) {
        return this.exporter.getExport(additionalData);
    }

    getImportParser (format) {
        switch (format) {
            case 'pnml':
                return this.pnmlImportParser;
            default:
                throw new Error('Unknown import format');
        }
    }

    // TODO: rules ?

    // TODO: context ?

    // TODO: Petrinetz Beschreibung (rnw ? / pnml ? / json ?)

}
