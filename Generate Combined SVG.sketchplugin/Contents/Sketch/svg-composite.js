var generateCompositeSVG = function(context){
  var sketch = context.api();
  var app = sketch.Application();
  var doc = context.document;
  var page = doc.currentPage();
  var docLocation = doc.fileURL().path().split(doc.displayName())[0];
  doc.showMessage("Exporting composite svg: "+ page.name());
  var artboards = page.artboards()
  var compositeSVGString = '';
  for (var j = 0; j < artboards.count(); j++) {
      var artboard = artboards[j];
      //check if artboard is marked for export, ignore others
      if (artboard.exportOptions().exportFormats().length > 0) {
          var idname = artboard.name();
          idname = idname.replace(/\s+/g,"-");
          idname = idname.split("/").join("-");
          idname = idname.replace(/\-+/g,"-");
          var svgExporter = SketchSVGExporter.alloc().init();

          var svgData = svgExporter.exportLayers([artboard.immutableModelObject()]);
          var svgString = NSString.alloc().initWithData_encoding(svgData, NSUTF8StringEncoding);
          svgString = svgString.replace(/<svg(\s(width)?(height)?=\"[0-9\.e\+px]*\")*/g, "<symbol id='"+idname+"'");
          svgString = svgString.replace("</svg>", "</symbol>");
          compositeSVGString = compositeSVGString + svgString;
      }
  }
  compositeSVGString = '<svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>' + compositeSVGString + '</defs></svg>';
  var someString = [NSString stringWithFormat:"%@", compositeSVGString], filePath = docLocation+"compositeSVG.svg";
  [someString writeToFile:filePath atomically:true encoding:NSUTF8StringEncoding error:nil];
}
