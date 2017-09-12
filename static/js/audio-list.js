$(document).ready(function () {
	$.getJSON('playlist.json', function(data) { 
  }); 
	$('body').MusicPlayer({
		firstPlaying: 0,
		autoplay: false,
		shuffle: false,
		slideAlbumsName: true,
		nowplaying2title: true,
		roundedCorners: true,		
		pluginPath: "/static/plugins/",
		playlist: data
	});
	
});