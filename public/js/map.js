// mapboxgl.accessToken = mapToken;

// const map = new mapboxgl.Map({
//     container: "map", // container ID
//     style: "mapbox://styles/mapbox/streets-v12",
//     center: listing.geometry.coordinates,//, // starting position [lng, lat]
//     zoom: 9,// starting zoom
// });

// console.log(`coordinates: ${coordinates}`);

// const marker = new mapboxgl.Marker({ color: "red" })
//     .setLngLat(listing.geometry.coordinates)
//     .setPopup(
//         new mapboxgl.Popup({ offset: 25}).setHTML(
//             `<h4>${listing.title}</h4><P>Exact location provided after booking</P>`
//         )
//     )
//     .addTo(map);