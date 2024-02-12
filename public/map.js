function initMap(lat, lon) {
    const map = new google.maps.Map(document.getElementById("map-container"), {
        center: { lat: parseFloat(lat), lng: parseFloat(lon) },
        zoom: 10
    });

    // Add a marker for the city
    new google.maps.Marker({
        position: { lat: parseFloat(lat), lng: parseFloat(lon) },
        map: map,
        title: '<%= cityName %>'
    });
}
