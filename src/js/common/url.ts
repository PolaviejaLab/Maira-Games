/** @module Common **/
"use strict";

/**
 * Returns the address of the current web page
 * @returns {String} Address of the web page
 */
function getAddress(url)
{
	if(typeof url === 'undefined')
		url = window.location.href;

	var parts = url.split(/[\?]+/);

	return parts[0];
}


/**
 * Returns the value of a field from the query string
 *
 * @param {String} field - Name of the field
 * @param {String} default - Optional default value
 * @param {String} url - Optional string containing the URL to parse
 * @returns {String} Value of the field or false if the key was not found.
 */
function getQueryField(field, url?: string) {
	return getQueryFieldWithDefault(field, undefined, url);
}


/**
 * Returns the value of a field from the query string
 *
 * @param {String} field - Name of the field
 * @param {String} default - Optional default value
 * @param {String} url - Optional string containing the URL to parse
 * @returns {String} Value of the field or false if the key was not found.
 */
function getQueryFieldWithDefault(field, deflt, url) {
	if(typeof url === 'undefined')
		url = window.location.href;

	var fieldValues = getQueryFields(url);

	if(field in fieldValues)
		return fieldValues[field];

	return deflt;
}


/**
 * Returns the values for all fields in the query string
 * @param {String} url - URL that contains the query string
 */
function getQueryFields(url)
{
	var fieldValues = url.split(/[\?&]+/);
	var values = {};

	for(var i = 1; i < fieldValues.length; i++)
	{
		var fieldValue = fieldValues[i].split("=");
		values[fieldValue[0]] = fieldValue[1];
	}

	return values;
}


/**
 * Changes the query string
 *
 * @param {Object} Associative array with field to update
 * @returns {String} Updates query string
 */
function updateQueryString(updates, url)
{
	if(typeof url === 'undefined')
		url = window.location.href;

	// Extract all field-value pairs
  var fieldValues = getQueryFields(url);
	var field;

	// Copy updates into fieldValues object
	for(field in updates) {
		fieldValues[field] = updates[field];
	}

	var queryString = getAddress(url);
	var first = true;

	for(field in fieldValues) {
		queryString += (first?"?":"&") + field + "=" + fieldValues[field];
		first = false;
	}

	return queryString;
}
