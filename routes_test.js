var routes = require("./routes.json");

// defaults

var location = "kini";
var destination = "frigaha";

// read in args

process.argv.forEach(function (val, index, array) {
    if (index == 2) {
        location = val;
    }

    if (index == 3) {
        destination = val;
    }
});

/// main loop

var route_table = load_routes(routes);
if (route_table.get(location) && route_table.get(destination)) {
    console.log(traverse(location, destination, [location], 0));
} else {
    console.log("NOKAY");
}

// private functions from here

function load_routes(routes) {
    var route_table = new Map();
    for (route_pair of routes) {
        var a = route_pair[0];
        var b = route_pair[1];

        if (route_table.has(a)) {
            route_table.get(a).push(b);
        } else {
            var c = [];
            c.push(b);
            route_table.set(a, c);
        }

        if (route_table.has(b)) {
            route_table.get(b).push(a);
        } else {
            var c = [];
            c.push(a);
            route_table.set(b, c);
        }
    }
    return route_table;
}

function traverse(location, destination, traversed, count) {
    var nodes = route_table.get(location);
    for (d of traversed) {
        if (nodes.indexOf(d) > -1) {
            nodes.splice(nodes.indexOf(d), 1);
        }
    }

    if (nodes.indexOf(destination) > -1) {
        console.log("%s->%s", location, destination);
        return count+1;
    }

    for (n of nodes) {
        console.log("%s->%s", location, n);
        if (n == destination) {
            return count;
        }
        traversed.push(n);
        count = count + 1;
        return traverse(n, destination, traversed, count);
    }
}
