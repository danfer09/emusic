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
var nombre;
$(document).on( "pagecreate", "#player-page", function( e ) {
    var titulo = (($(this).data("url").indexOf("?") > 0) ? $(this).data("url") : '-' ).replace( /.*titulo=/, "" ).replace(new RegExp("\\+","g"),' ');
    nombre = titulo.split('=')[1];
    $("#media-name").text(nombre);

    hacerSelectCancion(nombre, iniciarAudio);//ESTO LLAMA A UNA FUNCIÓN PARA REPRODUCIR LA CANCIÓN EN TEORÍA

    // Pause after 10 seconds
    /*setTimeout(function () {
        my_media.pause();
    }, 10000);*/

});

window.setInterval(function(){
    	if(my_media){
    		$('#media-duration').html("<span>"+my_media.getDuration()+"</span>");
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
	} else if (status == 3 || status == 4) {//está en pausa
		hacerSelectCancion(nombre, playAudio);
	}
}
var iniciarAudio = function(url) {
    // Play the audio file at url
    my_media = new Media(url,
        // success callback
        function () { alert("playAudio():Audio Success"); },
        // error callback
        function (err) { alert("playAudio():Audio Error: " + err); },
        function(mediaStatus) {
        	status = mediaStatus;
        }
    );


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

/*function buscarAudio()
{
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dirEntry) {
		console.log('file sistem abierto: ' + dirEntry.name);

		var para = document.createElement("P");
		var v = document.createTextNode(dirEntry.name);
		para.appendChild(v);
		document.getElementById('files-list').appendChild(para);
	}, onErrorLoadFs);
}*/
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

function hacerSelect() {
	var result = [];
	db.transaction(function (tx) {
	  	tx.executeSql('SELECT * FROM TODAS_MUSICA', [], function(tx, rs){

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
function guardarEnBD(nombreCancion, direccionCancion){
	db = window.openDatabase("emusic", "1.0", "Cordova Demo", 200000);
	db.transaction(insertarCancion, errorCB, successCB);

	function insertarCancion(tx) {
		tx.executeSql('DROP TABLE IF EXISTS TODAS_MUSICA');
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
function cargarBBDD() {
	window.resolveLocalFileSystemURI("file:///canciones.txt", function (fs) {
    	fs.root.getFile("canciones.txt", { create: true, exclusive: false }, function (fileEntry) {
			readFile(fileEntry);
    	}, onErrorCreateFile);
	}, onErrorLoadFs);
}

$(document).on( "pagecontainerchange",function(){
	var pageID = $(':mobile-pagecontainer').pagecontainer('getActivePage')[0].id;
	if(pageID == "files-list-page"){
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
	}
});

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