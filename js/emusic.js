function exitFromApp()
{
	navigator.app.exitApp();
}

//Pasar al reproductor.html el nombre de la canción seleccionada
$(document).on( "pagecreate", "#files-list-page",  function( e ) {
    $('#files-list li a').on('click', function(e) {
        $(":mobile-pagecontainer").pagecontainer("change", "reproductor.html", {
            data: {
                titulo: this.text,
            },
            transition: "flip"
        });
    });
});

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

$(document).on( "pagecreate", "#player-page", function( e ) {
    var titulo = (($(this).data("url").indexOf("?") > 0) ? $(this).data("url") : '-' ).replace( /.*titulo=/, "" ).replace(new RegExp("\\+","g"),' ');
    $("#media-name").text(titulo);

    playMusic();


    // Pause after 10 seconds
    /*setTimeout(function () {
        my_media.pause();
    }, 10000);*/


});
function playMusic() {
	/*module.controller('MyCtrl', function($scope, $cordovaMedia) {
		var src = "android_asset/www/Los Piratas - Años 80.mp3";
			var media = $cordovaMedia.newMedia(src);
			media.play();
	});*/
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
}

// /emusic/cordova/emusic/www/Los Piratas - Años 80.mp3

function crearBD(nombre, descripcion) {
	var bd = openDatabase(name, '1.0', descripcion, 5 * 1024 * 1024);

	return bd;
}
function buscarAudio()
{
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dirEntry) {
		console.log('file sistem abierto: ' + dirEntry.name);

		var para = document.createElement("P");
		var v = document.createTextNode(dirEntry.name);
		para.appendChild(v);
		document.getElementById('files-list').appendChild(para);
	}, onErrorLoadFs);
}
function refrescaAudio() {
	var para = document.createElement("P");
	var v = document.createTextNode("aaa");

	para.appendChild(v);
	document.getElementById('files-list').appendChild(para);

	buscarAudio("/", true, 0);
}


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
					var bd = Emusic.crearBD('emusic', 'Base de datos Emusic');
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