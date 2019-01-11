import Plugin from 'renew-formalism/plugin'

import metamodel from '../ontology/metamodel.json';
import stylesheet from '../ontology/stylesheet.json';
import toolConfiguration from '../ontology/tool-config.json';

class PluginPt extends Plugin {

    getMetaModel () {
        return metamodel;
    }

    getStylesheet () {
        return stylesheet;
    }

    getToolConfiguration () {
        return toolConfiguration;
    }

}
