import message from './message';
import io from 'socket.io-client';

const address = process.env.AMT_SOCKET_URL;

function Connection(line, handler) {
	this.line = line;
	this.handler = handler;
	this.socket = null;
	this.ready = false;
}

Connection.prototype.start = function () {
	var socket = this.socket = io.connect(address, {
		'force new connection': true
	});

	// connect event
	socket.on('connect', () => {
		// subscribe to the requested line (this ensures updates are received)
		socket.send(message({
			route_id: this.line,
			stop_ids: [],
			action: 'subscribe'
		}));

		this.handler.handle('connected', this.line);
	});

	// disconnect event
	socket.on('disconnect', () => {
		this.handler.handle('disconnected', this.line);
	});

	// message event
	socket.on('message', json => {
		// parse the message from JSON
		var data = JSON.parse(json);

		// handle the incoming message
		if (typeof data.action !== 'undefined') {
			this._handleAction(data);
		}

		// only allow the next handlers to be executed if the connection is ready
		if (!this.ready) return;

		if (typeof data.type !== 'undefined') {
			this._handleEvent(data);
		}
	});
};

Connection.prototype.close = function () {
	this.ready = false;

	// send the unsubscribe message to be kind
	this.socket.send(message({
		action: 'unsubscribe'
	}));

	this.socket.disconnect();
};

Connection.prototype._handleAction = function (data) {
	// socket sends a subscribe callback message
	if (data.action === 'subscribe') {
		// ensure it's ok, otherwise the connection is unusable
		if (data.status === 'ok') {
			this.ready = true;
		} else {
			throw new Error('subcribe action returned unexpected answer:', JSON.stringify(data));
		}
	}
};

Connection.prototype._handleEvent = function (data) {
	var event = null;

	switch (data.type) {
		case 'VehiclePosition':
			event = 'vehiclePosition';
			break;
		case 'TripUpdate':
			event = 'tripUpdate';
			break;
		case 'Alert':
			event = 'alert';
			break;
		default:
			console.log('unhandled event of type', data.type);
			return;
	}

	this.handler.handle(event, this.line, data);
};

export default Connection;
