const map = L.map("map", {
  minZoom: 2,
});

map.setView([34.02, -118.805], 13);

const apiKey =
  "AAPKd1c112b72ffc4270979ce28b38caf51bG5gww1VWGakZZw7uI6elrbniOPqNVNxuooBM3XBKeRcsxER00lFjXe2ny2JGsKLG";

const basemapEnum = "arcgis/streets";

L.esri.Vector.vectorBasemapLayer(basemapEnum, {
  apiKey: apiKey,
}).addTo(map);

var trailheads = L.esri.featureLayer({
  url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads_Styled/FeatureServer/0",
});

trailheads.addTo(map);

trailheads.bindPopup(function (layer) {
  return L.Util.template(
    "<b>{TRL_NAME}</b><br>{PARK_NAME}</br>",
    layer.feature.properties
  );
});

var trails = L.esri.featureLayer({
  url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails_Styled/FeatureServer/0",
});

trails.addTo(map);

var parks = L.esri.featureLayer({
  url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space_Styled/FeatureServer/0",
});

parks.addTo(map);

var parcels = L.esri
  .featureLayer({
    url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/LA_County_Parcels/FeatureServer/0",
    simplifyFactor: 0.5,
    precision: 4,
    where: "1 = 0", // Hide the feature layer until queried
  })
  .addTo(map);

map.pm.addControls({
  position: "topleft",
  // Customize the visible tools
  editControls: false,
  drawRectangle: false,
  drawCircle: false,
  drawCircleMarker: false,
  drawText: false,
});

map.pm.setGlobalOptions({
  pathOptions: {
    weight: 2,
    color: "#4d4d4d",
    fillColor: "#808080",
    fillOpacity: 0.2,
    dashArray: [4, 4],
  },
});
var previousLayer;
map.on("pm:create", ({ shape, layer }) => {
  if (previousLayer) {
    previousLayer.remove();
  }
  previousLayer = layer;

  var feature = layer.toGeoJSON();
  parcels
    .query()
    .intersects(feature.geometry)
    .limit(2000)
    .ids(function (error, queryResult) {
      parcels.setWhere("OBJECTID IN (" + queryResult.join(",") + ")");
    });
});

parcels.bindPopup(function (layer) {
  return L.Util.template(
    "<b>Parcel {APN}</b>" +
      "Type: {UseType} <br>" +
      "Tax Rate City: {TaxRateCity}",
    layer.feature.properties
  );
});
