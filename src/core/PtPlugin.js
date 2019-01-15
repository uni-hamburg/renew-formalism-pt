import { Plugin } from 'renew-formalism';
import { MetaModel, Stylesheet, ToolConfiguration } from 'renew-formalism/ontology';

import metamodel from '../ontology/MetaModel.json';
import stylesheet from '../ontology/Stylesheet.json';
import toolConfiguration from '../ontology/ToolConfiguration.json';

class PluginPt extends Plugin {

    getMetaModel () {
        return MetaModel.fromJson(metamodel);
    }

    getStylesheet () {
        return Stylesheet.fromJson(stylesheet);
    }

    getToolConfiguration () {
        return ToolConfiguration.fromJson(toolConfiguration);
    }

    // TODO: rules ?

    // TODO: context ?

    // TODO: Petrinetz Beschreibung (rnw ? / pnml ? / json ?)

}
