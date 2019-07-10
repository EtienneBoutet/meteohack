// var station_query = "https://geo.weather.gc.ca/geomet/features/collections/climate-monthly/items?&STATION_NAME=%22SASKATOON SRC%22"
// var station_query = "https://geo.weather.gc.ca/geomet/features/collections/climate-monthly/items?&STATION_NAME=%22WRIGLEY A%22";
// var station_query = "https://geo.weather.gc.ca/geomet/features/collections/climate-monthly/items?&STATION_NAME=%22TULITA A%22";
var station_query = "https://geo.weather.gc.ca/geomet/features/collections/climate-monthly/items?&STATION_NAME=%22WOODSTOCK%22";

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
        l = 1 - (temp / -5);
    } else if (temp >= 0) {
        h = 360 / 360;
        l = 1 - (temp / 5);
    }

    rgb = hslToRgb(h, s, l);

    return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
}

function parse_climate_data(data) {
    var temperature_values = [];
    data["features"].forEach(function (feat) {
        temperature_values.push({
            "temp": feat.properties.MEAN_TEMPERATURE,
            "date": feat.properties.LOCAL_DATE,
            "month": feat.properties.LOCAL_MONTH,
        });

    });

    temperature_values.sort(
        (a, b) => a.date < b.date ? -1 : (a.date > b.date ? 1 : 0)
    );

    var vertices = [];
    for (let [index, val] of temperature_values.entries()) {
        var z = 4.0 * Math.cos((val.month / 12) * 2 * Math.PI);
        var x = 4.0 * Math.sin((val.month / 12) * 2 * Math.PI);
        var y = val.temp / 10.0;

        vertices.push([x, y, z]);
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
    var geometry = new THREE.BufferGeometry();
    var geometry_highlight = new THREE.BufferGeometry();
    var drawCount = 2;
    var vertices_fetched = false;
    $.get( station_query, function( data ) {
        vertices = parse_climate_data(data);

        var positions = new Float32Array(MAX_POINTS * 3);
        var colors = new Float32Array(MAX_POINTS * 3);

        var idx = 0;
        for(var i = 0; i < vertices.length; i++) {
            positions[idx++] = vertices[i][0];
            positions[idx++] = vertices[i][1];
            positions[idx++] = vertices[i][2];
        }

        idx = 0;
        for(var i = 0; i < vertices.length; i++) {
            col = temp_to_color(vertices[i][1]);
            //console.log(col);
            colors[idx++] = col[0];
            colors[idx++] = col[1];
            colors[idx++] = col[2];
        }

        geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
        geometry.setDrawRange( 0, drawCount );


        geometry_highlight.addAttribute('position', new THREE.BufferAttribute( positions, 3 ));
        geometry_highlight.setDrawRange(0, 1);
        var line = new THREE.Line( geometry, material );
        var highlight = new THREE.LineSegments( geometry_highlight, material_highlight);
        scene.add(line);
        scene.add(highlight);

        vertices_fetched = true;
    });



    var camera_angle = 0.0;
    var current_vertex = 0;


    skip = 0;

    function animate() {
	      requestAnimationFrame( animate );

        if (vertices_fetched === true && skip % 3 == 0) {
            geometry.setDrawRange(0, ++drawCount);
            geometry_highlight.setDrawRange(drawCount - 2, 2);
        }

        camera_angle += 0.01;

        z = 10.0 * Math.cos(camera_angle);
        x = 10.0 * Math.sin(camera_angle);
        camera.position.set(x, 1, z);
        camera.lookAt(0,0,0);

	      renderer.render( scene, camera );

        skip++;
    }
    animate();
}


main();
