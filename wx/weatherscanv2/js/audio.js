
function WeatherAudio() {

	var musicarr = [],
		$players = $('<div id="players">'),
		that=this,
		mobilePlaying = false;

	(function() {

		$('body').append($players);

		// start the music
		if (audioSettings.enableMusic == true) {
			buildMusicArray(musicarr);
		}
		if (audioSettings.randomStart == true) {
			var firsthalfmusicarr = musicarr
			var secondhalfmusicarr = firsthalfmusicarr.splice(Math.floor(Math.random()*firsthalfmusicarr.length))
			musicarr = [...secondhalfmusicarr,...firsthalfmusicarr]
		};
		if (audioSettings.shuffle == true) {
			shuffle(musicarr);
		};

		startPlaying(musicarr, true);

		function buildMusicArray(arr) {

			var musicpath = "music/";

			// insert track names
			for (var i = 0; i < audioSettings.order.length; i++) {
				if (audioSettings.order[i]<34) {
					arr.push(musicpath + "Weatherscan Track " + String(audioSettings.order[i]) + '.mp3');
				} else if (audioSettings.order[i] < 46) {
					arr.push(musicpath + "2003 Weatherscan Track " + String(audioSettings.order[i]-33) + '.mp3');
				} else if (audioSettings.order[i] < 51) {
					arr.push(musicpath + "2006 Weatherscan Track " + String(audioSettings.order[i]-45) + '.mp3');
				} else if (audioSettings.order[i] < 55) {
					arr.push(musicpath + "Removed Weatherscan Track " + String(audioSettings.order[i]-50) + '.mp3');
				} else if (audioSettings.order[i] < 68) {
					arr.push(musicpath + "Trammel Starks 1 Track " + String(audioSettings.order[i]-54)+ '.mp3');
				}	else if (audioSettings.order[i] < 78) {
					arr.push(musicpath + "Trammel Starks 2 Track " + String(audioSettings.order[i]-67) + '.mp3');
				} else if (audioSettings.order[i] < 84) {
					arr.push(musicpath + "Trammel Starks 3 Track " + String(audioSettings.order[i]-77) + '.mp3');
				}
			}
			 
		}

	})();


	function startPlaying(arrPlayList, bLoop) {


		// only allow one set of players to be created
		var myclass = (bLoop ? 'music' : 'voice');
		if ($players.find('.' + myclass).length>0) {return}

		var current=-1,
			len = arrPlayList.length,
			$player = initPlayer('p1'),
			$preloader = initPlayer('p2'),
			$myplayers = $players.find('.' + myclass);

		// init the event to output ID3 track info if this is a music play
		if (myclass=='music') {
			$players.find('.music').bind($.jPlayer.event.play,
				function() { // event.jPlayer.status.media

					if (that.playCallback) {

						var mp3url = $(this).data('jPlayer').status.src,
							relativeUrl = mp3url.replace('%20',' ').slice(-arrPlayList[current].length);

						// only trigger on current track, do not do on preload play/stop
						if (relativeUrl==arrPlayList[current]) {

							ID3.loadTags(mp3url, function() {
								var tags = ID3.getAllTags(mp3url);
								that.playCallback(tags); //alert(tags.artist + " - " + tags.title + ", " + tags.album);
							});
						}
					}
				}
			);
		} else {
			// duck the music if we're going to play a vocal
			$players.find('.music').jPlayer('volume', 0.30);
		}

		// prime the preloader
		$preloader.jPlayer("setMedia", {mp3:arrPlayList[0]});

		playNext();


		function playNext() {

			current = nextIndex();

			if (nextIndex()===null) {
				// nothing to preload so don't fire off a playNext after this play
				$preloader.unbind($.jPlayer.event.ended);
				$preloader.bind($.jPlayer.event.ended,
					function() {
						$players.find('.music').jPlayer('volume', 0.80); // bring music volume back up
						$player.remove();
						$preloader.remove();
					}
				);
				swapAndPlay();
			} else {
				swapAndPlay();

				// preload the next track
				function doPreload(trackname) {
					try {
						$preloader.jPlayer("setMedia", {mp3:arrPlayList[nextIndex()]}).jPlayer("play").jPlayer("stop");
					} catch(e) {
						setTimeout( function() {doPreload(trackname)}, 500);
					}
				}
				doPreload( arrPlayList[nextIndex()] );

			}

			function nextIndex() {
				var nextI = current+1;
				if (nextI<len) {
					return nextI;
				} else {
					return (bLoop ? 0 : null);
				}
			}


		}


		function initPlayer(id){
			var $div;
			$div = $('<div id=' + id + ' class="jplayer ' + myclass + '">');
			$div.jPlayer({
				swfPath: document.baseURI + "jplayer",
				preload: 'auto',
				ended: playNext
			});
			$players.append($div);
			return $div;
		}



		function swapAndPlay() {
			// who would think swapping two vars would be so hard?
			var $temp1 = $player,
				$temp2 = $preloader;
			$player = null; $preloader = null;
			$player=$temp2; $preloader=$temp1;

			$player.jPlayer("play");

			$(document).mousedown( function() {
				if (!mobilePlaying) {
					$player.jPlayer("play");
					$player.jPlayer("playHead", 100);
					mobilePlaying = true;
				}
			});
		}



	}




	// click for debugging or whater you want
	$('body').on('click', function(){
		//$player.jPlayer("playHead", 100);
		//getWeatherbyLocation();
	});


	this.playCallback = {};


	// plays the vocal current conditions announcement
	this.playCurrentConditions = function () {
		startPlaying(['/localvocals/narrations/'+audioSettings.narrationType+'/Your_current_conditions.mp3'], false);
	}
	this.playLocalRadar = function() {
		startPlaying(['/localvocals/narrations/'+audioSettings.narrationType+'/The_local_Doppler_radar.mp3'], false);
	}
	this.playLocalforecasti = function() {
		startPlaying(['/localvocals/narrations/'+audioSettings.narrationType+'/Your_local_forecast_1.mp3'], false);
	}
	this.playLocalforecastii = function() {
		startPlaying(['/localvocals/narrations/'+audioSettings.narrationType+'/Your_local_forecast_2.mp3'], false);
	}
	this.playPollenReport = function() {
		if (audioSettings.narrationType == 'female') {
			startPlaying(['/localvocals/narrations/'+audioSettings.narrationType+'/Pollen_report.mp3'], false);
		}
	}
	this.playTrafficFlow = function() {
		if (audioSettings.narrationType == 'female') {
			startPlaying(['/localvocals/narrations/'+audioSettings.narrationType+'/Traffic_flow.mp3'], false);
		}
	}
	this.playRegionalforecast = function() {
		if (audioSettings.narrationType == 'female') {
			startPlaying(['/localvocals/narrations/'+audioSettings.narrationType+'/Regional_forecast.mp3'], false);
		}
	}
	this.playAirportDelays = function() {
		if (audioSettings.narrationType == 'female') {
			startPlaying(['/localvocals/narrations/'+audioSettings.narrationType+'/Local_airport_delays.mp3'], false);
		}
	}
	this.playTrafficConditions = function () {
		startPlaying(['/localvocals/narrations/'+audioSettings.narrationType+'/Traffic_conditions.mp3'], false);
	}
	this.playwarningbeep = function () {
		startPlaying(['/localvocals/narrations/warningbeep.wav'], false);
	}

	this.severeWarning = function() {
		startPlaying(['/localvocals/narrations/TSTORM_DEFAULT.wav'], false);
	}
	this.tornadoWarning = function() {
		startPlaying(['/localvocals/narrations/TORNADO_DEFAULT.wav'], false);
	}
	this.flashFloodWarning = function() {
		startPlaying(['/localvocals/narrations/FFLOOD_DEFAULT.wav'], false);
	}




}
var weatherAudio = new WeatherAudio();
//ID3 Reader
//https://github.com/aadsm/JavaScript-ID3-Reader
(function(A){if("object"===typeof exports&&"undefined"!==typeof module)module.f=A();else if("function"===typeof define&&define.M)define([],A);else{var g;"undefined"!==typeof window?g=window:"undefined"!==typeof global?g=global:"undefined"!==typeof self?g=self:g=this;g.ID3=A()}})(function(){return function g(l,h,f){function c(b,d){if(!h[b]){if(!l[b]){var e="function"==typeof require&&require;if(!d&&e)return e(b,!0);if(a)return a(b,!0);e=Error("Cannot find module '"+b+"'");throw e.code="MODULE_NOT_FOUND",
e;}e=h[b]={f:{}};l[b][0].call(e.f,function(a){var e=l[b][1][a];return c(e?e:a)},e,e.f,g,l,h,f)}return h[b].f}for(var a="function"==typeof require&&require,b=0;b<f.length;b++)c(f[b]);return c}({1:[function(g,l){var h=g("./stringutils");if("undefined"!==typeof document){var f=document.createElement("script");f.type="text/vbscript";f.textContent="Function IEBinary_getByteAt(strBinary, iOffset)\r\n\tIEBinary_getByteAt = AscB(MidB(strBinary,iOffset+1,1))\r\nEnd Function\r\nFunction IEBinary_getLength(strBinary)\r\n\tIEBinary_getLength = LenB(strBinary)\r\nEnd Function\r\n";
document.getElementsByTagName("head")[0].appendChild(f)}else g("btoa"),g("atob");l.f=function(c,a,b){var m=a||0,d=0;"string"==typeof c?(d=b||c.length,this.a=function(a){return c.charCodeAt(a+m)&255}):"unknown"==typeof c&&(d=b||IEBinary_getLength(c),this.a=function(a){return IEBinary_getByteAt(c,a+m)});this.s=function(a,b){for(var d=Array(b),m=0;m<b;m++)d[m]=this.a(a+m);return d};this.l=function(){return d};this.g=function(a,b){return 0!=(this.a(a)&1<<b)};this.F=function(a){a=(this.a(a+1)<<8)+this.a(a);
0>a&&(a+=65536);return a};this.m=function(a){var b=this.a(a),d=this.a(a+1),m=this.a(a+2);a=this.a(a+3);b=(((b<<8)+d<<8)+m<<8)+a;0>b&&(b+=4294967296);return b};this.w=function(a){var b=this.a(a),d=this.a(a+1);a=this.a(a+2);b=((b<<8)+d<<8)+a;0>b&&(b+=16777216);return b};this.c=function(a,b){for(var d=[],m=a,c=0;m<a+b;m++,c++)d[c]=String.fromCharCode(this.a(m));return d.join("")};this.h=function(a,b,d){a=this.s(a,b);switch(d.toLowerCase()){case "utf-16":case "utf-16le":case "utf-16be":d=h.J(a,d);break;
case "utf-8":d=h.K(a);break;default:d=h.I(a)}return d};this.i=function(a,b){b()}}},{"./stringutils":9,atob:void 0,btoa:void 0}],2:[function(g,l){var h=g("./binaryfile");l.f=function(f,c,a){function b(a,b,d,e,c,f){var k=m();k?("undefined"===typeof f&&(f=!0),b&&("undefined"!=typeof k.onload?(k.onload=function(){"200"==k.status||"206"==k.status?(k.fileSize=c||k.getResponseHeader("Content-Length"),b(k)):d&&d({error:"xhr",xhr:k});k=null},d&&(k.onerror=function(){d({error:"xhr",xhr:k});k=null})):k.onreadystatechange=
function(){4==k.readyState&&("200"==k.status||"206"==k.status?(k.fileSize=c||k.getResponseHeader("Content-Length"),b(k)):d&&d({error:"xhr",xhr:k}),k=null)}),k.open("GET",a,f),k.overrideMimeType&&k.overrideMimeType("text/plain; charset=x-user-defined"),e&&k.setRequestHeader("Range","bytes="+e[0]+"-"+e[1]),k.setRequestHeader("If-Modified-Since","Sat, 01 Jan 1970 00:00:00 GMT"),k.send(null)):d&&d({error:"Unable to create XHR object"})}function m(){var a=null;"undefined"===typeof window?a=new (g("xmlhttprequest").XMLHttpRequest):
window.XMLHttpRequest?a=new window.XMLHttpRequest:window.ActiveXObject&&(a=new window.ActiveXObject("Microsoft.XMLHTTP"));return a}function d(a,b,d){var e=m();e?(b&&("undefined"!=typeof e.onload?(e.onload=function(){"200"==e.status||"206"==e.status?b(this):d&&d({error:"xhr",xhr:e});e=null},d&&(e.onerror=function(){d({error:"xhr",xhr:e});e=null})):e.onreadystatechange=function(){4==e.readyState&&("200"==e.status||"206"==e.status?b(this):d&&d({error:"xhr",xhr:e}),e=null)}),e.open("HEAD",a,!0),e.send(null)):
d&&d({error:"Unable to create XHR object"})}function e(d,e){var m,c;function f(a){var b=~~(a[0]/m)-c;a=~~(a[1]/m)+1+c;0>b&&(b=0);a>=blockTotal&&(a=blockTotal-1);return[b,a]}function g(c,f){for(;n[c[0]];)if(c[0]++,c[0]>c[1]){f&&f();return}for(;n[c[1]];)if(c[1]--,c[0]>c[1]){f&&f();return}var h=[c[0]*m,(c[1]+1)*m-1];b(d,function(a){parseInt(a.getResponseHeader("Content-Length"),10)==e&&(c[0]=0,c[1]=blockTotal-1,h[0]=0,h[1]=e-1);a={data:a.W||a.responseText,offset:h[0]};for(var b=c[0];b<=c[1];b++)n[b]=
a;f&&f()},a,h,k,!!f)}var k,l=new h("",0,e),n=[];m=m||2048;c="undefined"===typeof c?0:c;blockTotal=~~((e-1)/m)+1;for(var p in l)l.hasOwnProperty(p)&&"function"===typeof l[p]&&(this[p]=l[p]);this.a=function(a){var b;g(f([a,a]));return(b=n[~~(a/m)])&&"string"==typeof b.data?b.data.charCodeAt(a-b.offset)&255:b&&"unknown"==typeof b.data?IEBinary_getByteAt(b.data,a-b.offset):""};this.i=function(a,b){g(f(a),b)}}(function(){d(f,function(a){a=parseInt(a.getResponseHeader("Content-Length"),10)||-1;c(new e(f,
a))},a)})()}},{"./binaryfile":1,xmlhttprequest:void 0}],3:[function(g,l){var h=g("./binaryfile");l.f=function(f,c){return function(a,b){var m=c||new FileReader;m.onload=function(a){b(new h(a.target.result))};m.readAsBinaryString(f)}}},{"./binaryfile":1}],4:[function(g,l){function h(b){return"ftypM4A"==b.c(4,7)?f:"ID3"==b.c(0,3)?a:c}var f=g("./id4"),c=g("./id3v1"),a=g("./id3v2"),b=g("./bufferedbinaryajax"),m=g("./filereader");"undefined"!==typeof window&&(window.FileAPIReader=m);var d={},e={},r=[0,
7];d.B=function(a){delete e[a]};d.A=function(){e={}};d.H=function(a,d,c){c=c||{};(c.dataReader||b)(a,function(b){b.i(r,function(){var m=h(b);m.u(b,function(){var f=c.tags,h=m.v(b,f),f=e[a]||{},r;for(r in h)h.hasOwnProperty(r)&&(f[r]=h[r]);e[a]=f;d&&d()})})},c.onError)};d.D=function(a){if(!e[a])return null;var b={},d;for(d in e[a])e[a].hasOwnProperty(d)&&(b[d]=e[a][d]);return b};d.G=function(a,b){return e[a]?e[a][b]:null};d.FileAPIReader=m;d.loadTags=d.H;d.getAllTags=d.D;d.getTag=d.G;d.clearTags=d.B;
d.clearAll=d.A;l.f=d},{"./bufferedbinaryajax":2,"./filereader":3,"./id3v1":5,"./id3v2":6,"./id4":8}],5:[function(g,l){var h={},f="Blues;Classic Rock;Country;Dance;Disco;Funk;Grunge;Hip-Hop;Jazz;Metal;New Age;Oldies;Other;Pop;R&B;Rap;Reggae;Rock;Techno;Industrial;Alternative;Ska;Death Metal;Pranks;Soundtrack;Euro-Techno;Ambient;Trip-Hop;Vocal;Jazz+Funk;Fusion;Trance;Classical;Instrumental;Acid;House;Game;Sound Clip;Gospel;Noise;AlternRock;Bass;Soul;Punk;Space;Meditative;Instrumental Pop;Instrumental Rock;Ethnic;Gothic;Darkwave;Techno-Industrial;Electronic;Pop-Folk;Eurodance;Dream;Southern Rock;Comedy;Cult;Gangsta;Top 40;Christian Rap;Pop/Funk;Jungle;Native American;Cabaret;New Wave;Psychadelic;Rave;Showtunes;Trailer;Lo-Fi;Tribal;Acid Punk;Acid Jazz;Polka;Retro;Musical;Rock & Roll;Hard Rock;Folk;Folk-Rock;National Folk;Swing;Fast Fusion;Bebob;Latin;Revival;Celtic;Bluegrass;Avantgarde;Gothic Rock;Progressive Rock;Psychedelic Rock;Symphonic Rock;Slow Rock;Big Band;Chorus;Easy Listening;Acoustic;Humour;Speech;Chanson;Opera;Chamber Music;Sonata;Symphony;Booty Bass;Primus;Porn Groove;Satire;Slow Jam;Club;Tango;Samba;Folklore;Ballad;Power Ballad;Rhythmic Soul;Freestyle;Duet;Punk Rock;Drum Solo;Acapella;Euro-House;Dance Hall".split(";");
h.u=function(c,a){var b=c.l();c.i([b-128-1,b],a)};h.v=function(c){var a=c.l()-128;if("TAG"==c.c(a,3)){var b=c.c(a+3,30).replace(/\0/g,""),m=c.c(a+33,30).replace(/\0/g,""),d=c.c(a+63,30).replace(/\0/g,""),e=c.c(a+93,4).replace(/\0/g,"");if(0==c.a(a+97+28))var h=c.c(a+97,28).replace(/\0/g,""),g=c.a(a+97+29);else h="",g=0;c=c.a(a+97+30);return{version:"1.1",title:b,artist:m,album:d,year:e,comment:h,track:g,genre:255>c?f[c]:""}}return{}};l.f=h},{}],6:[function(g,l){function h(a,c){var d=c.a(a),e=c.a(a+
1),f=c.a(a+2);return c.a(a+3)&127|(f&127)<<7|(e&127)<<14|(d&127)<<21}var f=g("./id3v2frames");f.frames={BUF:"Recommended buffer size",CNT:"Play counter",COM:"Comments",CRA:"Audio encryption",CRM:"Encrypted meta frame",ETC:"Event timing codes",EQU:"Equalization",GEO:"General encapsulated object",IPL:"Involved people list",LNK:"Linked information",MCI:"Music CD Identifier",MLL:"MPEG location lookup table",PIC:"Attached picture",POP:"Popularimeter",REV:"Reverb",RVA:"Relative volume adjustment",SLT:"Synchronized lyric/text",
STC:"Synced tempo codes",TAL:"Album/Movie/Show title",TBP:"BPM (Beats Per Minute)",TCM:"Composer",TCO:"Content type",TCR:"Copyright message",TDA:"Date",TDY:"Playlist delay",TEN:"Encoded by",TFT:"File type",TIM:"Time",TKE:"Initial key",TLA:"Language(s)",TLE:"Length",TMT:"Media type",TOA:"Original artist(s)/performer(s)",TOF:"Original filename",TOL:"Original Lyricist(s)/text writer(s)",TOR:"Original release year",TOT:"Original album/Movie/Show title",TP1:"Lead artist(s)/Lead performer(s)/Soloist(s)/Performing group",
TP2:"Band/Orchestra/Accompaniment",TP3:"Conductor/Performer refinement",TP4:"Interpreted, remixed, or otherwise modified by",TPA:"Part of a set",TPB:"Publisher",TRC:"ISRC (International Standard Recording Code)",TRD:"Recording dates",TRK:"Track number/Position in set",TSI:"Size",TSS:"Software/hardware and settings used for encoding",TT1:"Content group description",TT2:"Title/Songname/Content description",TT3:"Subtitle/Description refinement",TXT:"Lyricist/text writer",TXX:"User defined text information frame",
TYE:"Year",UFI:"Unique file identifier",ULT:"Unsychronized lyric/text transcription",WAF:"Official audio file webpage",WAR:"Official artist/performer webpage",WAS:"Official audio source webpage",WCM:"Commercial information",WCP:"Copyright/Legal information",WPB:"Publishers official webpage",WXX:"User defined URL link frame",AENC:"Audio encryption",APIC:"Attached picture",COMM:"Comments",COMR:"Commercial frame",ENCR:"Encryption method registration",EQUA:"Equalization",ETCO:"Event timing codes",GEOB:"General encapsulated object",
GRID:"Group identification registration",IPLS:"Involved people list",LINK:"Linked information",MCDI:"Music CD identifier",MLLT:"MPEG location lookup table",OWNE:"Ownership frame",PRIV:"Private frame",PCNT:"Play counter",POPM:"Popularimeter",POSS:"Position synchronisation frame",RBUF:"Recommended buffer size",RVAD:"Relative volume adjustment",RVRB:"Reverb",SYLT:"Synchronized lyric/text",SYTC:"Synchronized tempo codes",TALB:"Album/Movie/Show title",TBPM:"BPM (beats per minute)",TCOM:"Composer",TCON:"Content type",
TCOP:"Copyright message",TDAT:"Date",TDLY:"Playlist delay",TENC:"Encoded by",TEXT:"Lyricist/Text writer",TFLT:"File type",TIME:"Time",TIT1:"Content group description",TIT2:"Title/songname/content description",TIT3:"Subtitle/Description refinement",TKEY:"Initial key",TLAN:"Language(s)",TLEN:"Length",TMED:"Media type",TOAL:"Original album/movie/show title",TOFN:"Original filename",TOLY:"Original lyricist(s)/text writer(s)",TOPE:"Original artist(s)/performer(s)",TORY:"Original release year",TOWN:"File owner/licensee",
TPE1:"Lead performer(s)/Soloist(s)",TPE2:"Band/orchestra/accompaniment",TPE3:"Conductor/performer refinement",TPE4:"Interpreted, remixed, or otherwise modified by",TPOS:"Part of a set",TPUB:"Publisher",TRCK:"Track number/Position in set",TRDA:"Recording dates",TRSN:"Internet radio station name",TRSO:"Internet radio station owner",TSIZ:"Size",TSRC:"ISRC (international standard recording code)",TSSE:"Software/Hardware and settings used for encoding",TYER:"Year",TXXX:"User defined text information frame",
UFID:"Unique file identifier",USER:"Terms of use",USLT:"Unsychronized lyric/text transcription",WCOM:"Commercial information",WCOP:"Copyright/Legal information",WOAF:"Official audio file webpage",WOAR:"Official artist/performer webpage",WOAS:"Official audio source webpage",WORS:"Official internet radio station homepage",WPAY:"Payment",WPUB:"Publishers official webpage",WXXX:"User defined URL link frame"};var c={title:["TIT2","TT2"],artist:["TPE1","TP1"],album:["TALB","TAL"],year:["TYER","TYE"],comment:["COMM",
"COM"],track:["TRCK","TRK"],genre:["TCON","TCO"],picture:["APIC","PIC"],lyrics:["USLT","ULT"]},a=["title","artist","album","track"];f.u=function(a,c){a.i([0,h(6,a)],c)};f.v=function(b,m){var d=0,e=b.a(d+3);if(4<e)return{version:">2.4"};var r=b.a(d+4),g=b.g(d+5,7),l=b.g(d+5,6),w=b.g(d+5,5),x=h(d+6,b),d=d+10;if(l)var q=b.m(d),d=d+(q+4);var e={version:"2."+e+"."+r,major:e,revision:r,flags:{unsynchronisation:g,extended_header:l,experimental_indicator:w},size:x},k;if(g)k={};else{for(var x=x-10,g=b,r=m,
l={},w=e.major,q=[],u=0,n;n=(r||a)[u];u++)q=q.concat(c[n]||[n]);for(r=q;d<x;){q=null;u=g;n=d;var p=null;switch(w){case 2:k=u.c(n,3);var t=u.w(n+3),z=6;break;case 3:k=u.c(n,4);t=u.m(n+4);z=10;break;case 4:k=u.c(n,4),t=h(n+4,u),z=10}if(""==k)break;d+=z+t;if(!(0>r.indexOf(k))){if(2<w)var p=u,y=n+8,p={message:{Y:p.g(y,6),R:p.g(y,5),V:p.g(y,4)},format:{T:p.g(y+1,7),N:p.g(y+1,3),P:p.g(y+1,2),L:p.g(y+1,1),C:p.g(y+1,0)}};n+=z;p&&p.format.C&&(h(n,u),n+=4,t-=4);p&&p.format.L||(k in f.b?q=f.b[k]:"T"==k[0]&&
(q=f.b["T*"]),q=q?q(n,t,u,p):void 0,q={id:k,size:t,description:k in f.frames?f.frames[k]:"Unknown",data:q},k in l?(l[k].id&&(l[k]=[l[k]]),l[k].push(q)):l[k]=q)}}k=l}for(var B in c)if(c.hasOwnProperty(B)){a:{t=c[B];"string"==typeof t&&(t=[t]);z=0;for(d=void 0;d=t[z];z++)if(d in k){b=k[d].data;break a}b=void 0}b&&(e[B]=b)}for(var C in k)k.hasOwnProperty(C)&&(e[C]=k[C]);return e};l.f=f},{"./id3v2frames":7}],7:[function(g,l){function h(a){var b;switch(a){case 0:b="iso-8859-1";break;case 1:b="utf-16";
break;case 2:b="utf-16be";break;case 3:b="utf-8"}return b}var f={b:{}},c="32x32 pixels 'file icon' (PNG only);Other file icon;Cover (front);Cover (back);Leaflet page;Media (e.g. lable side of CD);Lead artist/lead performer/soloist;Artist/performer;Conductor;Band/Orchestra;Composer;Lyricist/text writer;Recording Location;During recording;During performance;Movie/video screen capture;A bright coloured fish;Illustration;Band/artist logotype;Publisher/Studio logotype".split(";");f.b.APIC=function(a,b,
m,d,e){e=e||"3";d=a;var f=h(m.a(a));switch(e){case "2":var g=m.c(a+1,3);a+=4;break;case "3":case "4":g=m.h(a+1,b-(a-d),""),a+=1+g.j}e=m.a(a,1);e=c[e];f=m.h(a+1,b-(a-d),f);a+=1+f.j;return{format:g.toString(),type:e,description:f.toString(),data:m.s(a,d+b-a)}};f.b.COMM=function(a,b,c){var d=a,e=h(c.a(a)),f=c.c(a+1,3),g=c.h(a+4,b-4,e);a+=4+g.j;a=c.h(a,d+b-a,e);return{language:f,X:g.toString(),text:a.toString()}};f.b.COM=f.b.COMM;f.b.PIC=function(a,b,c,d){return f.b.APIC(a,b,c,d,"2")};f.b.PCNT=function(a,
b,c){return c.S(a)};f.b.CNT=f.b.PCNT;f.b["T*"]=function(a,b,c){var d=h(c.a(a));return c.h(a+1,b-1,d).toString()};f.b.TCON=function(a,b,c){return f.b["T*"].apply(this,arguments).replace(/^\(\d+\)/,"")};f.b.TCO=f.b.TCON;f.b.USLT=function(a,b,c){var d=a,e=h(c.a(a)),f=c.c(a+1,3),g=c.h(a+4,b-4,e);a+=4+g.j;a=c.h(a,d+b-a,e);return{language:f,O:g.toString(),U:a.toString()}};f.b.ULT=f.b.USLT;l.f=f},{}],8:[function(g,l){function h(a,b,f,d){var e=a.m(b);if(0==e)d();else{var g=a.c(b+4,4);-1<["moov","udta","meta",
"ilst"].indexOf(g)?("meta"==g&&(b+=4),a.i([b+8,b+8+8],function(){h(a,b+8,e-8,d)})):a.i([b+(g in c.o?0:e),b+e+8],function(){h(a,b+e,f,d)})}}function f(a,b,h,d,e){e=void 0===e?"":e+"  ";for(var g=h;g<h+d;){var l=b.m(g);if(0==l)break;var v=b.c(g+4,4);if(-1<["moov","udta","meta","ilst"].indexOf(v)){"meta"==v&&(g+=4);f(a,b,g+8,l-8,e);break}if(c.o[v]){var w=b.w(g+16+1),x=c.o[v],w=c.types[w];if("trkn"==v)a[x[0]]=b.a(g+16+11),a.count=b.a(g+16+13);else{var v=g+16+4+4,q=l-16-4-4,k;switch(w){case "text":k=b.h(v,
q,"UTF-8");break;case "uint8":k=b.F(v);break;case "jpeg":case "png":k={format:"image/"+w,data:b.s(v,q)}}a[x[0]]="comment"===x[0]?{text:k}:k}}g+=l}}var c={types:{0:"uint8",1:"text",13:"jpeg",14:"png",21:"uint8"},o:{"\u00a9alb":["album"],"\u00a9art":["artist"],"\u00a9ART":["artist"],aART:["artist"],"\u00a9day":["year"],"\u00a9nam":["title"],"\u00a9gen":["genre"],trkn:["track"],"\u00a9wrt":["composer"],"\u00a9too":["encoder"],cprt:["copyright"],covr:["picture"],"\u00a9grp":["grouping"],keyw:["keyword"],
"\u00a9lyr":["lyrics"],"\u00a9cmt":["comment"],tmpo:["tempo"],cpil:["compilation"],disk:["disc"]},u:function(a,b){a.i([0,7],function(){h(a,0,a.l(),b)})},v:function(a){var b={};f(b,a,0,a.l());return b}};l.f=c},{}],9:[function(g,l){l.f={J:function(h,f,c){var a=0,b=1,g=0;c=Math.min(c||h.length,h.length);254==h[0]&&255==h[1]?(f=!0,a=2):255==h[0]&&254==h[1]&&(f=!1,a=2);f&&(b=0,g=1);f=[];for(var d=0;a<c;d++){var e=h[a+b],l=(e<<8)+h[a+g],a=a+2;if(0==l)break;else 216>e||224<=e?f[d]=String.fromCharCode(l):
(e=(h[a+b]<<8)+h[a+g],a+=2,f[d]=String.fromCharCode(l,e))}h=new String(f.join(""));h.j=a;return h},K:function(h,f){var c=0;f=Math.min(f||h.length,h.length);239==h[0]&&187==h[1]&&191==h[2]&&(c=3);for(var a=[],b=0;c<f;b++){var g=h[c++];if(0==g)break;else if(128>g)a[b]=String.fromCharCode(g);else if(194<=g&&224>g){var d=h[c++];a[b]=String.fromCharCode(((g&31)<<6)+(d&63))}else if(224<=g&&240>g){var d=h[c++],e=h[c++];a[b]=String.fromCharCode(((g&255)<<12)+((d&63)<<6)+(e&63))}else if(240<=g&&245>g){var d=
h[c++],e=h[c++],l=h[c++],g=((g&7)<<18)+((d&63)<<12)+((e&63)<<6)+(l&63)-65536;a[b]=String.fromCharCode((g>>10)+55296,(g&1023)+56320)}}a=new String(a.join(""));a.j=c;return a},I:function(g,f){var c=[];f=f||g.length;for(var a=0;a<f;){var b=g[a++];if(0==b)break;c[a-1]=String.fromCharCode(b)}c=new String(c.join(""));c.j=a;return c}}},{}]},{},[4])(4)});
