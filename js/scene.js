/*
 * JavaScript for drawing the Balloons in the SVG
 *
 * This work is licensed under the Creative Commons
 * Attribution-ShareAlike 3.0 Unported License. To view a copy of this
 * license, visit http://creativecommons.org/licenses/by-sa/3.0/ or
 * send a letter to Creative Commons, 444 Castro Street, Suite 900,
 * Mountain View, California, 94041, USA.
 * 
 */

var palette = ['#A50026', '#D73027', '#F46D43', '#FDAE61', '#FEE08B',
               '#D9EF8B', '#A6D96A', '#66BD63', '#1A9850', '#006837'];

function makeBalloon(parent, x, y, scale, color) {
    /* Draw the balloon and it's label using jquery svg plugin
    */
    var g = _svg.group();

    // create a balloon and add it to the balloon group
    _svg.use(g, 0, 0, null, null, "#balloon",
             { fill: color,
               transform: 'translate('+x+', '+y+') scale('+scale+')' });

    // draw label to the right if the balloon is on the right
    var label_x = (x > 420/2) ? 420 : 0;

    _svg.line(g, label_x, y, x, y, { stroke: 'white',
                                     strokeWidth: 0.3,
                                     strokeDasharray: '2 1'});

    parent.appendChild(g);
    return g;
}

function drawScene(parent, width, height, apikey, chartid, limit) {
    /* Draw the balloon scene
    */
    var charturl = jQuery.validator.format("http://api.semetric.com/chart/{0}", chartid);

    /* Make the API call to the Musicmetric API to get the
       chart data
    */
    $.getJSON(charturl,
      { 'token': apikey, 'limit': limit },
      function(data) {
        // chart request successful
        console.log("Recieved response from API");
        if (data['success']) {
            var chart = data['response'];
            console.log("Using random seed: "+chart['id']);

            var mersenne = new MersenneTwister(parseInt(chart['id'], 16));
            // Limit the chart
            var cdata = chart['data'].slice(0, limit);

            // find the max and min values 
            var values = $.map(cdata, function(d) { return d.value; });
            var maxval = Math.max.apply(Math, values);
            var minval = Math.min.apply(Math, values);

            // iterate all the artists in the chart
            $(cdata).each(function(i, item) {
                // normalise the value
                var scale = 0.2+(item.value-minval)*(1.0-0.2)/(maxval-minval);
                /* 170 is the width of the balloon */
                var x = mersenne.random()*(width-(scale*170))
                var y = height*(1-scale);

                console.debug(item.rank, item.artist.name, item.value, scale);

                makeBalloon(parent, x, y, scale, palette[i%palette.length]);
            });
        } else {
            console.error("Chart request failed.")
        }
      });
}
