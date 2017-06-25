function exitFromApp()
{
	navigator.app.exitApp();
}

//Pasar al reproductor.html el nombre de la canción seleccionada
/*$(document).on( "getActivePage", "#files-list-page",  function( e ) {
    $('#files-list li a').on('click', function(e) {
    	alert("click");
        $(":mobile-pagecontainer").pagecontainer("change", "reproductor.html", {
            data: {
                titulo: this.text,
            },
            transition: "flip"
        });
    });
});*/

/*
module.controller('MyCtrl', function($scope, $cordovaMedia) {

  var src = "/src/audio.mp3";
  var media = $cordovaMedia.newMedia(src);


  var iOSPlayOptions = {
    numberOfLoops: 2,
    playAudioWhenScreenIsLocked : false
  }

  media.play(iOSPlayOptions); // iOS only!
  media.play(); // Android

  media.pause();

  media.stop();

  media.release();

  media.seekTo(5000); // milliseconds value

  media.setVolume(0.5);

  media.startRecord();

  media.stopRecord();

  media.getDuration();

  media.getCurrentPosition().then(...);
});
*/

//PONER UN POPUP DE CARGANDO MIENTRAS SE CARGAN LAS CANCIONES (para un futuro):
/*
$('#waiting-popup').popup('open');
$('#waiting-popup').popup('close');*/

var nombre;
var listaCanciones = [];

$(document).on( "pagecreate", "#player-page", function( e ) {
    var titulo = (($(this).data("url").indexOf("?") > 0) ? $(this).data("url") : '-' ).replace(new RegExp("\\+","g"),' ');
    nombre = titulo.split('=')[1];
    $("#media-name").text(nombre);//¿¿¿¿HACER EN EL SETINTERVAL PARA CUANDO SE PASE DE CANCIÓN SE ACTUALICE EL NOMBRE?????

    hacerSelectCancion(nombre, iniciarAudio);

    listaDeCanciones();//Carga la lista de canciones en una variable global para ser usada cuando se quiera pasar de canción

    // Pause after 10 seconds
    /*setTimeout(function () {
        my_media.pause();
    }, 10000);*/

});

window.setInterval(function(){
	if(my_media){
		$("#media-name").text(nombre);
		$('#media-duration').html("<span>"+Math.round(((my_media.getDuration())/60)*100)/100+"</span>");//Durancion en minutos redondeada a dos decimales
		var pos;
		my_media.getCurrentPosition(function(position){
			pos=position;
		})
		$('#media-played').html("<span>"+pos+"</span>");
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
	if(my_media){
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
    // Play audio
    my_media.play();
}
var playAudio = function(url) {
    // Play audio
    my_media.play();
}
var pausaAudio = function(url) {
	my_media.pause();
}

/*function playMusic() {
	module.controller('MyCtrl', function($scope, $cordovaMedia) {
		var src = "android_asset/www/Los Piratas - Años 80.mp3";
			var media = $cordovaMedia.newMedia(src);
			media.play();
	});
    var my_media = new Media('Los Piratas - Años 80.mp3',
        // success callback
        function () {
        	$('#media-played').html("iniciado!")
        	console.log("playAudio():Audio Success");
        },
        // error callback
        function (err) {
        	console.log("playAudio():Audio Error: " + err);
        }
    );

    $('#player-play').on('click', function(e) {
    	// Play audio
    	my_media.play();
    });
}*/

// /emusic/cordova/emusic/www/Los Piratas - Años 80.mp3

function refrescarCanciones() {
	$(":mobile-pagecontainer").pagecontainer("change", "todas_canciones.html", {transition: "pop"});
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

function hacerSelectCancion(nombre, callback) {
	db.transaction(function (tx) {
	  	tx.executeSql('SELECT path FROM TODAS_MUSICA WHERE nombre=?', [nombre], function(tx, rs){
		callback(rs.rows.item(0)['path']);
	  }, null);
	});
}

/*DEBUGEO BORRAAAAAAAAAAAAAAAAAAAAAAAAAAAAR*/
function hacerSelect() {
	var result = [];
	db.transaction(function (tx) {
	  	tx.executeSql('SELECT * FROM FELIZ', [], function(tx, rs){

	    for(var i=0; i<rs.rows.length; i++) {
	    	var row = rs.rows.item(i);
	        result[i] = {nombre: row['nombre'], fullPath: row['path']};

			alert(result[i].nombre + " " + result[i].fullPath);
		}
	  }, null);
	});
}

var todoRecorrido = 0;
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
				nivelAux = nivel+1;
				buscardirectorio(entradas[i], nivelAux);
			}
			else if(entradas[i].isFile){
				extension = entradas[i].name.substr(entradas[i].name.lastIndexOf('.'));
				if(extension === '.mp3'){
					guardarEnBD(entradas[i].name, entradas[i].fullPath);//Función no implementada aún
				}
			}
		}
	}, function(){alert("Error al leer entradas");});
}

var db;
var borrarTablaMusica = true;
function guardarEnBD(nombreCancion, direccionCancion){
	db = window.openDatabase("emusic", "1.0", "Cordova Demo", 200000);
	db.transaction(insertarCancion, errorCB, successCB);

	function insertarCancion(tx) {
		if (borrarTablaMusica) {
			tx.executeSql('DROP TABLE IF EXISTS TODAS_MUSICA');
			borrarTablaMusica = false;
		}
	    tx.executeSql('CREATE TABLE IF NOT EXISTS TODAS_MUSICA (nombre varchar(30), path varchar(255) NOT NULL, PRIMARY KEY (path))');
		tx.executeSql('INSERT INTO TODAS_MUSICA (nombre, path) VALUES (?, ?)', [nombreCancion, direccionCancion]);
		$(function() {
			//<li><a href="#" data-transition="flip" data-role="button">Los Piratas - Años 80</a></li>
			$("#files-list").append('<li><a href="reproductor.html?nombre='+nombreCancion+'" data-transition="flip" data-role="button">'+nombreCancion+'</a></li>').listview('refresh');
		});
	}

	function errorCB(err) {
	    alert("Error processing SQL: "+err.code);
	}

	function successCB() {
	    //alert("success!");
	}
}
/*function cargarBBDD() {
	window.resolveLocalFileSystemURI("file:///canciones.txt", function (fs) {
    	fs.root.getFile("canciones.txt", { create: true, exclusive: false }, function (fileEntry) {
			readFile(fileEntry);
    	}, onErrorCreateFile);
	}, onErrorLoadFs);
}*/

var estamosPrimeraCarga = true;

$(document).on( "pagecontainerchange",function(){
	var pageID = $(':mobile-pagecontainer').pagecontainer('getActivePage')[0].id;
	if(pageID == "files-list-page"){
		if (estamosPrimeraCarga) {
			borrarTablaMusica = true;
			var permissions = cordova.plugins.permissions;
			permissions.requestPermission(permissions.READ_EXTERNAL_STORAGE, successR, errorR);
			function errorR() {
			  alert("No tenemos permisos");
			}
			function successR( status ) {
			  if( !status.hasPermission ) error();
			}

			permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE, successW, errorW);
			function errorW() {
			  alert("No tenemos permisos");
			}
			function successW( status ) {
			  if( !status.hasPermission ) error();
			}

			window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, getRootDir);//ACCEDE A LA CARPETA DE LA APLICACIÓN
		} else {
			$(function() {
				for (var i = 0; i < listaCanciones.length; i++) {
					$("#files-list").append('<li><a href="reproductor.html?nombre='+listaCanciones[i].nombre+'" data-transition="flip" data-role="button">'+listaCanciones[i].nombre+'</a></li>').listview('refresh');
				}
			});
		}
	}
	else if(pageID == "page_feliz"){
		cargarListaFeliz();
	}
	else if(pageID == "page_serio"){
		cargarListaSerio();
	}
	else if(pageID == "page_triste"){
		cargarListaSerio();
	}
});

/*---------------------------------Funciones realizadas el sabado por la noche------------------------------------------------------------------------------*/
/*----------------------------Cambiar siguiente o anterior canción-------------------------------------------*/


/*function listaDeCanciones(nombre,callback){//Se puede llamar desde una funcion, y esta que sea llamada desde onclick del boton siguiente(como hicimos con el play/pause), lo malo es que cada vez que se quiera pasar de canción se tiene que cargar la lista entera de canciones, por eso la descarte
	db.transaction(function(tx){
		tx.executeSql('SELECT * FROM TODAS_MUSICA ORDER BY nombre', [], function(tx, rs){

		    for(var i=0; i<rs.rows.length; i++) {
		    	var row = rs.rows.item(i);
		        var result[i] = {nombre: row['nombre'], fullPath: row['path']};
			}
			callback(nombre,result);
		}, null);

	});

}*/


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
	while (!encontrada && i<listaCanciones.length) {
		if(listaCanciones[i].nombre==nombre){
			encontrada = true;
			nombre = listaCanciones[(i+1)%listaCanciones.length].nombre;
			iniciarAudio(listaCanciones[(i+1)%listaCanciones.length].fullPath);//Reproduce la siguiente canción de la lista, la lista esta ordenada alfabeticamente
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

function cargarListaFeliz(){
	db.transaction(cargarLista, errorCB, successCB);
	function cargarLista(tx) {

		tx.executeSql('SELECT * FROM FELIZ', [], function(tx, rs){

		    for(var i=0; i<rs.rows.length; i++) {
				$(function() {
					//<li><a href="#" data-transition="flip" data-role="button">Los Piratas - Años 80</a></li>
					$("#files-list").append('<li><a href="reproductor.html?nombre='+rs.rows.item(i)['nombre']+'" data-transition="flip" data-role="button">'+rs.rows.item(i)['nombre']+'</a></li>').listview('refresh');
					//Aunque le pasemos en href 'reproductor', pues cuando vaya a reproducir no mirar de donde viene sino el parametro que se le pase
				});
			}
		}, null);
	}
	function errorCB(err) {
	    alert("Error processing SQL: "+err.code);
	}
	function successCB() {
	    //alert("success!");
	}
}
/*
function cargarListaTriste(){
	db.transaction(cargarLista, errorCB, successCB);
	function cargarLista(tx) {

		tx.executeSql('SELECT * FROM TRISTE', [], function(tx, rs){

		    for(var i=0; i<rs.rows.length; i++) {
				$(function() {
					//<li><a href="#" data-transition="flip" data-role="button">Los Piratas - Años 80</a></li>
					$("#files-list").append('<li><a href="reproductor.html?nombre='+rs.rows.item(i)['nombre']+'" data-transition="flip" data-role="button">'+rs.rows.item(i)['nombre']+'</a></li>').listview('refresh');
					//Aunque le pasemos en href 'reproductor', pues cuando vaya a reproducir no mirar de donde viene sino el parametro que se le pase
				});
			}
		  }, null);
	}
	function errorCB(err) {
	    alert("Error processing SQL: "+err.code);
	}
	function successCB() {
	    //alert("success!");
	}

}

function cargarListaSerio(){
	db.transaction(cargarLista, errorCB, successCB);
	function cargarLista(tx) {

		tx.executeSql('SELECT * FROM SERIO', [], function(tx, rs){

		    for(var i=0; i<rs.rows.length; i++) {
				$(function() {
					//<li><a href="#" data-transition="flip" data-role="button">Los Piratas - Años 80</a></li>
					$("#files-list").append('<li><a href="reproductor.html?nombre='+rs.rows.item(i)['nombre']+'" data-transition="flip" data-role="button">'+rs.rows.item(i)['nombre']+'</a></li>').listview('refresh');
					//Aunque le pasemos en href 'reproductor', pues cuando vaya a reproducir no mirar de donde viene sino el parametro que se le pase
				});
			}
		  }, null);
	}
	function errorCB(err) {
	    alert("Error processing SQL: "+err.code);
	}
	function successCB() {
	    //alert("success!");
	}

}*/
/*------------------------------------------------------------------------------------*/
/*
function readFile(fileEntry) {

    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function() {
            alert("Successful file read: " + this.result);
            displayFileData(fileEntry.fullPath + ": " + this.result);
        };

        reader.readAsText(file);

    }, onErrorReadFile);
}*/

/*var buscar = function (entry) {
	alert(entry.fullPath);//ACCEDE AL /Android/data/com.ucm.Emusic/
	//ESCALO 3 HACIA ARRIBA Y LLEGO A / DEL DISPOSITIVO
	alert(dirroot);
	// Obtengo el DirectoryEntry para 'cordova.file.externalApplicationStorageDirectory
	var reader = dirroot.createReader();
	         // compruebo si existe un método readEntries -es el caso
	if (reader.readEntries) {alert("HAY readEntries");} else {alert("No hay readEntries");}
	reader.readEntries(function(entradas) {
		for (var i = 0; i < entradas.length; i++) {
			alert(entradas[i].isDirectory);
			alert(entradas[i].fullPath);
			if(entradas[i].isDirectory)//Comprobamos si es un directorios
				buscardirectorio(entradas[i]);//Si es un directorio se llama a la funcion recursiva buscardirectorio
			if(entradas[i].isFile){//Comprobamos si es un fichero
				extension = entradas[i].name.substr(entradas[i].name.lastIndexOf('.'));//Si es unb fichero comprobamos su terminación
				if(extension === '.mp3'){
					alert("es mp3 "+entradas[i].name);
					//guardarEnBD(entradas[i].name,entradas[i].fullPath);//llamamos a la función para que guarde el nombre y el path de la canción
				}
			}
		}
	}, function(){alert("Error al leer entradas");});//ESTA LÍNEA ESTA BIEN???, NO ES ALGO RESIDUAL??
};*/


/*
window.webkitStorageInfo.requestQuota(PERSISTENT, 1024*1024,
			function(grantedBytes) {
			  window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
			}, function(e) {
			  console.log('Error', e);
		});
		function onInitFs(fileSystem) {

			var lector = fileSystem.createReader();
			lector.readEntries(
				function (entries) {
					var bd = Emusic.crearBD('emusic', "1.0", 'Base de datos Emusic', 200000);
					bd.transaction(function (tx) {
					   tx.executeSql('CREATE TABLE IF NOT EXISTS TODAS_MUSICA (id int NOT NULL AUTO_INCREMENT, nombre varchar(30), path varchar(255), PRIMARY KEY (id))');
					});
				    var extension;
				    for (var i = 0; i < entries.length; i++) {
				       	extension = entries[i].name.substr(entries[i].name.lastIndexOf('.'));

				       	if (entries[i].isDirectory === true && recursive === true)
				        	Emusic.buscarAudio(entries[i].fullPath, recursive, level + 1);
				       	else if (entries[i].isFile === true && extension === '.mp3')
				       	{
				       		bd.transaction(function (tx) {
							   tx.executeSql('INSERT INTO TODAS_MUSICA (id, nombre, path) VALUES ("", ?, ?'), [entries[i].name, entries[i].fullPath];
							});
				       	}
			    	}
				},
				function(error) {
					console.log('Unable to read the directory. Error: ' + error.code);
				}
			);
		};

		if (level === 0)
			 $('#waiting-popup').popup('close');
		console.log('Current path analized is: ' + path);
*/

/*
function listPath(myPath){
  window.resolveLocalFileSystemURL(myPath, function (dirEntry) {
       var directoryReader = dirEntry.createReader();
       directoryReader.readEntries(onSuccessCallback,onFailCallback);
  });

  function onSuccessCallback(entries){
       for (i=0; i<entries.length; i++) {
           var row = entries[i];
           var html = '';
           if(row.isDirectory){
                 // We will draw the content of the clicked folder
                 html = '<li onclick="listPath('+"'"+row.nativeURL+"'"+');">'+row.name+'</li>';
           }else{
                 // alert the path of file
                 html = '<li onclick="getFilepath('+"'"+row.nativeURL+"'"+');">'+row.name+'</li>';
           }

       }

        document.getElementById("files-list").innerHTML = html;
  }

  function onFailCallback(e){
    console.error(e);
    // In case of error
  }
}

function getFilepath(thefilepath){
        alert(thefilepath);
}
-------------------------*/


/*function toArray(list) {
	return Array.prototype.slice.call(list || [], 0);
}

function listResults(entries) {
	// Document fragments can improve performance since they're only appended
	// to the DOM once. Only one browser reflow occurs.
	var fragment = document.createDocumentFragment();

	entries.forEach(function(entry, i) {
		var li = document.createElement('li');
		li.innerHTML = ['<span>', entry.name, '</span>'].join('');
		fragment.appendChild(li);
	});

	document.querySelector('#file-list').appendChild(fragment);
}

function onInitFs(fs) {

	var dirReader = fs.root.createReader();
	var entries = [];

	// Call the reader.readEntries() until no more results are returned.
	var readEntries = function() {
		dirReader.readEntries (function(results) {
			if (!results.length) {
				listResults(entries.sort());
			} else {
				entries = entries.concat(toArray(results));
				readEntries();
			}
		}, errorHandler);
	};

	readEntries(); // Start reading dirs.
}*/