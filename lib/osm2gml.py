#!/usr/bin/python
# based on a script from http://london.freemap.in/osm2gml_simple.py.txt
# modified to work with OSM 0.5 API by Christian Zietz
import sys, re, xml.sax
from xml.sax.handler import ContentHandler
from xml.etree.cElementTree import Element, SubElement, ElementTree

# export nodes (with name tag)
exportNodes = 0
# tags to export if 'exportAll' is NOT set
exportTags = ["name", "highway", "landuse", "ref"]
# export all tags?
exportAll = 1

class osm2gml (ContentHandler):
    def __init__ (self, fh):
        ContentHandler.__init__(self)
        self.fh = fh

    def startDocument (self):
        self.node = {}
        self.fields = {}
        self.current = None

    def startElement (self, name, attr):
        if name == 'node':
            self.node[attr["id"]] = (attr["lon"], attr["lat"])
            self.current = {'id': attr["id"]}
        elif name == 'tag' and self.current:
            k = re.sub(r'[^A-Za-z0-9]', '_', attr["k"])
            try:
                self.current[-1][k] = attr["v"]
            except:
                self.current[k] = attr["v"]
            self.fields[attr["k"]] = True
        elif name == 'way':
            self.current = {'id': attr["id"], 'nodes': []}
        elif name =='nd' and self.current:
            if self.node.has_key(attr["ref"]):
                self.current['nodes'].append(self.node[attr["ref"]])

    def endElement (self, name):
        if name == 'way':
            self.generateWay(self.current)
            self.current = None
        elif name == 'node':
            if exportNodes and self.current.has_key("name"):
                self.generateNode(self.current)
            self.current = None

    def generateWay (self, attr):
        featureMember = Element("gml:featureMember")
        feature = SubElement(featureMember, "way")
        FID = SubElement(feature, "osm_id")
        FID.text = str(attr["id"])
        geometryProperty = SubElement(feature, "gml:geometryProperty")
        lineString = SubElement(geometryProperty, "gml:LineString")
        coordinates = SubElement(lineString, "gml:coordinates")
        coordinates.text = " ".join(map(lambda x: "%s,%s" % x, attr['nodes']))
        for k, v in attr.iteritems():
            if (k != "nodes") and (k!="") and ((k in exportTags) or exportAll):
                SubElement(feature, "" + k).text = v
        ElementTree(featureMember).write(self.fh, "utf-8")
        self.fh.write("\n")

    def generateNode (self, attr):
        featureMember = Element("gml:featureMember")
        feature = SubElement(featureMember, "node")
        FID = SubElement(feature, "osm_id")
        FID.text = str(attr["id"])
        geometryProperty = SubElement(feature, "gml:geometryProperty")
        lineString = SubElement(geometryProperty, "gml:Point")
        coordinates = SubElement(lineString, "gml:coordinates")
        coordinates.text = ("%s,%s" % self.node[attr["id"]])
        for k, v in attr.iteritems():
            if (k!="") and ((k in exportTags) or exportAll):
                SubElement(feature, "" + k).text = v
        ElementTree(featureMember).write(self.fh, "utf-8")
        self.fh.write("\n")

if __name__ == "__main__":
    osmParser = osm2gml(sys.stdout)
    print '<?xml version="1.0" encoding="utf-8"?>'
    print '<gml:FeatureCollection xmlns:gml="http://www.opengis.net/gml"'
    print '    xmlns="http://www.openstreetmap.org/gml/">'
    xml.sax.parse( sys.stdin, osmParser )
    print '</gml:FeatureCollection>'
