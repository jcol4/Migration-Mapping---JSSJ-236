

require([
  'Canvas-Flowmap-Layer/CanvasFlowmapLayer',
  'esri/graphic',
  'esri/map',
  'dojo/on',
  'dojo/domReady!'
], function(
    CanvasFlowmapLayer, 
    Graphic, 
    Map, on
) {

    var map = new Map("map", {
        basemap: "dark-gray-vector",    // can edit if we want (i think)
        center: [31.0461, 34.8516],     //center at Israel (can edit)
        zoom: 5                         //zoom level (can edit)
    });

});


//function to convert CSV rows to GeoJSON
function csvToGeoJSON(csvRows) {

    //initialize an empty array to hold features
    features = [];

    //loop through each row of the CSV
    csvRows.forEach(row => {

        //create a feature for each row
        feature = {

            "type": "Feature",
            "geometry": {

                "type": "Point",
                "coordinates": [row.o_lon, row.o_lat],

            },
            "properties": {

                //origin properties
                "origin_id": row.origin_id,
                "origin": row.origin,
                "o_lon": row.o_lon,
                "o_lat": row.o_lat,

                //destination properties
                "dest_id": row.dest_id,
                "dest": row.dest,
                "d_lon": row.d_lon,
                "d_lat": row.d_lat,

                "timeframe": row.timeframe,
                "type": row.type,
                "pop": row.pop,

            }

        }

        //add feature to features array
        features.push(feature); 

    });
    return {

        "type": "FeatureCollection",
        "features": features

    };  
}

let manyToOneData, oneToManyData;
let filesLoaded = 0;

function checkIfFilesLoaded() {
    if (filesLoaded === 2) {
        //both files are loaded, convert to GeoJSON and continue
        let manytoOneGeoJSON = csvToGeoJSON(manyToOneData);
        console.log("Many-to-One GeoJSON: ", manytoOneGeoJSON);

        let oneToManyGeoJSON = csvToGeoJSON(oneToManyData);
        console.log("One-to-Many GeoJSON: ", oneToManyGeoJSON);

        //call function to create flowmap layers here? ↓↓

    }

}

Papa.parse("../data/flow_many_2_one.csv", {

    download: true,
    header: true,
    dynamicTyping: true,
    complete: function(results) {

        manyToOneData = results.data;
        console.log("Many-to-One CSV loaded: ", manyToOneData);

        //convert to GeoJSON
        manytoOneGeoJSON = csvToGeoJSON(manyToOneData);
        console.log("Many-to-One GeoJSON: ", manytoOneGeoJSON); 

        filesLoaded++;
        checkIfFilesLoaded();
    }
});

Papa.parse("../data/flow_one_2_many.csv", {

    download: true,
    header: true,
    dynamicTyping: true,
    complete: function(results) {

        oneToManyData = results.data;
        console.log("One-to-Many CSV loaded: ", oneToManyData);

        //convert to GeoJSON
        oneToManyGeoJSON = csvToGeoJSON(oneToManyData);
        console.log("One-to-Many GeoJSON: ", oneToManyGeoJSON);

        filesLoaded++;
        checkIfFilesLoaded();

    }
});


//next steps:
//- create flowmap layers for each dataset
//- add interaction (hover, click, etc.)
//- style the layers (colors, widths, etc.) (if we want)



