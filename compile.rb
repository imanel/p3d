#!/usr/bin/env ruby
require 'coffee-script'

File.open('./js/cube.js', 'w') do |file|
  file.write CoffeeScript.compile( File.read('./js/cube.coffee'), :no_wrap => true)
end
