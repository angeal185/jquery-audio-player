$(document).ready(function () {
    $.fn.MusicPlayer = function(options) {
        options = $.extend({
            shuffle: false,
            autoplay: false,
            accentColor: "#5d1dce",
            firstPlaying: 0,
            supplied: "mp3",
            preload: "auto",
            loop: false,
            volume: 1,
            veryThin: false,
            roundedCorners: false,
            slideAlbumsName: true,
            nowplaying2title: false,
            pluginPath: "",
            playlist: [{
                title: "Add Music",
                artist: false,
                album: "Add name",
                mp3: false,
                oga: false,
                cover: false
            }]
        }, options);

        var MusicPlayer = function() {

            function hexToRgbA(hex, alpha) {
                var c;
                if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                    c = hex.substring(1).split('');
                    if (c.length == 3) {
                        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
                    }
                    c = '0x' + c.join('');
                    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
                }
                throw new Error('Bad color in options. Check # character.');
            }

            var template = "<div id='mPlayer' class='custom'><div class='streamCenter'><div class='musicPlayer'><div class='blPlayer'><div class='playControls'><button class='new-previous'><i class='previous'></i></button> <button class='new-play'><i class='pause'></i></button> <button class='new-pause' style='display:none'><i class='play'></i></button> <button class='new-next'><i class='next'></i></button></div><div class='modeControls'><button class='shuffle jp-shuffle on'></button> <button class='shuffle active jp-shuffle-off off'></button> <button class='repeat jp-repeat'></button> <button class='repeat active jp-repeat-off'></button> <button class='openPlaylist icon-list-1'></button></div><div class='volumeControl'><button class='vol vol2 jp-mute'></button> <button class='vol0 jp-unmute' style='display:none'></button><div class='ruler jp-volume-bar'><div class='trailer jp-volume-slider' style='width: 100%'></div></div></div><div class='nowPlaying'><time class='jp-time-holder'><span class='time jp-current-time'>0:00</span> <span></span> <span class='duration jp-duration'><small>loading…</small></span></time><h5 class='track'><div class='track'><span class='title'><a class='audio-title'><small>title…</small></a></span> <span class='band'><a class='new-artist'><small>loading…</small></a></span></div><div class='album'><span class='cd'><a class='new-cd'><small>album…</small></a></span></div></h5><div class='ruler'><div class='jp-play-slider'><div class='buffer jp-seek-bar'></div></div><div class='allbits' style='width:0%'></div></div></div></div></div><div class='playlist'><div><section id='queue'><div class='horizontal jq-playlist'><ul class='queue list'></ul></div></section></div></div></div></div><div id='audioplayer' class='jp-jplayer hide'></div>";

            var accentCSS = '\
				<style>\
					#mPlayer.custom .nowPlaying h5 a:hover,\
					#mPlayer.custom .list li .info h6 a:hover,\
					#mPlayer.custom .list li.jq-playlist-current h6 a{color:' + options.accentColor + ';}\
					#mPlayer.custom .ruler>.allbits>.bit,\
					#mPlayer.custom .ruler .ui-slider-range,\
					#mPlayer.custom .volumeControl .ui-slider-range,\
					#mPlayer.custom .list li .playBtn:hover {background-color:' + options.accentColor + ';}\
					#mPlayer.custom .list li.jq-playlist-current .controls {border: 3px solid ' + options.accentColor + ';}\
				</style>\
				';

            var ignore_timeupdate = false;
            var myjPlayer = false;
            var JPready = false;
            var fixFlash_mp4_id = false;
            var fixFlash_mp4 = false;
            var rebuild = false;
            var shuffleOn = options.shuffle;
            var colour = options.accentColor;
            var selected = options.firstPlaying;
            var defTitle = $('title').text();

            $(this).prepend(template);
            if (!options.roundedCorners) {
                $('#mPlayer').addClass('sharpen');
            }
            if (options.veryThin) {
                $('#mPlayer').addClass('veryThin');
            }
            $('#mPlayer').before(accentCSS);
            $('#mPlayer').find(".nowPlaying .ruler").css('background-color', hexToRgbA(options.accentColor, 0.5));


            var JPlaylist = new jPlayerPlaylist({
                    jPlayer: "#audioplayer",
                    cssSelectorAncestor: "#mPlayer"
                },
                options.playlist, {
                    playlistOptions: {
                        enableRemoveControls: true
                    },

                    supplied: options.supplied,
                    preload: options.preload,
                    loop: options.loop,
                    volume: options.volume,
                    smoothPlayBar: true,
                    keyEnabled: true,
                    fullScreen: true,
                    audioFullScreen: true,
                    ready: function(event) {
                        JPlaylist.select(selected);
                        myjPlayer = event.jPlayer;
                        setSlides(event);
                        JPready = true;
                        if (screen.width <= 480) {
                            $('body').css('margin-bottom', $('body').css('margin-bottom').split('px')[0].split('em')[0] * 1 + 88);
                        } else {
                            $('body').css('margin-bottom', $('body').css('margin-bottom').split('px')[0].split('em')[0] * 1 + 58);
                        }

                        if (event.jPlayer.status.noVolume) {
                            $(event.jPlayer.options.cssSelectorAncestor + ' .musicPlayer').addClass('volHidden');
                        }

                        if (myjPlayer.options.loop) {
                            $(JPlaylist.cssSelector.jPlayer).unbind($.jPlayer.event.ended).bind($.jPlayer.event.ended, looper);
                        } else {
                            $(JPlaylist.cssSelector.jPlayer).unbind($.jPlayer.event.ended).bind($.jPlayer.event.ended, looperOff);
                        }
                        if (options.nowplaying2title) {
                            if (defTitle) {
                                $(JPlaylist.cssSelector.jPlayer).bind($.jPlayer.event.pause, function() {
                                    $('title').text(defTitle);
                                });
                            }
                            $(JPlaylist.cssSelector.jPlayer).bind($.jPlayer.event.play, function() {
                                $('title').text($(event.jPlayer.options.cssSelectorAncestor + ' .nowPlaying .audio-title').text() + ' — ' + $(event.jPlayer.options.cssSelectorAncestor + ' .nowPlaying .new-artist').text());
                            });
                        }

                        if (shuffleOn) {
                            shuffler();
                        }

                        rebuildPl(event);
                        myScroll = new IScroll(event.jPlayer.options.cssSelectorAncestor + ' .horizontal', {
                            scrollX: true,
                            scrollY: false,
                            mouseWheel: true,
                            interactiveScrollbars: true,
                            scrollbars: 'custom',
                            shrinkScrollbars: 'scale',
                            fadeScrollbars: true
                        });

                        $(event.jPlayer.options.cssSelectorAncestor + ' .musicPlayer').addClass('show');

                        if (options.autoplay && !event.jPlayer.status.noVolume) {
                            $(JPlaylist.cssSelector.cssSelectorAncestor + " .playControls .new-play").addClass('playing').hide();
                            $(JPlaylist.cssSelector.cssSelectorAncestor + " .playControls .new-pause").show().addClass('playing');

                            JPlaylist.play();
                        }

                        if (options.slideAlbumsName) {
                            setTimeout(function() {
                                $(event.jPlayer.options.cssSelectorAncestor + ' .nowPlaying h5').removeClass('track').addClass('album');
                            }, 2500);
                            setTimeout(function() {
                                $(event.jPlayer.options.cssSelectorAncestor + ' .nowPlaying h5').removeClass('album').addClass('track');
                            }, 5000);
                            setInterval(function() {
                                $(event.jPlayer.options.cssSelectorAncestor + ' .nowPlaying h5').removeClass('track').addClass('album');
                                setTimeout(function() {
                                    $(event.jPlayer.options.cssSelectorAncestor + ' .nowPlaying h5').removeClass('album').addClass('track');
                                }, 5000);
                            }, 10000);
                        }
                    },
                    volumechange: function(event) {
                        myjPlayer = event.jPlayer;

                        if (event.jPlayer.options.muted) {
                            myControl.volume.slider("value", 0);
                        } else {
                            myControl.volume.slider("value", event.jPlayer.options.volume);
                        }

                        if ($(JPlaylist.cssSelector.jPlayer).jPlayer("option", "volume") === 0) {
                            $(event.jPlayer.options.cssSelectorAncestor + ' .vol').removeClass('volmute').removeClass('vol0').removeClass('vol1').removeClass('vol2').addClass('volmute');
                            return;
                        }
                        if ($(JPlaylist.cssSelector.jPlayer).jPlayer("option", "volume") < 0.2) {
                            $(event.jPlayer.options.cssSelectorAncestor + ' .vol').removeClass('volmute').removeClass('vol0').removeClass('vol1').removeClass('vol2').addClass('vol0');
                            return;
                        }
                        if ($(JPlaylist.cssSelector.jPlayer).jPlayer("option", "volume") < 0.7) {
                            $(event.jPlayer.options.cssSelectorAncestor + ' .vol').removeClass('volmute').removeClass('vol0').removeClass('vol1').removeClass('vol2').addClass('vol1');
                            return;
                        }
                        if ($(JPlaylist.cssSelector.jPlayer).jPlayer("option", "volume") <= 1) {
                            $(event.jPlayer.options.cssSelectorAncestor + ' .vol').removeClass('volmute').removeClass('vol0').removeClass('vol1').removeClass('vol2').addClass('vol2');
                            return;
                        }
                    },
                    setmedia: function(event) {
                        $(event.jPlayer.options.cssSelectorAncestor + ' .nowPlaying h5').removeClass('album').addClass('track');
                        if (rebuild) {
                            rebuildPl(event);
                            rebuild = false;
                        }

                        $(event.jPlayer.options.cssSelectorAncestor + ' .nowPlaying .new-artist').text($(event.jPlayer.options.cssSelectorAncestor + ' .playlist ul li:nth-child(' + (JPlaylist.current + 1) + ') .new-artist').text());
                        $(event.jPlayer.options.cssSelectorAncestor + ' .nowPlaying .audio-title').text($(event.jPlayer.options.cssSelectorAncestor + ' .playlist ul li:nth-child(' + (JPlaylist.current + 1) + ') .new-title').text());
                        $(event.jPlayer.options.cssSelectorAncestor + ' .nowPlaying .new-cd').text($(event.jPlayer.options.cssSelectorAncestor + ' .playlist ul li:nth-child(' + (JPlaylist.current + 1) + ') .new-artist').data('cd'));
                        $(event.jPlayer.options.cssSelectorAncestor + ' .allbits').stop().css('width', 0).empty();
                        var countpix = Math.round(screen.width / 2);
                        var i = 0;
                        while (i < countpix) {
                            i++;
                            heigth = Math.round(Math.random() * 10) + 4;
                            minustop = Math.floor(6 - (heigth - 1) / 2) + 1;
                            $(event.jPlayer.options.cssSelectorAncestor + ' .allbits').prepend('<div class="bit" style="margin-top:' + minustop + 'px; height:' + heigth + 'px;" ></div>');
                        }
                    },
                    keyBindings: { //Functional Buttons clicks (Win)
                        play: {
                            key: 179,
                            fn: function(f) {
                                if (f.status.paused) {
                                    f.play();
                                } else {
                                    f.pause();
                                }
                            }
                        },
                        stop: {
                            key: 178,
                            fn: function(f) {
                                f.stop();
                            }
                        },
                        next: {
                            key: 176, // RIGHT
                            fn: function(f) {
                                JPlaylist.next();
                            }
                        },
                        previous: {
                            key: 177, // LEFT
                            fn: function(f) {
                                JPlaylist.previous();
                            }
                        },
                        volumeUp: {
                            key: undefined, // UP
                            fn: function(f) {
                                return false;
                            }
                        },
                        volumeDown: {
                            key: undefined, // DOWN
                            fn: function(f) {
                                return false;
                            }
                        }
                    },
                    timeupdate: function(event) {
                        myjPlayer = event.jPlayer;
                        if (!ignore_timeupdate && JPready) {
                            myControl.progress.slider("value", event.jPlayer.status.currentPercentAbsolute);
                            $(event.jPlayer.options.cssSelectorAncestor + ' .allbits').stop().animate({
                                'width': event.jPlayer.status.currentPercentAbsolute + '%'
                            }, 'fast');
                        }
                    }
                });

            var myControl = {
                progress: $(this).find(".jp-play-slider"),
                volume: $(this).find(".jp-volume-slider")
            };

            function setSlides(event) {
                myControl.progress.slider({
                    animate: 'fast',
                    max: 100,
                    range: "min",
                    step: 0.1,
                    value: 0,
                    slide: function(e, ui) {
                        var sp = myjPlayer.status.seekPercent;
                        var value = ui.value;
                        if (sp > 0) {
                            if (fixFlash_mp4) {
                                ignore_timeupdate = true;
                                clearTimeout(fixFlash_mp4_id);
                                fixFlash_mp4_id = setTimeout(function() {
                                    ignore_timeupdate = false;
                                }, 1000);
                            }
                            $(JPlaylist.cssSelector.jPlayer).jPlayer("playHead", value * (100 / sp));
                        } else {
                            setTimeout(function() {
                                myControl.progress.slider("value", 0);
                            }, 0);
                        }
                    }
                });

                myControl.volume.slider({
                    animate: true,
                    max: 1,
                    range: "min",
                    step: 0.01,
                    value: myjPlayer.options.volume,
                    slide: function(e, ui) {
                        var value = ui.value;
                        $(JPlaylist.cssSelector.jPlayer).jPlayer("option", "muted", false);
                        $(JPlaylist.cssSelector.jPlayer).jPlayer("option", "volume", value);
                    }
                });
            }

            function rebuildPl(event) {
                var i = -1;
                var tpl = '';

                $(JPlaylist.cssSelector.cssSelectorAncestor + " .jq-playlist li").each(function() {
                    tpl = "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDhGOTczMkUyNUY4MTFFNEJDNDdFMTBDNjc0MDA0NDciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDhGOTczMkYyNUY4MTFFNEJDNDdFMTBDNjc0MDA0NDciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowOEY5NzMyQzI1RjgxMUU0QkM0N0UxMEM2NzQwMDQ0NyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowOEY5NzMyRDI1RjgxMUU0QkM0N0UxMEM2NzQwMDQ0NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pq6fqRoAAAAQSURBVHjaYvj//z8DQIABAAj8Av7bok0WAAAAAElFTkSuQmCC' class='new-cover'><div class='info'><h6><a class='new-title'>No Title</a></h6><a class='new-artist' data-cd=''>No Band</a></div><div class='clr'></div><div class='controls'><a class='playBtn'></a></div>";
                    i++;
                    $(this).html(tpl);
                    $(this).data('i', i);
                    setID3orTags(event, i);

                });

                $(JPlaylist.cssSelector.cssSelectorAncestor + " .jq-playlist li, " + JPlaylist.cssSelector.cssSelectorAncestor + " .playControls .new-play, " + JPlaylist.cssSelector.cssSelectorAncestor + " .playControls .new-pause").unbind('click', goPlaying).bind('click', goPlaying);
                $(event.jPlayer.options.cssSelectorAncestor + ' .nowPlaying .new-artist').text($(event.jPlayer.options.cssSelectorAncestor + ' .playlist ul li:nth-child(' + (selected + 1) + ') .new-artist').text());
                $(event.jPlayer.options.cssSelectorAncestor + ' .nowPlaying .audio-title').text($(event.jPlayer.options.cssSelectorAncestor + ' .playlist ul li:nth-child(' + (selected + 1) + ') .new-title').text());
                $(event.jPlayer.options.cssSelectorAncestor + ' .nowPlaying .new-cd').text($(event.jPlayer.options.cssSelectorAncestor + ' .playlist ul li:nth-child(' + (selected + 1) + ') .new-artist').data('cd'));


            }

            function setID3orTags(event, i) {
                var tags = false;

                var thisLi = $(JPlaylist.cssSelector.cssSelectorAncestor + " .jq-playlist li:nth-child(" + (i + 1) + ")");

                if (JPlaylist.playlist[i].cover) {
                    thisLi.find('.new-cover').attr('src', JPlaylist.playlist[i].cover);
                } else {
                    thisLi.find('.new-cover').addClass('noCover');
                }

                if (JPlaylist.playlist[i].artist) {
                    thisLi.find('.new-artist').text(JPlaylist.playlist[i].artist);
                }

                if (JPlaylist.playlist[i].title) {
                    thisLi.find('.new-title').text(JPlaylist.playlist[i].title);
                }

                if (JPlaylist.playlist[i].album) {
                    thisLi.find('.new-artist').data('cd', JPlaylist.playlist[i].album);
                } else {
                    thisLi.find('.new-artist').data('cd', 'Unknown album');
                }

                if (!(JPlaylist.playlist[i].title && JPlaylist.playlist[i].artist && JPlaylist.playlist[i].cover)) {
                    ID3.loadTags(JPlaylist.playlist[i].mp3, function() {
                        tags = ID3.getAllTags(JPlaylist.playlist[i].mp3);

                        if (!JPlaylist.playlist[i].artist && tags.artist) {
                            thisLi.find('.new-artist').text(tags.artist);
                        }

                        if (!JPlaylist.playlist[i].title && tags.title) {
                            thisLi.find('.new-title').text(tags.title);
                        }

                        if (JPlaylist.playlist[i].album) {
                            thisLi.find('.new-artist').data('cd', JPlaylist.playlist[i].album);
                        } else {
                            if (tags.album) {
                                thisLi.find('.new-artist').data('cd', tags.album);
                            } else {
                                thisLi.find('.new-artist').data('cd', 'Unknown album');
                            }
                        }

                        if (!JPlaylist.playlist[i].cover) {
                            var image = tags.picture;
                            if (image) {
                                var base64String = "";
                                for (var j = 0; j < image.data.length; j++) {
                                    base64String += String.fromCharCode(image.data[j]);
                                }
                                var base64 = "data:" + image.format + ";base64," + window.btoa(base64String);
                                thisLi.find('.new-cover').attr('src', base64);
                                thisLi.find('.new-cover').removeClass('noCover');
                            } else {
                                thisLi.find('.new-cover').addClass('noCover');
                            }
                        }
                    }, {
                        tags: ["title", "artist", "album", "picture"]
                    });
                }

            }

            $(JPlaylist.cssSelector.cssSelectorAncestor + " .new-next").click(function() {
                JPlaylist.next();
            });
            $(JPlaylist.cssSelector.cssSelectorAncestor + " .new-previous").click(function() {
                JPlaylist.previous();
            });

            function looper() {
                JPlaylist.play();
            }

            function looperOff() {
                JPlaylist.next();
            }
            $(JPlaylist.cssSelector.cssSelectorAncestor + " .jp-repeat").click(function() {
                $(JPlaylist.cssSelector.jPlayer).unbind($.jPlayer.event.ended, looper).unbind($.jPlayer.event.ended, looperOff).bind($.jPlayer.event.ended, looper);
                $(JPlaylist.cssSelector.jPlayer).jPlayer("option", "loop", true);
            });
            $(JPlaylist.cssSelector.cssSelectorAncestor + " .jp-repeat-off").click(function() {
                $(JPlaylist.cssSelector.jPlayer).unbind($.jPlayer.event.ended, looper).unbind($.jPlayer.event.ended, looperOff).bind($.jPlayer.event.ended, looperOff);
                $(JPlaylist.cssSelector.jPlayer).jPlayer("option", "loop", false);
            });

            $(JPlaylist.cssSelector.jPlayer).bind($.jPlayer.event.play, function() {
                $(JPlaylist.cssSelector.cssSelectorAncestor + " .playlist li").removeClass('playing');
                $(JPlaylist.cssSelector.cssSelectorAncestor + " .jq-playlist li:nth-child(" + (JPlaylist.current + 1) + ")").addClass('playing');

                $(JPlaylist.cssSelector.cssSelectorAncestor + " .playControls .new-play").addClass('playing').hide();
                $(JPlaylist.cssSelector.cssSelectorAncestor + " .playControls .new-pause").show().addClass('playing');
            });
            $(JPlaylist.cssSelector.jPlayer).bind($.jPlayer.event.pause, function() {
                $(JPlaylist.cssSelector.cssSelectorAncestor + " .jq-playlist li:nth-child(" + (JPlaylist.current + 1) + ")").removeClass('playing');
                $(JPlaylist.cssSelector.cssSelectorAncestor + " .playControls .new-pause").removeClass('playing').hide();
                $(JPlaylist.cssSelector.cssSelectorAncestor + " .playControls .new-play").show().removeClass('playing');
            });

            function shuffler() {
                JPlaylist.playlist.sort(function() {
                    return 0.5 - Math.random();
                });
                JPlaylist.shuffled = true;
                rebuild = true;
            }

            function shufflerOff() {
                JPlaylist._originalPlaylist();
                rebuild = true;
            }
            $(JPlaylist.cssSelector.cssSelectorAncestor + " .jp-shuffle").click(function() {
                shuffler();
            });
            $(JPlaylist.cssSelector.cssSelectorAncestor + " .jp-shuffle-off").click(function() {
                shufflerOff();
            });

            function goPlaying(event) {
                if ($(this).hasClass('playing')) {
                    $(JPlaylist.cssSelector.jPlayer).jPlayer("pause");
                } else {
                    JPlaylist.play($(this).data('i'));
                    $(JPlaylist.cssSelector.cssSelectorAncestor + " .playlist li").removeClass('playing');
                }
            }
        };
        return this.each(MusicPlayer);
    };
});