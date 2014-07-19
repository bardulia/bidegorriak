( function() {

    // -- B5M ---------------------------------------------------------------------
    var BIDEGORRIS_LIST = [
      [ "0200", "BERGARA - S. PRUDENCIO (Bergara)"],
      [ "0201", "SORALUZE PLACENCIA DE LAS ARMAS - BERGARA"],
      [ "0202", "ERRENTERIA - OIARTZUN"],
      [ "0203", "OIARTZUN - ARDITURRI"],
      [ "0204", "URNIETA - ANDOAIN"],
      [ "0205", "ARETXABALETA - EMBALSE DE URKULU"],
      [ "0206", "RED DE ARRASATE"],
      [ "0207", "NEKOLALDE (Bergara) - CASERIO ITURRIOZ (Antzuola)"],
      [ "0208", "ELGOIBAR-MALZAGA (Elgoibar)"],
      [ "0209", "ALEGIA - IKAZTEGIETA"],
      [ "0210", "HERNANI - IGARATEGI INDUSTRIALDEA (Urnieta)"],
      [ "0211", "RED DE IRUN"],
      [ "0212", "LASARTE ORIA - MIRACAMPOS (Lasarte Oria)"],
      [ "0213", "RED DE LAZKAO"],
      [ "0214", "LAZKAO - S. MARTIN (Ataun)"],
      [ "0215", "USURBIL - TXOKOALDE (Usurbil)"],
      [ "0216", "VILLABONA - POLIGONO 7 (Villabona)"],
      [ "0217", "RED DE ZUMAIA"],
      [ "0218", "CASERIO OTZAKA (Zestoa) - ZESTOA"],
      [ "0219", "ODRIA (Azpeitia) - AZPEITIA"],
      [ "0220", "RED DE AZKOITIA"],
      [ "0221", "RED DE BEASAIN"],
      [ "0222", "MIRANDAOLA (Legazpi)"],
      [ "0223", "LEINTZ GATZAGA - ALAVA"],
      [ "0224", "CASERIO ZELAETA (Ormaiztegi) - ORMAIZTEGI"],
      [ "0225", "RED DE TOLOSA"],
      [ "0226", "AZKOITIA - ZUMARRAGA - URRETXU - LEGAZPI"],
      [ "0227", "S. MARTIN (Ataun) - ERGOIENA (Ataun)"],
      [ "0228", "ANDOAIN - NAVARRA"],
      //[ "0229", "RED DE DONOSTIA - SAN SEBASTIAN"],   // OSM tiene mejores datos
      [ "0230", "RED DE HONDARRIBIA"],
      [ "0231", "RED DE ORIO"],
      [ "0232", "EMBALSE DE ARRIARAN"],
      [ "0233", "EMBALSE DE LAREO"],
      [ "0234", "RED DE ZARAUTZ"],
      [ "0235", "EMBALSE DE URTATZA"],
      [ "0236", "EMBALSE DE IBAIEDER"],
      [ "0237", "EMBALSE DE BARRENDIOLA"],
      [ "0238", "EMBALSE DE AIXOLA"],
      [ "0239", "ARRASATE MONDRAGON - ARETXABALETA"],
      [ "0240", "ARETXABALETA - ESKORIATZA"],
      [ "0241", "AZPEITIA - AZKOITIA"],
      [ "0242", "RED DE HERNANI"],
      [ "0243", "LEZO - ERRENTERIA"],
      [ "0244", "IDIAZABAL - SEGURA"],
      [ "0245", "SEGURA - ZEGAMA"],
      [ "0246", "IDIAZABAL - KATEA"],
      [ "0247", "TOLOSA - ALEGIA"],
      [ "0248", "RED DE LASARTE-ORIA"],
      [ "0250", "ASTIGARRAGA - MARTUTENE"],
      [ "0251", "RED DE PASAIA"],
      [ "0252", "RED DE ANDOAIN"]
    ];

    function addB5MBidegorris() {
      BIDEGORRIS_LIST.each( function( bidegorriPair) {
        var code = bidegorriPair[ 0],
            name = bidegorriPair[ 1],
            gmlPath = "gml_b5m/T_" + code + ".gml";

        addGML( "B5M - " + name, gmlPath);
      });
    }

    // -- OSM ---------------------------------------------------------------------
    function addOSMBidegorris() {
      addGML( "OSM", "gml_osm/bardulia-bidegorriak.gml", new OpenLayers.Projection( "EPSG:4326"));
    }

    // ----------------------------------------------------------------------------
    function createMap() {
      window.b5map = new OpenLayersExt.Map( "bidegorri-map", {
        openLayersExt: {
          center: {
            lonLat: new OpenLayers.LonLat( -240619.17999948, 5334312.9049857),
            zoom: 10
          }
        }
      });
    }

    function addGML( title, path, projection) {
      var gmlLayer = new OpenLayers.Layer.Vector( "GML " + title, {
        projection: projection,   // si no se pasa el parámetro projection entonces será undefined
        protocol: new OpenLayers.Protocol.HTTP({
            url: path,
            format: new OpenLayers.Format.GML()
        }),
        strategies: [new OpenLayers.Strategy.Fixed()]
      });

      window.b5map.addLayer( gmlLayer);
    }

    // herramientas que necesitan de proxy
    //function disableTools() {
    //  [ ".whatIsThisItemActive", ".whatIsThisItemInactive",
    //    ".b5map-drawPanel-controlItemInactive", ".b5map-drawPanel-controlItemActive",
    //    "#b5map-pictometry"
    //  ].each( function( selector) {

    //    var e = $$0( selector);

    //    if( e) {
    //      e.hide();
    //    }
    //  });
    //}

    function isLocalMode() {
      return window.location.protocol == "file:" ||
             window.location.hostname == "localhost";
    }

    function initResizeHandler() {

      function resizeHandler() {
        var VERTICAL_ADJUST = 0,
            map = $$0( "#b5map-mapArea"),
            viewPortHeight = document.viewport.getHeight(),
            bodyHeight = $$0( "body").getHeight(),
            diffHeight = viewPortHeight - bodyHeight,
            mapHeight = map.getHeight(),
            newHeight = mapHeight + diffHeight - VERTICAL_ADJUST;

        /*
        console.log( "resizeHandler, ",
                     "viewPortHeight = ", viewPortHeight,
                     "bodyHeight = ", bodyHeight,
                     "diffHeight = ", diffHeight,
                     "mapHeight = ", mapHeight,
                     "newHeight = ", newHeight);
        */

        window.b5map.resize( undefined, newHeight);
        window.b5map.updateSize();
      }

      ( function() {
          Event.observe( window, "resize", resizeHandler);
          resizeHandler();
      }).delay( 1);   // esperamos un tiempo para que la página se estabilice
    }

    // ----------------------------------------------------------------------------
    Event.observe( window, "load", function() {
      createMap();
      //initResizeHandler();
      //disableTools();

      addOSMBidegorris();
      //addB5MBidegorris();   // *toDO* falla en Chrome

      /*
      ( function() {
        addOSMBidegorris();
        addB5MBidegorris();
      }).delay( 10);
      */

      if( isLocalMode()) {
        window.b5map.addControl( new OpenLayers.Control.LayerSwitcher());
      }
    });
})();

