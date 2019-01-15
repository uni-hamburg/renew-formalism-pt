import Formalism from 'renew-formalism';

import metamodel from '../ontology/MetaModel.json';
import stylesheet from '../ontology/Stylesheet.json';
import toolConfiguration from '../ontology/ToolConfiguration.json';


/**
 *
 */
export default class PluginPT extends Formalism.Plugin {
    /**
     * @return {MetaModel}
     */
    getMetaModel () {
        return Formalism.MetaModel.fromJson(metamodel);
    }

    /**
     * @return {Stylesheet}
     */
    getStylesheet () {
        return Formalism.Stylesheet.fromJson(stylesheet);
    }

    /**
     * @return {ToolConfiguration}
     */
    getToolConfiguration () {
        return Formalism.ToolConfiguration.fromJson(toolConfiguration);
    }

    // TODO: rules ?

    // TODO: context ?

    // TODO: Petrinetz Beschreibung (rnw ? / pnml ? / json ?)
}
