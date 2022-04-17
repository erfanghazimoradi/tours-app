import mapboxgl from 'mapbox-gl';

const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZXJmYW5jZSIsImEiOiJja3o1ZGVxYWEwMTgyMm5tZzFwNmJyZWJvIn0.igGqn1vFtAec-gI3VDssIw';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/erfance/ckz8zzts0000915nf2j9cpvk5',
    scrollZoom: false
  });

  const nav = new mapboxgl.NavigationControl();

  map.addControl(nav, 'top-right');

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(location => {
    new mapboxgl.Marker({ color: '#28b487' }).setLngLat(location.coordinates).addTo(map);

    new mapboxgl.Popup({ offset: 25, closeOnClick: false, focusAfterOpen: false })
      .setLngLat(location.coordinates)
      .setHTML(`<p>${location.description}</p>`)
      .addTo(map);

    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 250, bottom: 200, left: 100, right: 100 }
  });
};

export { displayMap };
