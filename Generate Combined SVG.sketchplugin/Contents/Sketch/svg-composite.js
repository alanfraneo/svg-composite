var generateCompositeSVG = function(context){
  var sketch = context.api();
  var app = sketch.Application();
  var doc = context.document;
  var page = doc.currentPage();
  var docLocation = doc.fileURL().path().split(doc.displayName())[0];
  doc.showMessage("Exporting composite svg: "+ page.name());
  var artboards = page.artboards()
  var compositeSVGString = '';
  var htmlString = '';
  for (var j = 0; j < artboards.count(); j++) {
        var artboard = artboards[j];
        //check if artboard is marked for export, ignore others
        if (artboard.exportOptions().exportFormats().length > 0) {
            var idname = artboard.name();
            var artFrame = artboard.frame();
            var artboardheight  = artFrame.height();
            var artboardwidth = artFrame.width();
            idname = idname.replace(/\s+/g,"-");
            idname = idname.split("/").join("-");
            idname = idname.replace(/\-+/g,"-");
            var svgExporter = SketchSVGExporter.alloc().init();

            var svgData = svgExporter.exportLayers([artboard.immutableModelObject()]);
            log(artboard);
            log(artboard.hasBackgroundColor());
            var cssClass = 'lightbg';
            if(artboard.hasBackgroundColor()){
                cssClass = 'darkbg';
            }
            log(artboard.backgroundColor());
        
            
            var svgString = NSString.alloc().initWithData_encoding(svgData, NSUTF8StringEncoding);
            svgString = svgString.replace(/<svg[^>]*>/g, "<symbol id='"+idname+"' viewBox='0 0 "+artboardheight+" "+artboardwidth+"'>");
            svgString = svgString.replace(/ transform=\"translate\([0-9.,\s]{100,}\)\"/g, "");
            svgString = svgString.replace("</svg>", "</symbol>");
            log(svgString);
            compositeSVGString = compositeSVGString + svgString;
            htmlString = htmlString + '<div class="'+cssClass+'">\n<svg class="icon"><use xlink:href="#'+idname+'"></use></svg><span class="name">'+idname+'</span>\n</div>'
      }
  }
  var cssContent = getCSS(context);
  compositeSVGString = '<svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>' + compositeSVGString + '</defs></svg>';
  htmlString = '<html><head><title>Icon preview</title><style>'+cssContent+'</style></head><body><div class="header"><h1>Icon Preview</h1></div><div class="wrapper">' + compositeSVGString + htmlString + "</div></body></html>";
  var someString = [NSString stringWithFormat:"%@", compositeSVGString], filePath = docLocation+"compositeSVG.svg";
  [someString writeToFile:filePath atomically:true encoding:NSUTF8StringEncoding error:nil];
  var htmlFileContent = [NSString stringWithFormat:"%@", htmlString], filePath = docLocation+"IconPreview.html";
  [htmlFileContent writeToFile:filePath atomically:true encoding:NSUTF8StringEncoding error:nil];
  var file = NSURL.fileURLWithPath(filePath);
  NSWorkspace.sharedWorkspace().openFile(file.path());
  context.document.showMessage("Icons are exported in the same folder as your sketch file.");

}

var getCSS = function(context) {
    var sketch = context.api();
    var cssURL = sketch.resourceNamed("style.css");
    var fileManager = [NSFileManager defaultManager];
    if([fileManager fileExistsAtPath:[cssURL path]]) {
        return [NSString stringWithContentsOfFile:[cssURL path] encoding:NSUTF8StringEncoding error:nil];
    }
    log('file doesnt exist');
    return nil;
}