function $(id) {return document.getElementById(id)}
function err(message) {
  $("errorText").innerHTML = message;
  $("errorText").style = "color: red;"
}

function newElement(bookmarkItem,indent) {
  // if (indent<=2) { // temporary decluttering measure
    if (bookmarkItem.url) {
      var elm = document.createElement("a"); // bookmarks
      elm.href = bookmarkItem.url;
      indent++
    } else {
      var elm = document.createElement("p"); // folders
    }
    elm.innerHTML = bookmarkItem.title;
    elm.title = bookmarkItem.id;
    // elm.innerHTML = indent.toString()+" - "+bookmarkItem.title;
    // elm.innerHTML = bookmarkItem.title+" ("+bookmarkItem.id+")";
    elm.style = "margin: 0px; margin-left: " + indent*40 + "px;"

    if (bookmarkItem.url == "data:") {
      var elm = document.createElement("hr"); // separators
      elm.align = "right";
      elm.width = $("bmDiv").clientWidth-indent*40 + "px";
    }

    $("bmDiv").appendChild(elm)
  // } // closing the temporary decluttering measure
}

function traverseTree(bookmarkItem, indent, printingChildren) {
  if (!bookmarkItem.url && bookmarkItem.title) {
    indent++;
    // if it's a folder, indent the next line
    // Don't do this for the root element (no title)
  }

  if (printingChildren) { newElement(bookmarkItem,indent) }

  if (bookmarkItem.children) {
    for (const child of bookmarkItem.children) {
      // if (printingChildren || bookmarkItem.id == "toolbar_____") {
      if (printingChildren || bookmarkItem.id == "root________") {
      // if (bookmarkItem.id == "root________") {
        traverseTree(child, indent, true);
      } else {
        traverseTree(child, indent, false);
      }
    }
  }
  indent--;
}

function printTree(bookmarkItems) {
  traverseTree(bookmarkItems[0], 0, false);
}

function onRejected(error) {
  newFold(`An error: ${error}`,0);
}

let treePromise = browser.bookmarks.getTree();
treePromise.then(printTree, onRejected);
