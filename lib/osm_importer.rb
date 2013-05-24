#!/usr/bin/env ruby

require "pathname"

# -------------------------------------------------------------------------------------------------------------------------
BARDULIA_MBR = {
  :lon_min => -2.6065609709,
  :lat_min => 42.8906042891,
  :lon_max => -1.7164767700,
  :lat_max => 43.4015327529
}

# -------------------------------------------------------------------------------------------------------------------------
def execute_command( cmd)
  line = "-"*80

  puts line
  puts_message( cmd)

  system( cmd)
  if $? != 0
    puts_message( %Q[El comando "#{cmd}" devolvió el código de error #{$?}])
  end

  puts line

  if $? != 0
    exit $?
  end
end

def print_message( message)
  print( "| #{message}")
end

def puts_message( message)
  puts( "| #{message}")
end

def action_message( message);
  puts_message( "-> #{message}")
end

def change_working_directory
  expanded_path = Pathname.new( __FILE__).realpath.dirname  # obtenemos path del fichero
  Dir.chdir( expanded_path);
  #execute_command( "pwd")  # *dEBUG*
end

def ask( message)
  while true
    print_message( "#{message} [S/N]: ")
    case gets.strip()
      when "S", "s"
        return true
      when "N", "n"
        return false
    end
  end
end

def overwrite_file?( file_name)
  return ( !File.exists?( file_name)) || ask( "El fichero \"#{file_name}\" ya existe, lo sobreescribo?")
end

# -------------------------------------------------------------------------------------------------------------------------
OSM_FULL_FILE = "tmp/spain.osm"
OSM_BARDULIA_FILE = "tmp/bardulia.osm"
OSM_BARDULIA_BIDEGORRIS_FILE = "tmp/bardulia-bidegorriak.osm"

def download_and_uncompress_full_osm
  osm_compressed_file = "#{OSM_FULL_FILE}.bz2"

  action_message( "Descargando #{osm_compressed_file}")
  if overwrite_file?( osm_compressed_file)
    execute_command( "curl -# -o #{osm_compressed_file} http://download.geofabrik.de/osm/europe/spain.osm.bz2")
  end

  action_message( "Descomprimiendo #{osm_compressed_file}")
  if overwrite_file?( OSM_FULL_FILE)
    execute_command( "bunzip2 --force --keep #{osm_compressed_file}")
  end
end

def extract_bardulia
  action_message( "Extrayendo Bardulia de #{OSM_FULL_FILE}")
  if overwrite_file?( OSM_BARDULIA_FILE)
    execute_command( "osmosis/bin/osmosis -quiet " + 
                     "--read-xml #{OSM_FULL_FILE} " +
                     "--bounding-box left=#{BARDULIA_MBR[ :lon_min]} bottom=#{BARDULIA_MBR[ :lat_min]} right=#{BARDULIA_MBR[ :lon_max]} top=#{BARDULIA_MBR[ :lat_max]} " +
                     "--write-xml #{OSM_BARDULIA_FILE}")
  end
end

def extract_bardulia_bidegorris
  action_message( "Extrayendo bidegorris de #{OSM_BARDULIA_FILE}")
  if overwrite_file?( OSM_BARDULIA_BIDEGORRIS_FILE)
    execute_command( "osmosis/bin/osmosis -quiet " +
                     "--read-xml #{OSM_BARDULIA_FILE} " +
                     "--way-key-value keyValueList=\"highway.cycleway,bicycle.yes\" " + 
                     "--write-xml #{OSM_BARDULIA_BIDEGORRIS_FILE}")
  end
end

def convert_bardulia_bidegorris_to_gml
  action_message( "Convirtiendo bidegorris a GML desde #{OSM_BARDULIA_BIDEGORRIS_FILE}")
  execute_command( "cat #{OSM_BARDULIA_BIDEGORRIS_FILE} | ./osm2gml.py > ../web/gml_osm/bardulia-bidegorriak.gml")
end

# -------------------------------------------------------------------------------------------------------------------------
# main()
if __FILE__ == $0

  # fijamos working directory en este proceso para simplificar los paths en los comandos y ficheros de datos
  change_working_directory()  

  # descargar OSM de España
  download_and_uncompress_full_osm()

  # extraer zona Bardulia
  extract_bardulia()

  # extraer bidegorris de Bardulia
  extract_bardulia_bidegorris()

  # convertir a GML
  convert_bardulia_bidegorris_to_gml()
end
