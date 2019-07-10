var station_query_prefix = "https://geo.weather.gc.ca/geomet/features/collections/climate-monthly/items?&STATION_NAME=%22";
var station_query = "https://geo.weather.gc.ca/geomet/features/collections/climate-monthly/items?&STATION_NAME=%22SASKATOON SRC%22";
var current_station = "SASKATOON SRC";
// var station_query = "https://geo.weather.gc.ca/geomet/features/collections/climate-monthly/items?&STATION_NAME=%22WRIGLEY A%22";
// var station_query = "https://geo.weather.gc.ca/geomet/features/collections/climate-monthly/items?&STATION_NAME=%22TULITA A%22";
// var station_query = "https://geo.weather.gc.ca/geomet/features/collections/climate-monthly/items?&STATION_NAME=%22WOODSTOCK%22";

function updateStation(newStation) {
    current_station = newStation;
    station_query = station_query_prefix + current_station + "%22";
    let $station = $("#currentDiv");
    $station.text(current_station);
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function temp_to_color(temp) {
    s = 1;

    if (temp < 0) {
        h = 250 / 360;
        l = (1 - (temp / -5)) ;
    } else if (temp >= 0) {
        h = 360 / 360;
        l = (1 - (temp / 5)) ;
    }

    rgb = hslToRgb(h, s, l);

    return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
}

var dates = [];

function parse_climate_data(data) {
    var temperature_values = [];
    data["features"].forEach(function (feat) {
        temperature_values.push({
            "temp": feat.properties.MEAN_TEMPERATURE,
            "date": feat.properties.LOCAL_DATE,
            "month": feat.properties.LOCAL_MONTH,
            "normal": feat.properties.NORMAL_MEAN_TEMPERATURE
        });
    });

    temperature_values.sort(
        (a, b) => a.date < b.date ? -1 : (a.date > b.date ? 1 : 0)
    );

    var vertices = [];
    for (let [index, val] of temperature_values.entries()) {
        var z = 4.0 * Math.cos((val.month / 12) * 2 * Math.PI);
        var x = 4.0 * Math.sin((val.month / 12) * 2 * Math.PI);
        var y = (val.temp) / 10.0;

        vertices.push([x, y, z]);

        dates.push(val.date);
    }

    return vertices;
}

var MAX_POINTS=1000;

function main() {
    const canvas = document.querySelector("#glCanvas");

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500);
    var renderer = new THREE.WebGLRenderer({
        "canvas": canvas
    });

    var grid_radius = 5;
    var radials = 16;
    var circles = 1;
    var divisions = 12;
    var helper = new THREE.PolarGridHelper( grid_radius, radials, circles, divisions );
    scene.add(helper);


    var material = new THREE.LineBasicMaterial( { linewidth: 2, vertexColors: THREE.VertexColors} );
    var material_highlight = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 4 });
    var material_archive = new THREE.LineBasicMaterial( { color: 0x808080, linewidth: 1 });

    var geometry = new THREE.BufferGeometry();
    var geometry_highlight = new THREE.BufferGeometry();
    var geometry_archive = new THREE.BufferGeometry();

    var drawCount = 2;
    var vertices_fetched = false;
    $.get( station_query, function( data ) {
        vertices = parse_climate_data(data);


        var idx = 0;
        var positions_list = [];
        for(var i = 0; i < vertices.length - 1; i++) {
            positions_list[idx++] = vertices[i][0];
            positions_list[idx++] = vertices[i][1];
            positions_list[idx++] = vertices[i][2];
        }

        var positions = new THREE.Float32BufferAttribute(positions_list, 3);

        idx = 0;
        var colors_list = [];
        for(var i = 0; i < vertices.length; i++) {
            col = temp_to_color(vertices[i][1]);
            colors_list[idx++] = col[0];
            colors_list[idx++] = col[1];
            colors_list[idx++] = col[2];
        }
        var colors = new THREE.Float32BufferAttribute(colors_list, 3);

        geometry.addAttribute( 'position', positions);
        geometry.addAttribute( 'color', colors);
        geometry.setDrawRange( 0, drawCount );


        geometry_highlight.addAttribute('position', positions);
        geometry_highlight.setDrawRange(0, 1);

        geometry_archive.addAttribute('position', positions);
        geometry_archive.setDrawRange(0, 0);

        var line = new THREE.Line( geometry, material );
        var highlight = new THREE.LineSegments( geometry_highlight, material_highlight);
        var archive = new THREE.LineSegments( geometry_archive, material_archive);

        scene.add(line);
        scene.add(highlight);
        scene.add(archive);

        vertices_fetched = true;
    });



    var camera_angle = 0.0;
    var current_vertex = 0;


    skip = 0;

    function animate() {
	      requestAnimationFrame( animate );

        var non_archive_draw = 10;

        if (vertices_fetched === true && skip % 3 == 0) {
            drawCount += 1;

            if (drawCount >= dates.length) {
                drawCount = 0;
            }

            // geometry.setDrawRange(Math.max(drawCount - non_archive_draw, 0), non_archive_draw);
            geometry.setDrawRange(0, drawCount);
            geometry_highlight.setDrawRange(drawCount - 6, 6);
            // geometry_archive.setDrawRange(Math.max(drawCount - non_archive_draw, 0), non_archive_draw);
            // geometry_archive.setDrawRange(0, Math.max(drawCount - non_archive_draw, 0));
        }

        camera_angle += 0.01;

        z = 10.0 * Math.cos(camera_angle);
        x = 10.0 * Math.sin(camera_angle);
        camera.position.set(x, 1, z);
        camera.lookAt(0,0,0);

	      renderer.render( scene, camera );

        skip++;

        $("#dateDiv").html(dates[drawCount]);
    }
    animate();
}


// Set and show stuff depending on button pressed
function showStuff(id) {
    
    console.log(id)

    var canvas = document.getElementById('canvas');
    var map = document.getElementById('cartoMap')
    
    if (id == map) {
        canvas.style.display = "none";                
        // This will regenerate the carto thingy
        //map.src = "https://etienneboutet.carto.com/builder/4e530f7d-3a9a-4f85-8ba7-b0873baa8c46/embed"
        map.style.display = "block";
    } else {
        canvas.style.display = "block";
        map.style.display = "none";
    }

}

// Hide the viz tools
var viz = document.getElementById('viz');
var loading = document.getElementById('loading');
viz.style.display = 'none';

// Wait 5 seconds   
setTimeout(function () {
    viz.style.display = "block";
    loading.style.display = "none";
}, 5000);

// Hide map for now 
//var canvas = document.getElementById('canvas');
//var map = document.getElementById('cartoMap');
//map.style.display = "none";
//canvas.style.display = "block";

main();
