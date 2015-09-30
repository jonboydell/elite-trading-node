var route_array;
var route_map = new Map();

// loads the route map, which has to be specified in the crap route [[]] format
exports.init = function(r) {
    for (route_pair of r) {
        var a = route_pair[0];
        var b = route_pair[1];

        if (route_map.has(a)) {
            var exits = route_map.get(a);
            exits.push(b);
        } else {
            var exits = [];
            exits.push(b);
            route_map.set(a, exits);
        }

        if (route_map.has(b)) {
            var exits = route_map.get(b);
            exits.push(a);
        } else {
            var exits = [];
            exits.push(a);
            route_map.set(b, exits);
        }
    }
};

// true if the system specified is in the route map, false otherwise
exports.has = function (s) {
    return route_map.has(s);
}

// calculates the route from start to end, tells you things that you don't know, e.g. the intermediate
// steps, doesn't tell you the start or the end as you know those things already
// start and end must exist or you'll get an undefined, the callback function is run for every interation,
// and probably needs some thought
exports.route = function (start, end, route_list) {
    var systems = route_map.get(start);
    if (systems) {
        if (systems.indexOf(end) > -1) {
            return end;
        }
        route_map.delete(start);

        for (var i = 0; i < systems.length; i++) {
            var x = exports.route(systems[i], end, route_list);
            if (x) {
                route_list.push(systems[i]);
                return x;
            }
        }
    }
};
