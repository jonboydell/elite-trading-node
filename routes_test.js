#!/Users/jon.boydell/.nman/node/v4.0.0/bin/node
var r = require("./route.js");
var routes_array = require("./routes_array.json");

r.init(routes_array);

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

if (start && end) {
    var route_list = [];
    r.route(start, end, route_list, function(system, routes) { console.log(system); });
    //console.log(route_list.length);
}
