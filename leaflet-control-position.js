if (typeof console == "undefined") {
	this.console = { log: function (msg) { /* do nothing since it would otherwise break IE */} };
}


L.Control.Position = L.Control.extend({
	options: {
		collapsed: true,
		position: 'topleft',
		text: 'Zoom to (lon, lat) position',
		bounds: null, // L.LatLngBounds
	},

	initialize: function (options) {
		L.Util.setOptions(this, options);
	},

	onAdd: function (map) {
		this._map = map;

		var className = 'leaflet-control-position',
		container = this._container = L.DomUtil.create('div', className);

		L.DomEvent.disableClickPropagation(container);

		var form = this._form = L.DomUtil.create('form', className + '-form');

		var input_lon = this._input_lon = document.createElement('input');
                input_lon.className = className + '-form-input-lon';
		input_lon.name = "lon";
		input_lon.type = "text";
                input_lon.placeholder = "Longitude";
		var input_lat = this._input_lat = document.createElement('input');
                input_lat.className = className + '-form-input-lat';
		input_lat.type = "text";
		input_lat.name = "lat";
                input_lat.placeholder = "Latitude";

		var submit = document.createElement('input');
		submit.type = "submit";
		submit.value = this.options.text;

		form.appendChild(input_lon);
		form.appendChild(input_lat);
		form.appendChild(submit);

		L.DomEvent.addListener(form, 'submit', this._position, this);

		if (this.options.collapsed) {
			L.DomEvent.addListener(container, 'mouseover', this._expand, this);
			L.DomEvent.addListener(container, 'mouseout', this._collapse, this);

			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Input longitude and latitude';

			L.DomEvent.addListener(link, L.Browser.touch ? 'click' : 'focus', this._expand, this);

			this._map.on('movestart', this._collapse, this);
		} else {
			this._expand();
		}

		container.appendChild(form);

		return container;
	},
    
    _position : function (event) {
        L.DomEvent.preventDefault(event);
        try {
            var lon = magellan(this._input_lon.value).longitude();
            if (lon === null) {
                throw new Error('Invalid longitude.');
            }
            lon = parseFloat(lon.toDD());
        } catch(err) {
            console.log(err);
            var n = noty({text: err.message, type: "error"});
            throw err;
        }
        try {
            var lat = magellan(this._input_lat.value).latitude();
            if (lat === null) {
                throw new Error('Invalid latitude.');
            }
            lat = parseFloat(lat.toDD());
        } catch(err) {
            console.log(err);
            var n = noty({text: err.message, type: "error"});
            throw err;
        }
        this._map.panTo([lat, lon]);
        _remove_marker = function(arg) {
            this._map.removeLayer(arg.target);
        }
        this._marker = L.marker()
        this._marker.on('click', _remove_marker);
        this._marker.setLatLng([lat, lon]).addTo(this._map);
    },

     _expand: function () {
          L.DomUtil.addClass(this._container, 'leaflet-control-position-expanded');
     },

     _collapse: function () {
         this._container.className = this._container.className.replace(' leaflet-control-position-expanded', '');
     }
});