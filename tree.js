function $(id) {return document.getElementById(id)}

function idAndIndent(n,bookmarkItem,indent) {
  if (bookmarkItem.id=="root________" || bookmarkItem.id=="menu________") {
    console.log(n.toString()+bookmarkItem.id+indent.toString())
  }
}

function err(message) {
  $("errorText").innerHTML = message;
  $("errorText").style = "color: red;"
}

function newElement(bookmarkItem,indent) {
  if (bookmarkItem.id == "root________") {
    // console.log(bookmarkItem)
    // return
  }
  if (bookmarkItem.url) {
    var elm = document.createElement("a"); // bookmarks
    elm.href = bookmarkItem.url;
  } else {
    var elm = document.createElement("p"); // folders
  }
  elm.innerHTML = bookmarkItem.title;
  // elm.innerHTML = indent.toString()+" - "+bookmarkItem.title+" ("+bookmarkItem.id+")";
  elm.title = indent.toString()+" - "+bookmarkItem.id;
  elm.style = "margin: 0px; margin-left: " + indent*40 + "px;"

  if (bookmarkItem.url == "data:") {
    // horizontal rules turn into boxes when they have innerHTML
    // I elected to just overwrite the "elm" variable in this case
    var elm = document.createElement("hr"); // separators
    elm.align = "right";
    elm.width = $("bmDiv").clientWidth-indent*40 + "px";
  }
  $("bmDiv").appendChild(elm)
}

function traverseTree(bookmarkItem, indent, printingChildren) {
  if (printingChildren) {
    newElement(bookmarkItem,indent)
  }

  if (bookmarkItem.children) {
    indent++;
    for (const child of bookmarkItem.children) {
      // if (printingChildren || bookmarkItem.id == "toolbar_____") {
      if (printingChildren || bookmarkItem.id == "root________") {
        traverseTree(child, indent, true);
      } else {
        traverseTree(child, indent, false);
      }
    }
    indent--;
  }
  
}

function startTraversal(bookmarkItems) {
  traverseTree(bookmarkItems[0], 0, false);
}

function onRejected(error) {
  var elm = document.createElement("p");
  elm.innerHTML = `An error occured: ${error}`
  $("bmDiv").appendChild(elm)
}

let treePromise = browser.bookmarks.getTree();
treePromise.then(startTraversal, onRejected);
