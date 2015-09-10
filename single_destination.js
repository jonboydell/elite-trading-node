var fs = require('fs');

var buy_location;
var sell_location;
var cargo = 0;
var max_outlay = 0;

process.argv.forEach(function (val, index, array) {
    if (index == 2) {
        buy_location = val;
    }

    if (index == 3) {
        sell_location = val;
    }

    if (index == 4) {
        cargo = val;
    }

    if (index == 5) {
        max_outlay = val;
    }
});

var current_location = JSON.parse(fs.readFileSync("./market/" + buy_location + ".json")).prices;
var current_destination = JSON.parse(fs.readFileSync("./market/" + sell_location + ".json")).prices;

var buys = [];
for (var x = 0; x < current_location.length; x++) {
    var buy_price = current_location[x];
    if (buy_price.buy && buy_price.buy > 0) {
        buys.push(buy_price);
    }
}

var sells = [];
for (var x = 0; x < buys.length; x++) {
    var buy_price = buys[x];
    var sell_price = get_sell_price(current_destination, buy_price.name);
    var price_delta = sell_price.sell - buy_price.buy;
    var output = new Object();
    output.buy_location = buy_location;
    output.sell_location = sell_location;
    output.buy_price = buy_price;
    output.sell_price = sell_price;
    if (price_delta > 0) {
        sells.push(output);
    }
}

var test;
var max_profit = 0;

for (var x = 0; x < sells.length; x++) {
    var buy_price = sells[x].buy_price;
    var sell_price = sells[x].sell_price;
    var price_delta = sell_price.sell - buy_price.buy;
    var total_buy_value = buy_price.buy * cargo;
    var total_sell_value = sell_price.sell * cargo;
    var total_profit = total_sell_value - total_buy_value;
    if (total_buy_value <= max_outlay) {
        console.log("---")
        console.log(buy_price.name);
        console.log("total buy " + total_buy_value);
        console.log("total sell " + total_sell_value);
        console.log("total profit " + total_profit);
        if (total_profit > max_profit) {
            test = sells[x];
            max_profit = total_profit;
        }
    }
}

console.log(test);

function get_sell_price(prices, commodity) {
    for (var x = 0; x < prices.length; x++) {
        var sell_price = prices[x];
        if (commodity == sell_price.name) {
            return sell_price;
        }
    }
}
