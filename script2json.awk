#!/usr/bin/awk -f

# run with:
#	./script2json.awk game.script > data/game.json

BEGIN { print "{" }
END   {
	end_section()
   	print "}}\n"

	section_list["start"]["uses"] = 1
	for(sect in section_list){
		if(!section_list[sect]["def"]){
			print "ERROR: '" sect "' called on line " section_list[sect]["uses"] " but never defined." > "/dev/stderr" 
		}
		if(!section_list[sect]["uses"]){
			print "WARNING: '" sect "' defined on line " section_list[sect]["def"] " but never used." > "/dev/stderr" 
		}
	}
}

match($0, /^;;/) {
	end_section()
	if(current_sect != ""){
		print "},"
	}
   	print "\"" $2 "\":{"
	current_sect = $2

	# save definition line number
	section_list[current_sect]["def"] = NR;
}

match($0, /^(\t+)(.*)$/, m) {
	indent = length(m[1])

	# split the path into str -> section
	str  = m[2]
	sect = ""
	if(match(str, /^(.*) -> ([a-z0-9_]+)$/, s)){
		str  = s[1]
		sect = s[2]

		# save goto sect line number
		section_list[sect]["uses"] = NR;
	}

	if(curr_indent == 0){
		print "\"paths\": ["
	}
	else if(indent < curr_indent){
		print "}]},"
	}
	else if(indent > curr_indent){
		print ", \"paths\": ["
	}
	else if(indent == curr_indent){
		print "}, "
	}
	
	print_pathobj(str, sect)
	curr_indent = indent
}

function print_pathobj(str, sect){
	print "{\"str\":\"" str "\""
	
	if(sect){
		print ",\"sect\":\"" sect "\""
	}
}

function end_section(){
	for(; curr_indent > 0; curr_indent--)
	{
		print "}]"
	}
}
