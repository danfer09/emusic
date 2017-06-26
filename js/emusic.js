function exitFromApp()
{
	navigator.app.exitApp();
}


var colorFondo = "azul";

window.setInterval(function() {
	var color = document.getElementById('lista');
	var indiceSeleccionado = color.selectedIndex;
	colorFondo = color.options[indiceSeleccionado].value;
}, 500);



var nombre;
var listaCanciones = [];
/*dondeEstamos=> 0->Todas, 1->Feliz, 2->Triste, 3->Serio*/
var dondeEstamos=0;

$(document).on( "pagecreate", "#player-page", function( e ) {
	var urlImg = "img/"+colorFondo+".jpg";
	$('#icono_musica').attr("src", urlImg);

    var titulo = (($(this).data("url").indexOf("?") > 0) ? $(this).data("url") : '-' ).replace(new RegExp("\\+","g"),' ');
    nombre = titulo.split('=')[1];
    $("#media-name").text(nombre);//¿¿¿¿HACER EN EL SETINTERVAL PARA CUANDO SE PASE DE CANCIÓN SE ACTUALICE EL NOMBRE?????

    hacerSelectCancion(nombre, iniciarAudio);

    listaDeCanciones();//Carga la lista de canciones en una variable global para ser usada cuando se quiera pasar de canción

});

function secondsToMs(d) {
    d = Number(d);

    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    return ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
}


window.setInterval(function(){
	if(my_media){
		$("#media-name").text(nombre);

		var tiempo = secondsToMs(my_media.getDuration());
		$('#media-duration').html("<span>"+tiempo+"</span>");//Durancion en minutos redondeada a dos decimales

		var pos;
		var posTotal = 0;
		my_media.getCurrentPosition(function(position){
			if (position > -1) {
				pos=secondsToMs(position);
				$('#media-played').html("<span>"+pos+"</span>");
			}
			posTotal = position;
			if (posTotal < 0) {
				pasarCancion(0);
			}
		}, null);
	}
}, 1000);

var my_media;
var status;

function play() {
	playMusic(nombre);
}
function playMusic(nombre) {
	if (status == 2) {//está reproduciendo
		hacerSelectCancion(nombre, pausaAudio);
	} else if (status == 3 || status == 4) {//está en pausa o stop
		hacerSelectCancion(nombre, playAudio);
	}
}
var iniciarAudio = function(url) {
	if(my_media && status != 4){
		my_media.stop()
	}
    // Play the audio file at url
    my_media = new Media(url,
        // success callback
        function () { /*alert("playAudio():Audio Success");*/ },
        // error callback
        function (err) { alert("playAudio():Audio Error: " + err); },
        function(mediaStatus) {
        	status = mediaStatus;
        }
    );

    estamosPrimeraCarga = false;
    $('#player-play').removeClass("player-play");
	$('#player-play').addClass("player-pause");

    my_media.play();
}
var playAudio = function(url) {
	$('#player-play').removeClass("player-play");
	$('#player-play').addClass("player-pause");
    my_media.play();
}
var pausaAudio = function(url) {
	$('#player-play').removeClass("player-pause");
	$('#player-play').addClass("player-play");
	my_media.pause();
}

// /emusic/cordova/emusic/www/Los Piratas - Años 80.mp3

function refreshPage()
{
    jQuery.mobile.changePage(window.location.href, {
        allowSamePageTransition: true,
        transition: 'fade',
        reloadPage: true
    });
}

function refrescarCanciones() {
	estamosPrimeraCarga = true;
	borrarTablaMusica = true;
	refreshPage();
}

var getRootDir = function(entry) {
	entry.getParent(function(padre){
		padre.getParent(function(padre){
			padre.getParent(function(padre){
				buscarcanciones(padre);
			});
		});
	});
};

var getRootDirSD = function(entry) {
	buscarcanciones(entry);
}

function hacerSelectCancion(nombre, callback) {
	db.transaction(function (tx) {
	  	tx.executeSql('SELECT path FROM TODAS_MUSICA WHERE nombre=?', [nombre], function(tx, rs){
		callback(rs.rows.item(0)['path']);
	  }, null);
	});
}



function buscarcanciones(entry) {
	buscardirectorio(entry, 0);
}

var ok = 0;
function buscardirectorio (entry, nivel){
	var reader = entry.createReader();
	reader.readEntries(function(entradas) {
		var i = 0;
		for (i=0; i < entradas.length; i++) {
			if(entradas[i].isDirectory){
				buscardirectorio(entradas[i], nivel+1);
			}
			else if(entradas[i].isFile){
				extension = entradas[i].name.substr(entradas[i].name.lastIndexOf('.'));
				if(extension === '.mp3'){
					guardarEnBD(entradas[i].name, entradas[i].fullPath);
				}
			}
		}
	}, function(){alert("Error al leer entradas");});
}

var db;
var borrarTablaMusica = true;
function guardarEnBD(nombreCancion, direccionCancion){
	db.transaction(insertarCancion, errorCB, successCB);

	function insertarCancion(tx) {
		if (borrarTablaMusica) {
			tx.executeSql('DROP TABLE IF EXISTS TODAS_MUSICA');
			borrarTablaMusica = false;
		}
	    tx.executeSql('CREATE TABLE IF NOT EXISTS TODAS_MUSICA (nombre varchar(30), path varchar(255) NOT NULL, PRIMARY KEY (path))');
		tx.executeSql('INSERT INTO TODAS_MUSICA (nombre, path) VALUES (?, ?)', [nombreCancion, direccionCancion]);

	}

	function errorCB(err) {
	    alert("Error processing A SQL: "+err.code);
	}

	function successCB() {
		listaDeCanciones();
		//alert("Longitud: "+long+" cancion bbdd: "+nombreCancion+" cancion array: "+listaCanciones[long-1]);
	}
}


function setIntervalX(callback, delay, repetitions) {
    var x = 0;
    var intervalID = window.setInterval(function () {

       callback();

       if (++x === repetitions) {
           window.clearInterval(intervalID);
       }
    }, delay);
}

var estamosPrimeraCarga;

function comprobarDB() {
	db = window.openDatabase("emusic", "1.0", "Cordova Demo", 200000);
	var long = -1;
	db.transaction(function(tx){
		tx.executeSql('CREATE TABLE IF NOT EXISTS YA_CARGADO (cargado VARCHAR(2))');
		tx.executeSql('SELECT * FROM YA_CARGADO', [], function(t, rs){
			long = rs.rows.length;
			if (rs.rows.length == 0) {
				var si = "si";
				tx.executeSql('INSERT INTO YA_CARGADO (cargado) VALUES (?)', [si]);
				alert("BIENVENIDO A EMUSIC");
				estamosPrimeraCarga = true;
			} else if (rs.rows.length > 0) {
				estamosPrimeraCarga = false;
			}
		}, null);

	}, errorC, successC);

	function errorC(err) {
	    alert("Error processing C SQL: "+err.code);
	}

	function successC() {
		//alert("Longitud: "+long+" cancion bbdd: "+nombreCancion+" cancion array: "+listaCanciones[long-1]);
	}
}

$(document).on( "pagecontainerchange",function(){
	var pageID = $(':mobile-pagecontainer').pagecontainer('getActivePage')[0].id;
	if(pageID == "files-list-page"){
		//permisos
		var permissions = cordova.plugins.permissions;
		permissions.requestPermission(permissions.READ_EXTERNAL_STORAGE, successR, errorR);
		function errorR() {
		  //alert("No tenemos permisos lectura");
		}
		function successR( status ) {
		  if( !status.hasPermission ) error();
		}

		permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE, successW, errorW);
		function errorW() {
		  //alert("No tenemos permisos escritura");
		}
		function successW( status ) {
		  if( !status.hasPermission ) error();
		}

		comprobarDB();

		dondeEstamos=0;
		setTimeout(function() {
			if (estamosPrimeraCarga) {
				estamosPrimeraCarga = false;
				borrarTablaMusica = true;


				window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, getRootDir);
			} else {
				listaDeCanciones();
			}
			var i = 0;
			setIntervalX(function() {
				while(i < listaCanciones.length) {
					$("#files-list").append('<li><a href="reproductor.html?nombre='+listaCanciones[i].nombre+'" data-transition="flip" data-role="button">'+listaCanciones[i].nombre+'</a></li>').listview('refresh');
					i++;
				}
			},1000, 3);
		},700);

	}
	else if(pageID == "page_feliz"){
		dondeEstamos=1;
		cargarListaFeliz();
	}
	else if(pageID == "page_serio"){
		dondeEstamos=3;
		cargarListaSerio();
	}
	else if(pageID == "page_triste"){
		dondeEstamos=2;
		cargarListaTriste();
	}
});




var listaDeCanciones = function() {//Casi igual a hacerSelect(), para usar hacerSelect tenia que sacar el array fuera y no quería tocarlo, en caso de que se pueda sacar, sacarlo y usar hacerSelect en vez de esta función
	db.transaction(function(tx){
		tx.executeSql('SELECT * FROM TODAS_MUSICA ORDER BY nombre', [], function(tx, rs){
		    for(var i=0; i<rs.rows.length; i++) {
		    	var row = rs.rows.item(i);
		        listaCanciones[i] = {nombre: row['nombre'], fullPath: row['path']};
			}

		}, null);

	});

}
function pasarCancion(siguienteAnterior){//0-> siguiente, 1-> anterior Se llama desde los onclick de los botones prev y next del reporductor
	if(siguienteAnterior==0){
		siguienteCancion();
	}
	else if(siguienteAnterior==1){
		anteriorCancion();
	}
}
function siguienteCancion(){
	var encontrada = false;
	var i=0;
	var listaAUsar = [];
	if (dondeEstamos == 0) {
		listaAUsar = listaCanciones;
	} else if (dondeEstamos == 1) {
		listaAUsar = listaFeliz;
	} else if (dondeEstamos == 2) {
		listaAUsar = listaTriste;
	} else if (dondeEstamos == 3) {
		listaAUsar = listaSerio;
	} else {
		alert("Lista no disponible");
	}
	while (!encontrada && i<listaAUsar.length) {
		if(listaAUsar[i].nombre==nombre){
			encontrada = true;
			nombre = listaAUsar[(i+1)%listaAUsar.length].nombre;
			iniciarAudio(listaAUsar[(i+1)%listaAUsar.length].fullPath);//Reproduce la siguiente canción de la lista, la lista esta ordenada alfabeticamente
		}
		i++;
	}
}
function anteriorCancion(){
	var encontrada = false;
	var i=0;
	while (!encontrada && i<listaCanciones.length) {
		if(listaCanciones[i].nombre==nombre){
			encontrada = true;
			if (i==0) {
				nombre = listaCanciones[listaCanciones.length-1].nombre;
				iniciarAudio(listaCanciones[listaCanciones.length-1].fullPath);//Reproduce la siguiente canción de la lista, la lista esta ordenada alfabeticamente
			} else {
				nombre = listaCanciones[(i-1)%listaCanciones.length].nombre;
				iniciarAudio(listaCanciones[(i-1)%listaCanciones.length].fullPath);//Reproduce la siguiente canción de la lista, la lista esta ordenada alfabeticamente
			}
		}
		i++;
	}
}
/*---------------------------Insertar canción a lista de reproducción de emociones---------------------------------*/

function DistinguirEmocion(emocion){//0->Feliz, 1->Triste, 2->Serio
	if (emocion==0) {
		anadirCancionEmocion(nombre,anadirFeliz);
	} else if (emocion==1) {
		anadirCancionEmocion(nombre,anadirTriste);
	} else if (emocion==2) {
		anadirCancionEmocion(nombre,anadirSerio);
	}
}

function anadirCancionEmocion(nombre,callback){//Funcion que busca el path de la canción y llama a la función de añadir canción de la emoción que nos indiquen
	db.transaction(function (tx) {
		tx.executeSql('SELECT path FROM TODAS_MUSICA WHERE nombre=?', [nombre], function(tx, rs){
			callback(nombre, rs.rows.item(0)['path']);
		}, null);
	});
}

var anadirFeliz=function (nombre,path){
	db.transaction(insertarCancion, errorCB, successCB);

	function insertarCancion(tx) {
	    tx.executeSql('CREATE TABLE IF NOT EXISTS FELIZ (nombre varchar(30), path varchar(255) NOT NULL, PRIMARY KEY (path))');
		tx.executeSql('INSERT INTO FELIZ (nombre, path) VALUES (?, ?)', [nombre, path]);
	}
	function errorCB(err) {
	    alert("¡Esta canción ya ha sido añadida a la lista FELIZ!");
	}
	function successCB() {
	    //alert("success!");
	}
}

var anadirTriste=function (nombre,path){
	db.transaction(insertarCancion, errorCB, successCB);

	function insertarCancion(tx) {
	    tx.executeSql('CREATE TABLE IF NOT EXISTS TRISTE (nombre varchar(30), path varchar(255) NOT NULL, PRIMARY KEY (path))');
		tx.executeSql('INSERT INTO TRISTE (nombre, path) VALUES (?, ?)', [nombre, path]);
	}
	function errorCB(err) {
	    alert("¡Esta canción ya ha sido añadida a la lista TRISTE!");
	}
	function successCB() {
	    //alert("success!");
	}
}

var anadirSerio=function (nombre,path){
	db.transaction(insertarCancion, errorCB, successCB);

	function insertarCancion(tx) {
	    tx.executeSql('CREATE TABLE IF NOT EXISTS SERIO (nombre varchar(30), path varchar(255) NOT NULL, PRIMARY KEY (path))');
		tx.executeSql('INSERT INTO SERIO (nombre, path) VALUES (?, ?)', [nombre, path]);
	}
	function errorCB(err) {
	    alert("¡Esta canción ya ha sido añadida a la lista SERIO!");
	}
	function successCB() {
	    //alert("success!");
	}
}

/*--------------------------Mostrar canciones del sentimiento---------------------------------------------*/
var listaFeliz = [];
var listaTriste = [];
var listaSerio = [];

function cargarListaFeliz(){
	db.transaction(cargarListaF, errorCB, successCB);
	function cargarListaF(tx) {

		tx.executeSql('SELECT * FROM FELIZ', [], function(tx, rs){

		    for(var i=0; i<rs.rows.length; i++) {
		    	var row = rs.rows.item(i);
		    	nombreCancion = row['nombre'];
		    	listaFeliz[i] = {nombre: nombreCancion, fullPath: row['path']};
				$(function() {
					//<li><a href="#" data-transition="flip" data-role="button">Los Piratas - Años 80</a></li>
					$("#files-list").append('<li><a href="reproductor.html?nombre='+nombreCancion+'" data-transition="flip" data-role="button">'+nombreCancion+'</a></li>').listview('refresh');
					//Aunque le pasemos en href 'reproductor', pues cuando vaya a reproducir no mirar de donde viene sino el parametro que se le pase
				});
			}
		}, null);
	}
	function errorCB(err) {
	    //alert("Error processing SQL: "+err.code);
	}
	function successCB() {
	    //alert("success!");
	}
}

function cargarListaTriste(){
	db.transaction(cargarListaT, errorCB, successCB);
	function cargarListaT(tx) {

		tx.executeSql('SELECT * FROM TRISTE', [], function(tx, rs){

		    for(var i=0; i<rs.rows.length; i++) {
		    	var row = rs.rows.item(i);
		    	listaTriste[i] = {nombre: row['nombre'], fullPath: row['path']};
				$(function() {
					//<li><a href="#" data-transition="flip" data-role="button">Los Piratas - Años 80</a></li>
					$("#files-list").append('<li><a href="reproductor.html?nombre='+rs.rows.item(i)['nombre']+'" data-transition="flip" data-role="button">'+rs.rows.item(i)['nombre']+'</a></li>').listview('refresh');
					//Aunque le pasemos en href 'reproductor', pues cuando vaya a reproducir no mirar de donde viene sino el parametro que se le pase
				});
			}
		  }, null);
	}
	function errorCB(err) {
	    //alert("Error processing SQL: "+err.code);
	}
	function successCB() {
	    //alert("success!");
	}

}

function cargarListaSerio(){
	db.transaction(cargarListaS, errorCB, successCB);
	function cargarListaS(tx) {

		tx.executeSql('SELECT * FROM SERIO', [], function(tx, rs){

		    for(var i=0; i<rs.rows.length; i++) {
		    	var row = rs.rows.item(i);
		    	listaSerio[i] = {nombre: row['nombre'], fullPath: row['path']};
				$(function() {
					//<li><a href="#" data-transition="flip" data-role="button">Los Piratas - Años 80</a></li>
					$("#files-list").append('<li><a href="reproductor.html?nombre='+rs.rows.item(i)['nombre']+'" data-transition="flip" data-role="button">'+rs.rows.item(i)['nombre']+'</a></li>').listview('refresh');
					//Aunque le pasemos en href 'reproductor', pues cuando vaya a reproducir no mirar de donde viene sino el parametro que se le pase
				});
			}
		  }, null);
	}
	function errorCB(err) {
	    //alert("Error processing SQL: "+err.code);
	}
	function successCB() {
	    //alert("success!");
	}

}
