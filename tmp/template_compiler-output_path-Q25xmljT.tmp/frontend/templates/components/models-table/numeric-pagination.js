export default Ember.HTMLBars.template({"id":"lz1B5bRV","block":"{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"btn-toolbar pull-right\"],[\"static-attr\",\"role\",\"toolbar\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"btn-group\"],[\"static-attr\",\"role\",\"group\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"visiblePageNumbers\"]]],null,2],[\"text\",\"  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"disabled\",\"disabled\"],[\"static-attr\",\"type\",\"button\"],[\"dynamic-attr\",\"class\",[\"concat\",[[\"unknown\",[\"classes\",\"buttonDefault\"]]]]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"gotoCustomPage\",[\"get\",[\"page\",\"label\"]]]],[\"flush-element\"],[\"append\",[\"unknown\",[\"page\",\"label\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"if\"],[[\"get\",[\"page\",\"isActive\"]],\"active\"],null],\" \",[\"unknown\",[\"classes\",\"buttonDefault\"]]]]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"gotoCustomPage\",[\"get\",[\"page\",\"label\"]]]],[\"flush-element\"],[\"append\",[\"unknown\",[\"page\",\"label\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"page\",\"isLink\"]]],null,1,0]],\"locals\":[\"page\"]}],\"hasPartials\":false}","meta":{"moduleName":"frontend/templates/components/models-table/numeric-pagination.hbs"}});