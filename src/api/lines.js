import request from 'request';
import _ from 'lodash';
import async from 'async';

export default {

	_lines: null,
	_fileCache: {},

	all(callback) {
		// if we've already fetched these
		if (this._lines !== null) {
			callback(this._lines);
			return;
		}

		// start by downloading the root file
		this._getFile('root', root => {
			this._processRoot(root, callback);
		});
	},

	line(callback) {
		// TODO
	},

	_getFile(file, callback) {
		if (typeof this._fileCache[file] !== 'undefined') {
			callback(this._fileCache[file]);
		} else {
			this._download(file, callback);
		}
	},

	_download(file, callback) {
		var url = process.env.AMT_JSON_URL + file + '.json';

		request(url, (error, response, body) => {
			if (!error && response.statusCode === 200) {
				var data = this._fileCache[file] = JSON.parse(body);

				callback(data);
			}
		});
	},

	_processLineData(data, line, callback) {
		line.stops = _.map(data.stops, s => {
			return {
				sequence: parseInt(s.sequence, 10),
				name: s.name,
				coords: {lat: parseFloat(s.lat), lng: parseFloat(s.lon)}
			};
		});

		line.path = _.map(data.shape, p => {
			return {lat: parseFloat(p.lat), lng: parseFloat(p.lon)};
		});

		callback();
	},

	_processRoot(root, callback) {
		var lines = _.map(root.lignes, data => {
			return {
				id: parseInt(data.route_id, 10),
				name: data.name,
				color: data.color,
				twitter: data.twitter,
				json: data.json
			};
		});

		async.each(lines, (line, asyncCallback) => {
			this._getFile(line.json.replace('.json', ''), data => {
				this._processLineData(data, line, asyncCallback);
			});
		}, err => {
			if (err) throw err;

			callback(lines);
		});
	}

};
