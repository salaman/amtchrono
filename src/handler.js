import events from './events';

function Handler() {

	this.handlers = {};

	// init each event handlers to an empty array
	events.forEach(event => {
		this.handlers[event] = [];
	});

}

Handler.prototype.register = function (event, callback) {
	this.handlers[event].push(callback);
};

Handler.prototype.handle = function (event, line, data) {
	this.handlers[event].forEach(callback => {
		callback.call({}, line, data);
	});
};

export default Handler;
