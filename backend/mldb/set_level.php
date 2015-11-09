<?php
	header("Access-Control-Allow-Origin: *");

	if(array_key_exists("name", $_GET)) {
		$name = $_GET['name'];
	} else {
		$name = "demo";
	}

	$data = file_get_contents("php://input");

	if(!$data) {
		http_response_code(404);
		echo("No data sent");
		return;
	}
	
	$dir = opendir("levels");
	$written = false;
	
	while($item = readdir($dir)) {
		if($item == $name . ".lvl") {
			$filename = "levels/" . $item;
			file_put_contents("levels/" . $item, $data);
			$written = true;
		}
	}

	if(!$written) {
		http_response_code(404);
		echo("Level not found");
		return;
	}
	