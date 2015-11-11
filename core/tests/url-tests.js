"use strict";

QUnit.module("url");

QUnit.test("getQueryFields", function(assert) {
  var url = "http://www.example.com/?field1=value1&field2=value2";
  var fieldValues = getQueryFields(url);
  var fieldNames = Object.keys(fieldValues);

  assert.equal(fieldNames.length, 2, "We expect two fields");
  assert.equal(fieldValues['field1'], 'value1', "We expect field1 to have value value1");
  assert.equal(fieldValues['field2'], 'value2', "We expect field2 to have value value2");

  var url = "http://www.example.com?field1=value1";
  var fieldValues = getQueryFields(url);
  var fieldNames = Object.keys(fieldValues);

  assert.equal(fieldNames.length, 1, "We expect one field");
  assert.equal(fieldValues['field1'], 'value1', "We expect field1 to have value value1");
});


QUnit.test("getQueryField", function(assert) {
  var url = "http://www.example.com/?field1=value1&field2=value2";
  assert.equal(getQueryField("field1", url), 'value1', "We expect field1 to have value value1");
  assert.equal(getQueryField("field2", url), 'value2', "We expect field2 to have value value2");

  assert.equal(getQueryField("invalid", url), false, "Field that does not exist");
});


QUnit.test("getAddress", function(assert) {
  var url = "http://www.example.com/?field1=value1&field2=value2";
  assert.equal(getAddress(url), "http://www.example.com/", "Get address with query string");

  var url = "http://www.example.com/";
  assert.equal(getAddress(url), "http://www.example.com/", "Get address without query string");
});


QUnit.test("updateQueryString", function(assert) {
  var url = "http://www.example.com/?field1=value1&field2=value2";

  var str = updateQueryString({"field1": "new_value"}, url);
  assert.equal(str, "http://www.example.com/?field1=new_value&field2=value2", "Update of query string");

  var url = "http://www.example.com";
  var str = updateQueryString({"field1": "new_value"}, url);
  assert.equal(str, "http://www.example.com?field1=new_value", "Update previously non-existent field");
});
