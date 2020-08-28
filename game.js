var root = document.getElementById('game');
var engine = Engine(root);
var h = engine.h;


// Game Data
// ===========================================================================

var chars = {
    'narrator': { img:'narrator', name: 'Professor Bear', },
};

var state = {
    char1: null,
    char1_emote: 'normal',
    dialog1: null,
    waiting_for_space: false,
    show_keyboard: false,
    blessed_keys: [],
};

function bless_key(key){ state.blessed_keys.push(key); }

// Views
// ===========================================================================

function view_main(){
    return h("div", null, [
        h('h1', null, 'Keeb\'s Quest!'),
        view_char1(),
        view_waiting_for_space(),
        view_keyboard(),
    ]);
};

// ANSI physical layout - but with keys that differ with ISO blanked out
var nbsp = '\xa0';
var keyboard_layout = [
	[' ','1','2','3','4','5','6','7','8','9','0','-','=','Backspace/200'],
	['Tab/150','q','w','e','r','t','y','u','i','o','p','[',']','\\/150'],
	['Caps/175','a','s','d','f','g','h','j','k','l',';',' ','Enter/225'],
	['Shift/225','z','x','c','v','b','n','m',',','.','slash','Shift/275'],
	['Ctrl/125',' /125','Alt/125',' /625','Alt/125',' /125',' /125','Ctrl/125'],
].map(function(row){
	return row.map(function(key){
		var bits = key.split('/');
		var label = bits[0];
		var width = 'w100';
		if(label==='slash') label='/';
		if(label===' ') label=nbsp; // <--- non-breaking space char
		if(bits.length>1){
			width = 'w' + bits[1];
		}
		return {label:label, width:width};
	});
});
function view_keyboard(){
    if(!state.show_keyboard) return null;
    console.log("blessed keys:",state.blessed_keys);

    return h('div', {class:{'keyboard':true}},
		keyboard_layout.map(function(row){
			return h('div', {class:{'row':true}}, row.map(function(key){
                var blessed  = state.blessed_keys.indexOf(key.label) != -1;
				var flash    = key.label===state.key_pressed ? '.flash' : '';
				var keyclass = {'key':true,'blessed':blessed}; keyclass[key.width+flash] = true;
                var label    = blessed ? key.label : nbsp;
				return h('div', {class:keyclass}, label);
			}));
		})
	);
}

function view_char1(){
    if(!state.char1) return null;
    var mychar = chars[state.char1];
    var src = mychar.img+"_"+state.char1_emote+".png";
    return h('div', {class:{'char':true}}, [
        h('div', {class:{'portrait':true}}, [
            h('img', {src:src}),
            h('p', {class:{'charname':true}}, mychar.name),
        ]),
        h('div', {class:{'dialog':true}}, state.dialog1),
    ]);
}

function view_waiting_for_space(){
    if(!state.waiting_for_space) return null;
    return h('div', {class:{wait4space:true}}, "Press SPACEBARZ to continue!");
};


// Game script "main loop" and action handling
// ===========================================================================

//engine.render(); // initial rendering

console.log("Entire game script:",script);
function play_instruction(){
    var ins = script[current_instruction];

    if(!ins){
        alert("Yay! You've reached the end of the game so far!");
    }

    console.log("playing instruction",ins);

    keep_playing = true;

    switch(ins.action){
        case 'show':
            if(ins.data == 'keyboard'){
                state.show_keyboard = true;
                break;
            }
            state.char1 = ins.data;
            break;
        case 'dialog':
            state.dialog1 = ins.data;
            break;
        case 'press':
            state.waiting_for_space = true;
            keep_playing = false;
			engine.render(view_main); // ONLY RENDERING WHEN WE WAIT FOR USER!
            break;
        case 'emote':
            state.char1_emote = ins.data;
            break;
        case 'bless':
            // makes a key available to the user
            bless_key(ins.data);
            break;
        default:
            alert("Never seen this instruction before: "+ins.action);
    }

    current_instruction++;

    if(keep_playing){ play_instruction(); }
}
var current_instruction=0;
play_instruction();

/* engine test - call r2 and r3 manually in console
engine.render(function(){return h('div',null,'creamy hell')});
function r2(){
    engine.render(function(){return h('div',null,'diff txt')});
}
function r3(){
    engine.render(function(){return h('div',{class:{foo:true}},'diff txt')});
}
*/



// Keypress event listener
// For now, just limit to keys you might type while writing a novel. :-)
var key_ok = /^[A-Za-z0-9,.?!'" ]$/;
document.addEventListener("keydown", function(e){
	if(! key_ok.test(e.key)) return;

    // Only prevent default browser action if it's one of "our" keys.
    e.preventDefault();

    var key = e.key;
	state.key_pressed = key;
    console.log("Key pressed:'"+key+"'");
    if(key === ' ' && state.waiting_for_space){
        state.waiting_for_space = false;
        play_instruction();
    }
});
