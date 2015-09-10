var fs = require('fs');

var buy_location;
var sell_location;
var cargo = 0;
var max_outlay = 10000000;

process.argv.forEach(function (val, index, array) {
    if (index == 2) {
        buy_location = val;
    }

    if (index == 3) {
        cargo = val;
    }

    if (index == 4) {
        max_outlay = val;
    }
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

function get_prices_for_market(market_name, markets) {
    return markets.get(market_name);
}

function get_buys(prices) {
    var buys = [];
    for (var x = 0; x < prices.length; x++) {
        var buy_price = prices[x];
        if (buy_price.buy && buy_price.buy > 0) {
            buys.push(buy_price);
        }
    }
    return buys;
}

function get_sells(prices) {
    var sells = [];
    for (var x = 0; x < prices.length; x++) {
        var sell_price = prices[x];
        if (sell_price.sell && sell_price.sell > 0) {
            sells.push(sell_price);
        }
    }
    return sells;
}

function get_destinations(current_location, markets) {
    var destinations = [];
    for (market_name of markets.keys()) {
        if (current_location != market_name) {
            destinations.push(market_name);
        }
    }
    return destinations;
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
            //console.log("%s %s %s %d", location, destination, max_buy.commodity, max_price_delta * max_cargo);
        }
    }
    return max_buys;
}

var markets = load_markets("./market");
for (location of markets.keys()) {
    var recommendations = get_recommended_buys_at_location(location, markets, 6, 15000);
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


/**current_location_prices = get_prices_for_market(buy_location, markets);
current_location_buys = get_buys(current_location_prices);

var destinations = get_destinations(buy_location, markets);

var max_buy;
var max_profit = 0;
var location;

for (destination of destinations) {
    var destination_sells = get_sells(get_prices_for_market(destination, markets));
    console.log(destination);
    console.log("---");
    for (buy_price of current_location_buys) {
        for (sell_price of destination_sells) {
            if (buy_price.name == sell_price.name) {
                var commodity = buy_price.name;
                var buy = buy_price.buy;
                var sell = sell_price.sell;
                var delta = sell - buy;
                if (delta > 0) {
                    var output_string = commodity + " " + buy + " " + sell + " " + delta;
                    if (cargo > 0) {
                        var total_sell_value = cargo * sell;
                        var total_buy_value = cargo * buy;
                        var total_profit = total_sell_value - total_buy_value;
                        if (total_profit > max_profit && max_outlay > total_buy_value) {
                            location = destination;
                            max_buy = buy_price;
                            max_profit = total_profit;
                        }
                        output_string = output_string + " " + total_buy_value + " " + total_sell_value + " profit=" + total_profit;
                    }
                    console.log(output_string);
                }
            }
        }
    }
}
console.log(location + " " + max_buy.name + " " + max_profit);

**/
