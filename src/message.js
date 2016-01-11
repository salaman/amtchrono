import { flow } from 'lodash/function';
import crypto from 'crypto';

const key = process.env.AMT_KEY;

if (typeof key === 'undefined') {
	throw new Error('missing AMT_KEY signing key');
}

/**
 * Adds fields to the message before signing it
 * @param message
 * @returns {*}
 */
function modify(message) {
	message.timestamp = Date.now();

	return message;
}

/**
 * Signs a message
 * @param message
 * @returns {*}
 */
function sign(message) {
	message.signature = hash(message.timestamp.toString());

	return message;
}

/**
 * Hash function used for computing signature
 * @param data
 * @returns {*}
 */
function hash(data) {
	return crypto.createHmac('sha1', key).update(data).digest('hex');
}

export default flow(modify, sign, JSON.stringify);
