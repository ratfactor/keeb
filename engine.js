// +-------------------------------+
// | Dave's Little vdom Experiment |
// +-------------------------------+
// 
// Will figure out license later - for now you don't
// want this anyway.
// The globals alone will make you despair!

// Start Engine()
//  - dom_render_to is the existing DOM element to fill with good stuff.
function Engine(dom_render_to){

var prev_vdom = null;
var mid_render = false; // don't attempt to render while rendering

// This clever implementation taken from the Ramda functional library.
function type(val) {
    return (val === null ? 'Null'
        : val === undefined ? 'Undefined'
        : Object.prototype.toString.call(val).slice(8, -1));
}

// Create virtual element
function h(tag, props, children){
    if(type(children) === 'Undefined') children = [];
    if(type(children) === 'String') children = [{tag:"TEXT", str:children, props:null, children:[]}];
    if(type(children) !== 'Array') children = [children];
    return {
        tag: tag,
        props: props,
        children: children,
    };
}

// Compare virtual elements (can also be strings)
function same(v1, v2){
    if(v1.tag==='TEXT') return v2.tag==='TEXT' && v1.str === v2.str;
    return v1.tag===v2.tag;
}

// Update props on DOM element
function dom_props(elem, props, old_props){
    if(!props) props = {};
    if(!old_props) old_props = {};
    var all_keys = Object.keys(props).concat(Object.keys(old_props));
    all_keys.forEach(function(pkey){
        if(!props[pkey]){
            elem.removeAttribute(pkey);
            return;
        }
        if(props[pkey] !== old_props[pkey]){
            var p = props[pkey];
            if(pkey.substring(0,2) === 'on'){
				// Property is an event listener
                dom_event(elem, pkey.substring(2), p);
                return;
            }
            if(pkey === 'class'){
                dom_class(elem, p);
                return;
            }
            // Property is a regular ol' attribute
            elem.setAttribute(pkey, p);
        }
    });
}

// Add/update event listener
function dom_event(dom_elem, event_name, handler){
    var wrapped_handler = function(){
        handler();
        render(); // TODO <----- this shouldn't be here! (but something should)
    };
    dom_elem.addEventListener(event_name, wrapped_handler);
}

function dom_class(elem, classes){
    var list = Object.keys(classes).filter(function(name){
        return classes[name]; // truthy
    });
    elem.setAttribute('class', list.join(' '));
}

// Create a browser DOM element from a virtual element
function dom_create(v){
    if(!v) return v;
    var elem;
    if(v.tag === 'TEXT'){
        v.dom_elem = document.createTextNode(v.str);
        return v.dom_elem;
    }
    var elem = document.createElement(v.tag);
    dom_props(elem, v.props);

    // Create children recursively
    if(v.children){
        v.children.forEach(function(childv){
            if(!childv) return;
            elem.appendChild(dom_create(childv));
        });
    }
    v.dom_elem = elem;
    return elem;
}

// Update DOM parent given old and new virtual elements
function dom_update(dom_parent, v_old, v_new){
    // No new here - remove old
    if(!v_new){
        dom_parent.removeChild(v_old.dom_elem);
        return;
    }
    // No old here - create new
    if(!v_old){
        dom_parent.appendChild(dom_create(v_new));
        return;
    }
//    console.log("v_old",v_old,"v_old dom elem:",v_old.dom_elem);
    // Different - replace old with new
    if(!same(v_new, v_old)){
        dom_parent.replaceChild(dom_create(v_new), v_old.dom_elem);
        return;
    }
    // Same type - update props
	if(!v_old.dom_elem){
		console.log("there's no actual DOM element here to update!");
		return;
	}
    dom_props(v_old.dom_elem, v_new.props, v_old.props);
    // Same type - recursively update (any) children
    if(!v_new.children) return;
    // max_child is the highest index of the old or new vnode's children
    var max_child = Math.max(v_new.children.length, v_old.children.length)-1;

    for(var i=0; i <= max_child; i++){
        if(!v_new.children[i] && !v_old.children[i]){
            // This is perfectly valid - children may be null, simply skip.
            continue;
        }
        dom_update(v_old.dom_elem, v_old.children[i], v_new.children[i]);
    }
}

function get_render_closure(vdom_fn){
    return function _render(){
        console.log("  * Yup, calling closure fn!");
        var new_vdom = vdom_fn(); // could pass in state here?
        dom_update(dom_render_to, prev_vdom, new_vdom);
        prev_vdom = new_vdom;
        console.log("  * setting mid-render to false again");
        mid_render = false;
    };
}

function render(vdom_fn){
    /*
    console.log("Render requested.");
    if(mid_render){
        console.log("  * Render skipped - already doing one");
        return; // already rendering or queued up to render
    }
    mid_render = true;
    */
    requestAnimationFrame(get_render_closure(vdom_fn));
}

return {
    h: h,
    render: render,
};

} // End Engine()
