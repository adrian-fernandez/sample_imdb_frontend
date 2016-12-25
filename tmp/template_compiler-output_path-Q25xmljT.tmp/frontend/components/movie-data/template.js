export default Ember.HTMLBars.template({"id":"aFbdK/UH","block":"{\"statements\":[[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"movie-poster\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"img\",[]],[\"dynamic-attr\",\"src\",[\"arg\",[\"movie\",\"poster\"]],null],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"span\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleDetailHidden\"]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"movies\"],[[\"class\"],[\"movie-title\"]],1],[\"text\",\"    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"moviesByDirector\",[\"arg\",[\"movie\",\"director\",\"name\"]]]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"arg\",[\"movie\",\"director\",\"name\"]],false],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"moviesByYear\",[\"arg\",[\"movie\",\"year\"]]]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"arg\",[\"movie\",\"year\"]],false],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"append\",[\"arg\",[\"movie\",\"rate\"]],false],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"tr\",[]],[\"dynamic-attr\",\"id\",[\"concat\",[\"movie-actor-list-\",[\"arg\",[\"movie\",\"id\"]]]]],[\"dynamic-attr\",\"style\",[\"helper\",[\"if\"],[[\"get\",[\"isDetailHidden\"]],\"display:none;\"],null],null],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"colspan\",\"5\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"ul\",[]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"actorName\"]],false],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"arg\",[\"movie\",\"actors\"]]],null,0],[\"text\",\"    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[\"movie\"],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"actor-data\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"moviesByActor\",[\"get\",[\"actor\",\"imdb_id\"]],[\"get\",[\"actor\",\"name\"]]]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"img\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"zoom \",[\"helper\",[\"if\"],[[\"helper\",[\"gte\"],[[\"helper\",[\"strContains\"],[[\"get\",[\"actor\",\"name\"]],[\"get\",[\"search_actor_name\"]]],null],0],null],\"highlighted\"],null]]]],[\"dynamic-attr\",\"src\",[\"concat\",[[\"unknown\",[\"actor\",\"photo\"]]]]],[\"dynamic-attr\",\"alt\",[\"concat\",[[\"unknown\",[\"actor\",\"name\"]]]]],[\"dynamic-attr\",\"title\",[\"concat\",[[\"unknown\",[\"actor\",\"name\"]]]]],[\"dynamic-attr\",\"onMouseOver\",[\"helper\",[\"action\"],[[\"get\",[null]],\"selectedActor\",[\"get\",[\"actor\",\"name\"]]],null],null],[\"dynamic-attr\",\"onmouseOut\",[\"helper\",[\"action\"],[[\"get\",[null]],\"unselectedActor\"],null],null],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"actor\",\"index\"]},{\"statements\":[[\"text\",\"        \"],[\"append\",[\"arg\",[\"movie\",\"title\"]],false],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}","meta":{"moduleName":"frontend/components/movie-data/template.hbs"}});