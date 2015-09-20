#!/Users/jon.boydell/.nman/node/v4.0.0/bin/node
var fs = require('fs');
var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);
var markets = load_markets("./market");
var systems = load_systems("./system");
var routes = require("./routes.json");

var cargo = 4;
var capital = 1000;
print_status();

rl.on('line', function(line) {
    var components = line.split(" ");
    var command = components[0];
    if ("show" == command) {
        var subject = components[1];
        if ("all" == subject) {
            pretty_print_headers();
            for (location of markets.keys()) {
                var recommendations = get_recommended_buys_at_location(location, markets, cargo, capital);
                for (recommendation of recommendations) {
                    pretty_print_recommendation(recommendation, cargo);
                }
            }
        } else if ("market" == subject) {
            var location = components[2];
            if (markets.has(location)) {
                pretty_print_headers();
                var recommendations = get_recommended_buys_at_location(location, markets, cargo, capital);
                for (recommendation of recommendations) {
                    pretty_print_recommendation(recommendation, cargo);
                }
            } else {
                console.log("location doesn't exist ", location);
            }
        } else if ("commodity" == subject) {
            input_commodity = components[2];
            if (components[3]) {
                input_commodity = input_commodity + " " + components[3];
            }

            console.log("%s",
                space_out("location", 25),
                space_out("buy", 10),
                space_out("sell", 10));

            console.log("----------------------------------------");

            for (location of markets.keys()) {
                var location_prices = markets.get(location);
                for (commodity of location_prices.keys()) {
                    if(input_commodity == commodity) {
                        console.log("%s",
                            space_out(location, 25),
                            space_out(location_prices.get(commodity).buy, 10),
                            space_out(location_prices.get(commodity).sell, 10));
                    }
                }
            }
        } else if ("market_buy" == subject) {

            location = components[2];

            if (market_exists(location, function() {
                var location_prices = markets.get(location);
                console.log("%s",
                    space_out("commodity", 25),
                    space_out("buy", 10),
                    space_out("sell", 10));

                console.log("----------------------------------------");

                for (commodity of location_prices.keys()) {
                    if (location_prices.get(commodity).buy > 0 ) {
                        console.log("%s",
                            space_out(commodity, 25),
                            space_out(location_prices.get(commodity).buy, 10),
                            space_out(location_prices.get(commodity).sell, 10));
                    }
                }
            }));
        } else if ("market_sell" == subject) {

            location = components[2];

            if (market_exists(location, function() {
                var location_prices = markets.get(location);
                console.log("%s",
                    space_out("commodity", 25),
                    space_out("buy", 10),
                    space_out("sell", 10));

                console.log("----------------------------------------");

                for (commodity of location_prices.keys()) {
                    if (location_prices.get(commodity).sell > 0 ) {
                        console.log("%s",
                            space_out(commodity, 25),
                            space_out(location_prices.get(commodity).buy, 10),
                            space_out(location_prices.get(commodity).sell, 10));                    }
                }
            }));
        } else {
            console.log("unknown option for sell command, try 'all, commodity <name>, market <name>, market_sell <name>, market_buy <name>'");
        }
    } else if ("cargo" == command) {
        cargo = components[1];
        print_status();
    } else if ("capital" == command) {
        capital = components[1]
        print_status();
    } else {
        console.log("unknown command, try 'show all'");
    }

}).on('close',function() {

});

function market_exists(market_name, fn) {
    if (markets.has(market_name)) {
        fn();
    } else {
        console.log("Market doesn't exist ", market_name);
    }
}

function load_markets(market_directory) {
    var markets = new Map();
    fs.readdirSync(market_directory).forEach(function(market_filename) {
        var qualified_market_filename = market_directory + "/" + market_filename;
        var market_prices = JSON.parse(fs.readFileSync(qualified_market_filename)).prices;

        market_name = market_filename.substring(0, market_filename.indexOf(".json"));
        parse_market_to_map(markets, market_name, market_prices);
    });
    return markets;
}

function load_systems(system_directory) {
    var systems = new Map();
    fs.readdirSync(system_directory).forEach(function(system_filename) {
        var qualified_system_filename = system_directory + "/" + system_filename;
        var stations = JSON.parse(fs.readFileSync(qualified_system_filename)).stations;

        system_name = system_filename.substring(0, system_filename.indexOf(".json"));
        for (station of stations) {
            systems.set(station, system_name);
        }
    });
    return systems;
}

function parse_market_to_map(market_map, market_name, market_prices) {
    market_map.set(market_name, parse_prices_to_map(market_prices));
    return market_map;
}

function parse_prices_to_map(prices) {
    var price_map = new Map();
    for (price of prices) {
        var buy_sell = new Object();
        if (price.buy > 0 || price.sell > 0) {
            buy_sell.buy = price.buy;
            buy_sell.sell = price.sell;
            price_map.set(price.name, buy_sell);
        }
    }
    return price_map;
}

function get_recommended_buys_at_location(location, markets, max_cargo, max_buy_value) {
    var max_buys = [];
    var buy_location_prices = markets.get(location);
    for (destination of markets.keys()) {
        if (location != destination) {
            var max_price_delta = 0;
            var max_buy = new Object();
            var destination_prices = markets.get(destination);
            for (commodity of destination_prices.keys()) {
                var destination_location_price = destination_prices.get(commodity);
                if (destination_location_price.sell > 0) {
                    if (buy_location_prices.has(commodity) && buy_location_prices.get(commodity).buy > 0) {
                        var total_buy_value = buy_location_prices.get(commodity).buy * max_cargo;
                        var total_sell_value = destination_location_price.sell * max_cargo;
                        var price_delta = destination_location_price.sell - buy_location_prices.get(commodity).buy;

                        // @todo: this should actually be based on the total_sell_value, rather than the max_price_delta
                        // @todo: OR should it be biggest total profit (total_sell_value - total_buy_value)

                        if (price_delta > max_price_delta && total_buy_value < max_buy_value) {
                            max_price_delta = price_delta;
                            max_buy.location = location;
                            max_buy.destination = destination;
                            max_buy.commodity = commodity;
                            max_buy.buy = buy_location_prices.get(commodity).buy;
                            max_buy.sell = destination_location_price.sell;
                            max_buy.max_price_delta = max_price_delta;
                        }
                    }
                }
            }
            max_buys.push(max_buy);
        }
    }
    return max_buys;
}

function print_status() {
    console.log("cargo:"+cargo);
    console.log("capital:"+capital);
}

function print_recommendation(recommendation, cargo) {
    if(recommendation.location) {
        console.log("%s->%s %s (b:%d, s:%d)",
                recommendation.location,
                recommendation.destination,
                recommendation.commodity,
                recommendation.buy,
                recommendation.sell,
                recommendation.buy * cargo,
                recommendation.sell * cargo,
                recommendation.max_price_delta * cargo
        );
    }
}

function space_out(str, column_length) {
    str = ""+str;
    var n = column_length - str.length;
    var x = "";
    for (var i = 0; i < n; i++)
    {
        x = x + " ";
    }
    return str + x;
}

function pretty_print_headers() {
    console.log("%s%s%s",
            space_out("location", 40),
            space_out("destination", 40),
            space_out("commodity", 20),
            space_out("buy", 8),
            space_out("sell", 8),
            space_out("total buy", 10),
            space_out("total sell", 10),
            space_out("profit", 8)
    );
    console.log("------------------------------------------------------------------------------------------------------------");
}

function pretty_print_recommendation(recommendation, cargo) {

    if(recommendation.location) {

        var total_buy_value = recommendation.buy * cargo;
        var total_sell_value = recommendation.sell * cargo;
        var total_profit = recommendation.max_price_delta * cargo;

        console.log("%s%s%s",
                space_out(recommendation.location + " " + systems.get(recommendation.location), 40),
                space_out(recommendation.destination + " " + systems.get(recommendation.destination), 40),
                space_out(recommendation.commodity, 20),
                space_out(recommendation.buy, 8),
                space_out(recommendation.sell, 8),
                space_out(total_buy_value, 10),
                space_out(total_sell_value, 10),
                space_out(total_profit, 8)
        );

    }

}
