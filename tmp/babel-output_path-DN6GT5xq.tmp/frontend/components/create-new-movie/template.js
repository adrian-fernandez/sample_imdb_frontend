define("frontend/components/create-new-movie/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "AWN4nSek", "block": "{\"statements\":[[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"Create a New Movie\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"form\",[]],[\"static-attr\",\"id\",\"NewMovie\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"placeholder\"],[[\"get\",[\"newMovie\",\"title\"]],\"Title\"]]],false],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"input\"],[[\"helper\",[\"-input-type\"],[[\"get\",[\"number\"]]],null]],[[\"value\",\"type\",\"placeholder\"],[[\"get\",[\"newMovie\",\"year\"]],[\"get\",[\"number\"]],\"Year\"]]],false],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"placeholder\"],[[\"get\",[\"newMovie\",\"cast\"]],\"Cast\"]]],false],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"createMovie\",[\"get\",[\"newMovie\"]]]],[\"flush-element\"],[\"text\",\"Publish\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "frontend/components/create-new-movie/template.hbs" } });
});