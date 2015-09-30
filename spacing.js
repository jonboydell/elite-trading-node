exports.space_out = function space_out(str, column_length) {
    str = ""+str;
    var n = column_length - str.length;
    var x = "";
    for (var i = 0; i < n; i++)
    {
        x = x + " ";
    }
    return str + x;
};
