// dotenv
import dotenv from 'dotenv';

dotenv.load();

// death
import death from 'death';

death({debug: true})(function (signal, err) {
	client.close();
	process.exit();
});

// app
import Client from './src/client';

var client = new Client();

client.connected(line => {
	console.log('[Connected] (' + line + ')');
});

client.disconnected(line => {
	console.log('[Disconnected] (' + line + ')');
});

client.vehiclePosition((line, data) => {
	console.log('[VehiclePosition] (' + line + ')"', JSON.stringify(data));
});

client.start([1, 2, 3, 4, 5, 6]);
