$(document).ready(function () {
	$('body').MusicPlayer({
		firstPlaying: 0,
		autoplay: false,
		shuffle: false,
		slideAlbumsName: true,
		nowplaying2title: true,
		roundedCorners: true,		
		pluginPath: "/static/plugins/",
		playlist: [
			{mp3:"static/audio/audio/demo.mp3", title:"Intro", artist:"Demo Artist", album:"Demo album", cover:"static/audio/img/demo.jpg"},
			{mp3:"static/audio/audio/demo.mp3", title:"Intro", artist:"Demo Artist", album:"Demo album", cover:"static/audio/img/demo.jpg"},
			{mp3:"static/audio/audio/demo.mp3", title:"Intro", artist:"Demo Artist", album:"Demo album", cover:"static/audio/img/demo.jpg"},
			{mp3:"static/audio/audio/demo.mp3", title:"Intro", artist:"Demo Artist", album:"Demo album", cover:"static/audio/img/demo.jpg"},
			{mp3:"static/audio/audio/demo.mp3", title:"Intro", artist:"Demo Artist", album:"Demo album", cover:"static/audio/img/demo.jpg"},
			{mp3:"static/audio/audio/demo.mp3", title:"Intro", artist:"Demo Artist", album:"Demo album", cover:"static/audio/img/demo.jpg"},
			{mp3:"static/audio/audio/demo.mp3", title:"Intro", artist:"Demo Artist", album:"Demo album", cover:"static/audio/img/demo.jpg"},
			{mp3:"static/audio/audio/demo.mp3", title:"Intro", artist:"Demo Artist", album:"Demo album", cover:"static/audio/img/demo.jpg"},
		]
	});
	
});