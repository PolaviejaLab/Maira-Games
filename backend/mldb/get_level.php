<?php
	if(array_key_exists("name", $_GET)) {
		$name = $_GET['name'];
	} else {
		$name = "demo";
	}

	$dir = opendir("levels");
	$data = false;

	while($item = readdir($dir)) {
		if($item == $name . ".lvl") {
			$filename = "levels/" . $item;
			$data = file_get_contents("levels/" . $item);
		}
	}

	header("Access-Control-Allow-Origin: *");

	if(!$data) {
		http_response_code(404);
		echo("Level not found");
		return;
	}

	echo($data);

