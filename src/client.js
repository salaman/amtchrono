import events from './events';
import Handler from './handler';
import Connection from './connection';

function Client() {

	this.handler = new Handler();
	this.connections = [];

	// create a handler registration method on the client
	events.forEach(event => {
		this[event] = callback => {
			this.handler.register(event, callback);
		};
	});

	// default handler to clean up data
	this.vehiclePosition((line, data) => {
		data.train_id = parseInt(data.train_id, 10);
	});

}

Client.prototype.start = function (lines) {
	lines.forEach(line => {
		// start a new connection for the line
		var connection = new Connection(line, this.handler);
		connection.start();

		// keep track of the connection
		this.connections.push(connection);
	});
};

Client.prototype.close = function () {
	// close all connections
	this.connections.forEach(connection => {
		connection.close();
	});

	this.connections = [];
};

export default Client;
