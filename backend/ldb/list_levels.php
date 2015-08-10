<?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: text/plain");

	$dir = opendir("levels");
	$data = false;
	
	$items = array();	
	
	while($item = readdir($dir)) {
		if(substr($item, -4) != '.lvl')
			continue;
		
		$item = substr($item,0, strlen($item) - 4);
		$items[] = "\n\t{ \"name\": \"$item\" }";
	}

	sort($items);

	echo("[");
	echo(join(", ", $items));
	echo("\n]\n");
