import Formalism from 'renew-formalism';

import metamodel from '../ontology/MetaModel.json';
import stylesheet from '../ontology/Stylesheet.json';
import toolConfiguration from '../ontology/ToolConfiguration.json';
import PnmlExporter from '../export/PnmlExporter';
import PnmlImporter from '../import/PnmlImporter';

/**
 *
 */
export default class PluginPT extends Formalism.Plugin {

    constructor (baseExporter, baseImporter, metaFactory) {
        super();
        this.type = metamodel.type;
        this.exporter = new PnmlExporter(baseExporter);
        this.importer = new PnmlImporter(baseImporter, metaFactory);
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

    import (data) {
        return this.importer.import(data);
    }

    // TODO: rules ?

    // TODO: context ?

    // TODO: Petrinetz Beschreibung (rnw ? / pnml ? / json ?)

}
