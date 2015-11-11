
QUnit.test("sign", function(assert) {
	assert.ok(sign(10) == 1);
	assert.ok(sign(1) == 1);
	assert.ok(sign(-1) == -1);
	assert.ok(sign(-10) == -1);
});


QUnit.test("collision", function(assert) {
	a = {x: 0, y: 0, width: 1, height: 1};

	// No collision expected / not touching
	b = {x: 1.1, y: 0, width: 1, height: 1};
	assert.ok(!collisionCheck(a, b));

	b = {x: -1.1, y: 0, width: 1, height: 1};
	assert.ok(!collisionCheck(a, b));

	// No collision expected / touching
	b = {x: 1, y: 0, width: 1, height: 1};
	assert.ok(!collisionCheck(a, b));

	b = {x: -1, y: 0, width: 1, height: 1};
	assert.ok(!collisionCheck(a, b));

	// Collision, right side
	b = {x: 0.8, y: 0, width: 1, height: 1};
	ci = collisionCheck(a, b);
	assert.ok(ci);

	// Collision, left side
	b = {x: -0.8, y: 0, width: 1, height: 1};
	ci = collisionCheck(a, b);
	assert.ok(ci);

	// Collision, encapsulated
	b = {x: 0.1, y: 0, width: 0.8, height: 1};
	ci = collisionCheck(a, b);
	assert.ok(ci);

	b = {x: -0.1, y: 0, width: 1.2, height: 1};
	ci = collisionCheck(a, b);
	assert.ok(ci);
});
