<?php
	session_start();
?>
<!DOCTYPE html>
<html lang="es">
<head>
 	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>EMusic</title>
	<link rel="stylesheet" type="text/css" href="css/emusic.css">
	<link rel="stylesheet" type="text/css" href="vendor/jquery.mobile/jquery.mobile-1.4.5.min.css">
	<link rel="icon" href="img/favicon.ico">
	<script src="js/jquery-2.2.4.min.js"></script>
	<script src="vendor/jquery.mobile/jquery.mobile-1.4.5.min.js"></script>
</head>
<body>
	<div data-role="page" id="musicPlayer">
		<div data-role="header" data-position="fixed" data-tap-toggle="false">
			<h1>Welcome To EMusic</h1>
		</div>


		<div data-role="main" class="ui-content">
			<p>I Am Now A Mobile Developer!!</p>
		</div>
		<div data-role="footer" data-position="fixed" data-tap-toggle="false" id="musicControls">

		</div>
	</div>
</body>