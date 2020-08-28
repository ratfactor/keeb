#!/usr/bin/env ruby

require 'json'

# encoded script will be stored in an array (it's all sequential)
encoded = []
in_dialog = false

def format_text_line(line)
  # This method returns a pre-formatted "hyperscript" element for
  # our virtual DOM engine to render directly.

  # strong text
  if /\*.*\*/ =~ line
    # we'll just do something stupid for now to get this working
    bits = line.split('*')
      return {:tag => 'p', :props => nil, :children => [
        {:tag=>'TEXT',:str=>bits[0]},
        {:tag=>'strong', :props => nil, :children => [{:tag=>'TEXT',:str=>bits[1]}]},
        {:tag=>'TEXT',:str=>bits[2]},
      ]}
  end

  # italic

  return {:tag => 'p', :props => nil, :children => [{:tag=>'TEXT',:str=>line}]}
end

File.open('script1.txt').each do |line|
  line = line.chomp

  #skip blank lines if we're not yet in dialog
  if /^\s*$/ =~ line
    next
  end

  if line === ':-)'
    h =  {:action => 'emote', :data => 'happy'}
    encoded.push h
    next
  end

  if line === ':-('
    h = {:action => 'emote', :data => 'sad'}
    encoded.push h
    next
  end

  if line === ':-|'
    h = {:action => 'emote', :data => 'normal'}
    encoded.push h
    next
  end

  # Most lines will either match the <action data> pattern or be
  # narration/text lines.
  if /<(?<action>\w+) (?<data>\w+)>/ =~ line 
    # action matched
    h = {:action => action, :data => data}
    encoded.push h
    in_dialog = false
    next
  end

  # everything else is dialog
  if in_dialog
    # add to existing action
    encoded.last[:data].push format_text_line(line)
  else
    # make a new dialog action
    text_h = format_text_line(line)
    h = {:action => 'dialog', :data => [text_h]}
    encoded.push h
  end
  # if we weren't, we are now! additional dialog will be added
  in_dialog = true
end

puts "const script="
puts JSON.generate(encoded)
