var defaultAddress = "J. Hernandez Ave, Naga, Camarines Sur, Philippines";
var geocoder;
var map;
var directionsService;
var directionsDisplay;

var startBtn = document.getElementById('startBtn');
var endBtn = document.getElementById('endBtn');

// add event for changing the position of the marker
startBtn.addEventListener('click', function(){
  geocodeMarker(document.getElementById('startAddress').value, 'origin');
});

endBtn.addEventListener('click', function(){
  geocodeMarker(document.getElementById('endAddress').value, 'destination');
});

function initMap(){
  geocoder = new google.maps.Geocoder();

  geocoder.geocode( { 'address': defaultAddress}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map = new google.maps.Map(document.getElementById('map'), {
          zoom: 16,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            mapTypeIds:[google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP] 
          },
          center: results[0].geometry.location,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      });

      map.setCenter(results[0].geometry.location);

      // initialize the marker of the map
      startMarker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          draggable: true,
          title: 'Start',
          icon: 'http://maps.google.com/mapfiles/ms/micons/cycling.png'
      });

      endMarker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          draggable: true,
          title: 'End',
          icon: 'http://maps.google.com/mapfiles/ms/micons/flag.png'
      });

      directionsService = new google.maps.DirectionsService;
      directionsDisplay = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true
      });

      // set the markers
      geocodePosition(startMarker.getPosition(), 'origin');
      geocodePosition(endMarker.getPosition(), 'destination');


      // markers events
      google.maps.event.addListener(startMarker, 'dragstart', function() {
        updateMarkerAddress('Dragging...', 'origin');
      });

      google.maps.event.addListener(endMarker, 'dragstart', function() {
        updateMarkerAddress('Dragging...', 'destination');
      });

      google.maps.event.addListener(startMarker, 'drag', function() {
          updateMarkerPosition(startMarker.getPosition(), 'start');
      });

      google.maps.event.addListener(endMarker, 'drag', function() {
          updateMarkerPosition(endMarker.getPosition(), 'end');
      });

      google.maps.event.addListener(startMarker, 'dragend', function() {
        displayRoute(startMarker.getPosition(), endMarker.getPosition(), directionsService,
        directionsDisplay);
        geocodePosition(startMarker.getPosition(), 'origin');
        map.panTo(startMarker.getPosition()); 
      });

      google.maps.event.addListener(endMarker, 'dragend', function() {
        displayRoute(startMarker.getPosition(), endMarker.getPosition(), directionsService,
        directionsDisplay);
        geocodePosition(endMarker.getPosition(), 'destination');
        map.panTo(endMarker.getPosition()); 
      });

      updateMarkerPosition(startMarker.getPosition(), 'start'); 
      updateMarkerPosition(endMarker.getPosition(), 'end'); 
  
    }
    else{
      alert('Failed to initialize map');
    }
  });
}

// changes the position of the marker
function geocodeMarker(address, loc){
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if(loc == 'origin'){
        startMarker.setPosition(results[0].geometry.location);
        updateMarkerPosition(startMarker.getPosition(), 'start'); 
        updateMarkerPosition(endMarker.getPosition(), 'end'); 
        displayRoute(startMarker.getPosition(), endMarker.getPosition(), directionsService,
        directionsDisplay);
        geocodePosition(startMarker.getPosition(), 'origin');
        map.panTo(startMarker.getPosition());          
      }
      else{
        endMarker.setPosition(results[0].geometry.location);
        updateMarkerPosition(startMarker.getPosition(), 'start'); 
        updateMarkerPosition(endMarker.getPosition(), 'end'); 
        displayRoute(startMarker.getPosition(), endMarker.getPosition(), directionsService,
        directionsDisplay);
        geocodePosition(endMarker.getPosition(), 'destination');
        map.panTo(endMarker.getPosition());          
      }
    }
  });
}

function geocodePosition(pos, loc) {
  geocoder.geocode({
    latLng: pos
  }, function(responses) {
    if (responses && responses.length > 0) 
      updateMarkerAddress(responses[0].formatted_address, loc);
    else
      updateMarkerAddress('Cannot determine address at this location.');
  });
}

function updateMarkerPosition(latLng, loc) {
  if(loc == 'start'){
    document.getElementById('originLat').innerHTML = latLng.lat();
    document.getElementById('originLng').innerHTML = latLng.lng();
  }
  else{
    document.getElementById('destLat').innerHTML = latLng.lat();
    document.getElementById('destLng').innerHTML = latLng.lng();
  }
}

// change the address
function updateMarkerAddress(str, loc){
  if(loc == 'origin')
    document.getElementById('originAddress').innerHTML = str;
  else
    document.getElementById('destAddress').innerHTML = str;
}


function displayRoute(origin, destination, service, display) {
  service.route({
    origin: {
      lat: origin.lat(),
      lng: origin.lng(),
    },
    destination:  {
      lat: destination.lat(),
      lng: destination.lng(),
    },
    optimizeWaypoints: true,
    travelMode: 'WALKING',
    avoidTolls: true
  }, function(response, status) {
    if (status === 'OK') {
      display.setDirections(response);
    } else {
      alert('Could not display directions due to: ' + status);
    }
  });
}