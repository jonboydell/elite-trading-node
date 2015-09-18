var routes = require("./routes.json");

var start;
var end;

process.argv.forEach(function (val, index, array) {
    if (index == 2) {
        start = val;
    }

    if (index == 3) {
        end = val;
    }
});

var route_map = new Map();

for (route_pair of routes) {
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

var y = 0;
var p = 0;

function route(start, end, route_map, route_list) {
    y++;
    var systems = route_map.get(start);
    if (systems) {
        if (systems.indexOf(end) > -1) {
            return end;
        }
        route_map.delete(start);

        for (var i = 0; i < systems.length; i++) {
            var x = route(systems[i], end, route_map, route_list);
            if (x) {
                route_list.push(systems[i]);
                p++;
                return x;
            }
        }
    }
}

if (start && end && route_map.get(start) && route_map.get(end)) {
    var route_list = [];
    console.log("result ", route(start, end, route_map, route_list));
    console.log("iterations ", y);
    console.log("good iterations ", p);
    console.log(route_list);
}
