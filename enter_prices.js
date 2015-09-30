#!/Users/jon.boydell/.nman/node/v4.0.0/bin/node
var commodities = require("./commodity_list.json");
var readline = require('readline');
var fs = require('fs');

var existing = false;
var location_name;
var location_file_name;

process.argv.forEach(function (val, index, array) {
    if (index == 2) {
        location_name = val;
        if (location_name.indexOf(".json") > -1) {
            location_file_name = "market/" +  location_name;
            location_name = location_name.replace(".json", "");
        } else {
            location_file_name = "market/" + location_name + ".json";
        }
    }
});

if (location_name) {
    var rl = readline.createInterface(process.stdin, process.stdout);
    fs.exists(location_file_name, function(exists) {
        if (exists) {
            main_loop(JSON.parse(fs.readFileSync(location_file_name)).prices);
        } else {
            main_loop();
        }
    });
} else {
    console.log("Usage: enter_prices.js station_name");
}

function build_prompt(commodity, existing_price)
{
    var prompt = commodity + ">";
    if (existing_price) {
        prompt = commodity + "(sell=" + existing_price.sell + ", buy=" + existing_price.buy + ") >";
    }
    return prompt;
}

function input_or_default(input, def) {
    if (input) {
        return input;
    }
    return def;
}

function input_or_zero(input) {
    if (input) {
        return input;
    }
    return 0;
}

function main_loop(existing_prices) {

    var x = 0;
    var commodity = next_commodity(commodities, x++);
    var prices = [];

    var def_sell = 0;
    var def_buy = 0;
    var existing_price = get_existing_price(existing_prices, commodity);
    if (existing_price) {
        def_sell = existing_price.sell;
        def_buy = existing_price.buy;
    }

    var prompt = build_prompt(commodity, existing_price);
    rl.setPrompt(prompt);
    rl.prompt();

    rl.on('line', function(line) {
        line = line.trim();

        var delimiter = " ";
        if (line.indexOf("\t") > -1) {
            delimiter = "\t";
        }

        var sell = input_or_default(line.split(delimiter)[0], def_sell);
        var buy = input_or_default(line.split(delimiter)[1], def_buy);

        if (valid_input(buy) && valid_input(sell)) {
            var price = new Object();
            price.name = commodity;
            price.buy = buy;
            price.sell = sell;
            prices.push(price);
            commodity = next_commodity(commodities, x++);
        }

        if (commodity) {
            def_sell = 0;
            def_buy = 0;
            existing_price = get_existing_price(existing_prices, commodity);
            if (existing_price) {
                def_sell = existing_price.sell;
                def_buy = existing_price.buy;
            }

            prompt = build_prompt(commodity, existing_price);
            rl.setPrompt(prompt);
            rl.prompt();
        } else {
            rl.close();
        }
    }).on('close',function(){
        var location_prices = new Object();
        location_prices.name = location_name;
        location_prices.prices = prices;
        console.log(location_prices);
        var filename = location_file_name.replace(" ", "_");

        fs.writeFile(filename, JSON.stringify(location_prices), function (err) {
            if (err) return console.log(err);
        });
    });
}

function get_existing_price(existing_prices, name)
{
    for (var x in existing_prices)
    {
        if (name == existing_prices[x].name)
        {
            return existing_prices[x];
        }
    }
}

function next_commodity(com, index) {
    return com[index];
}

function valid_input(input) {
    return !isNaN(parseFloat(input)) && isFinite(input);
}
