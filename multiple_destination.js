var fs = require('fs');
var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);
var markets = load_markets("./market");

var cargo = 0;
var capital = 0;

rl.on('line', function(line) {
    if (line == "all") {
        for (location of markets.keys()) {
            var recommendations = get_recommended_buys_at_location(location, markets, cargo, capital);
            for (recommendation of recommendations) {
                console.log("%s->%s %s (b:%d, s:%d)",
                        recommendation.location,
                        recommendation.destination,
                        recommendation.commodity,
                        recommendation.buy,
                        recommendation.sell,
                        recommendation.buy * 6,
                        recommendation.sell * 6,
                        recommendation.max_price_delta * 6
                );
            }
        }
    } else if (line.startsWith("l")) {
        var location = line.slice(line.indexOf(" ")+1);
        var recommendations = get_recommended_buys_at_location(location, markets, cargo, capital);
        for (recommendation of recommendations) {
            console.log("%s->%s %s (b:%d, s:%d)",
                    recommendation.location,
                    recommendation.destination,
                    recommendation.commodity,
                    recommendation.buy,
                    recommendation.sell,
                    recommendation.buy * 6,
                    recommendation.sell * 6,
                    recommendation.max_price_delta * 6
            );
        }
    } else if (line.startsWith("cargo")) {
        cargo = line.slice(line.indexOf(" ")+1);
        console.log("cargo:"+cargo);
    } else if (line.startsWith("capital")) {
        capital = line.slice(line.indexOf(" ")+1);
        console.log("capital:"+capital);
    } else if (line.startsWith("status")) {
        console.log("cargo:"+cargo);
        console.log("capital:"+capital);
    }
}).on('close',function() {

});

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
                        var price_delta = destination_location_price.sell - buy_location_prices.get(commodity).buy;
                        if (price_delta > 0) {
                            //console.log("%s %d %d %d",
                            //        commodity,
                            //        buy_location_prices.get(commodity).buy,
                            //        destination_location_price.sell,
                            //        price_delta
                            //    );
                        }
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
